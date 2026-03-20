# Queues and Workers - Voting Platform

## Technologies
- **Messaging Queue**: RabbitMQ
- **Cache / Locking**: Redis
- **Worker**: NestJS + TypeScript
- **Database**: PostgreSQL via Prisma
- **Testing**: Jest

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                        RabbitMQ                      │
│                                                      │
│  ┌───────────────────┐       ┌────────────────────┐  │
│  │ votes_exchange    │       │ votes_exchange     │  │
│  │   (direct)        │       │   (direct)         │  │
│  └─────────┬─────────┘       └──────────┬─────────┘  │
│            │                            │            │
│            ▼                            ▼            │
│  ┌───────────────────┐       ┌────────────────────┐  │
│  │ vote_events queue │       │ notification_queue │  │
│  └─────────┬─────────┘       └──────────┬─────────┘  │
└────────────┼────────────────────────────┼────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│    VoteProcessor        │    │    NotificationWorker    │
│    Worker               │    │    Worker                │
│                         │    │                          │
│  • Validate vote        │    │  • Receive events        │
│  • Deduplicate          │    │  • Push to WebSocket     │
│  • Persist to DB        │    │  • Log for audit         │
│  • Update Redis cache   │    │                          │
│  • Publish notification │    │                          │
└────────────┬────────────┘    └─────────────┬────────────┘
             │                               │
             ▼                               ▼
     PostgreSQL (votes)              WebSocket → Dashboard
```

## Worker Functions

### VoteProcessor
- Consumes messages from `vote_events` queue
- Validates vote integrity and prevents duplicates
- Persists votes to PostgreSQL
- Updates Redis cache for real-time results
- Publishes update event to `notification_queue`

### NotificationWorker
- Consumes messages from `notification_queue`
- Sends real-time updates via WebSocket to connected dashboards
- Maintains audit logs for all notifications

## Message Schema

### Vote Event (vote_events queue)
```json
{
  "voteId": "uuid",
  "userId": "uuid",
  "voteOption": "A",
  "voteTime": "2025-01-15T10:30:00Z"
}
```

### Notification Event (notification_queue)
```json
{
  "voteId": "uuid",
  "totalVotes": 123,
  "optionVotes": {
    "A": 50,
    "B": 73
  }
}
```

## Redis Usage
- **Cache**: Real-time vote counts for fast reads
- **Locking**: Distributed lock for vote deduplication