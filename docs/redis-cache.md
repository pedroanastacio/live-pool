# Redis Cache Strategy

## Overview

This document defines the Redis usage patterns for vote processing, covering caching strategies. Note: votes are anonymous - there is no user identification or user-vote association.

---

## Vote Model

Votes are **anonymous** and have no user association:

```typescript
// Vote submission payload
{
  pollId: "uuid",
  pollOptionId: "uuid"
}
```

There is no `userId` field - the system does not track who voted.

---

## Redis Usage

Redis serves one purpose in the system:

| Purpose   | Description           | Key Pattern             |
| --------- | --------------------- | ----------------------- |
| **Cache** | Real-time vote counts | `poll:{pollId}:results` |

---

## Cache Strategy

### Problem

Vote counts need to be displayed in real-time. Querying PostgreSQL for every request is slow.

### Solution: Write-Behind

```
┌─────────────────────────────────────────────────────────────┐
│                      Read Path                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client Request                                             │
│       │                                                     │
│       ▼                                                     │
│  GET poll:{pollId}:results from Redis                      │
│       │                                                     │
│   ┌────┴────┐                                               │
│   │ Hit?    │                                               │
│   └────┬────┘                                               │
│    Yes │ No                                                 │
│        ▼       ┌─────────────────┐                          │
│   Return      │ Query PostgreSQL │                          │
│   cached      │ Aggregate counts │                          │
│   data        └────────┬────────┘                          │
│                        │                                    │
│                        ▼                                    │
│               SET poll:{pollId}:results                     │
│                        │                                    │
│                        ▼                                    │
│               Return data                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│                     Write Path                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Process Vote                                               │
│       │                                                     │
│       ▼                                                     │
│  INSERT into PostgreSQL                                     │
│       │                                                     │
│       ▼                                                     │
│  INCR poll:{pollId}:results:{optionId}                     │
│       │                                                     │
│       ▼                                                     │
│  INCR poll:{pollId}:results:total                           │
│       │                                                     │
│       ▼                                                     │
│  Broadcast WebSocket                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Cache Key Design

| Key                                | Type   | Description         |
| ---------------------------------- | ------ | ------------------- |
| `poll:{pollId}:results:total`      | String | Total vote count    |
| `poll:{pollId}:results:{optionId}` | String | Votes per option    |
| `poll:{pollId}:results`            | Hash   | Full results object |

---

## Example

```typescript
// After processing a vote
const pollId = "uuid";
const optionId = "uuid";

await redis.incr(`poll:${pollId}:results:${optionId}`);
await redis.incr(`poll:${pollId}:results:total`);

// Get results
const results = await redis.hgetall(`poll:${pollId}:results`);
```

---

## TTL Strategy

- **Active Polls**: No TTL (updated on every vote)
- **Expired Polls**: 1 hour TTL after poll closes
- **Closed Polls**: Invalidate immediately when closed

---

## Complete Flow

```
1. Vote Event Received (pollId, pollOptionId)
        │
        ▼
2. Persist to PostgreSQL
        │
        ▼
3. Update Redis Cache
   INCR poll:{pollId}:results:{optionId}
   INCR poll:{pollId}:results:total
        │
        ▼
4. Broadcast via WebSocket
        │
        ▼
5. Return to client
```

---

## Alternative: Rate Limiting (Optional)

If you want to prevent vote spam from the same client, consider adding rate limiting at the API level:

```typescript
// API-level rate limiting
const RATE_LIMIT_TTL = 60; // 1 minute

async function canVote(ipAddress: string, pollId: string): Promise<boolean> {
  const key = `rate:${pollId}:${ipAddress}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_TTL);
  }

  return count <= 10; // Max 10 votes per minute per IP
}
```

This is handled at the API level, not in Worker.

---

## Error Handling

### Redis Connection Failure

```typescript
async function processVote(...) {
  try {
    // Process vote
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      // Fallback: Process directly, skip Redis cache
      await processDirectly();
    }
    throw error;
  }
}
```

### Cache Inconsistency

If Redis and PostgreSQL get out of sync:

1. **On Read**: If Redis miss, rebuild from PostgreSQL
2. **On Write**: Always write to PostgreSQL first (source of truth)
3. **Reconciliation**: Periodic job to sync counts

---

## Monitoring

| Metric                  | Description           |
| ----------------------- | --------------------- |
| `cache_hit_rate`        | Redis cache hit rate  |
| `cache_miss_rate`       | Redis cache miss rate |
| `votes_processed_total` | Total votes processed |
