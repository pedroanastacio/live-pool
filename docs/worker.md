# Worker - Vote Processing

## Status

**Planned** - The worker application has not been implemented yet.

This document describes the planned architecture for background vote processing.

---

## Overview

The worker is responsible for consuming vote messages from RabbitMQ, processing them, and broadcasting real-time updates via WebSocket.

**Votes are anonymous** - there is no user identification or user-vote association.

---

## Technologies

- **Messaging Queue**: RabbitMQ (Consumer)
- **Cache**: Redis
- **Worker**: NestJS + TypeScript
- **Database**: PostgreSQL via Prisma
- **Real-time**: WebSocket
- **Testing**: Jest

---

## Architecture

```
+---------------------------------------------------+
|                     RabbitMQ                       |
|                                                    |
|   vote_cast_exchange (direct)                          |
|         |                                          |
|         v                                          |
|   vote_cast queue                                |
+---------------------------+------------------------+
                            |
                            v
+---------------------------------------------------+
|              Worker (apps/worker)                 |
|                                                    |
|   +--------------------------------------------+  |
|   |           VoteProcessor                    |  |
|   |                                            |  |
|   |  - Consume vote events                     |  |
|   |  - Persist to PostgreSQL                    |  |
|   |  - Update Redis cache                       |  |
|   |  - WebSocket broadcast                     |  |
|   +--------------------------------------------+  |
+---------------------------+------------------------+
                            |
              +-------------+-------------+
              v                           v
        PostgreSQL                WebSocket -> Clients
              |
              v
           Redis (cache)
```

---

## Simplified Architecture

```
Vote Event -> Worker -> PostgreSQL (persist)
                         -> Redis (update cache)
                         -> WebSocket (broadcast)
```

---

## Worker Functions

### VoteProcessor

- Consumes messages from `vote_cast` queue
- Validates vote integrity
- Persists votes to PostgreSQL
- Updates Redis cache for real-time results
- Broadcasts real-time updates via WebSocket

---

## Message Schema

### Vote Event (vote_cast queue)

```json
{
  "id": "uuid",
  "pollId": "uuid",
  "pollOptionId": "uuid"
}
```

---

## Redis Usage

- **Cache**: Real-time vote counts for fast reads
- **TTL**: Keys expire after poll closes

> See [Redis Cache Strategy](redis-cache.md) for detailed implementation.

---

## Data Flow

```
1. POST /votes (API)
       |
       v
2. EventDispatcher -> VoteCastEvent
       |
       v
3. RabbitMQ Producer -> vote_cast_exchange
       |
       v
4. VoteProcessor (Worker) <- vote_cast queue
       |
       +-> PostgreSQL (persist vote)
       |
       +-> Redis (update cache)
       |
       v
5. WebSocket -> Clients (real-time update)
```
