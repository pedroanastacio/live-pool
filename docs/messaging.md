# Messaging & Events

## Overview

LivePool uses an event-driven architecture to process votes asynchronously. The system combines an in-memory event dispatcher with RabbitMQ for message queuing.

Votes are **anonymous** - there is no user identification.

---

## RabbitMQ Responsibilities

RabbitMQ serves two main roles:

| Role         | Used By                | Purpose                          |
| ------------ | ---------------------- | -------------------------------- |
| **Producer** | API (`apps/api`)       | Publish vote events to the queue |
| **Consumer** | Worker (`apps/worker`) | Consume and process vote events  |

---

## Architecture

```
+-------------+                         +-------------+
|     API     |      Producer           |   Worker    |
|             |------------------------>|             |
| (NestJS)    |   vote_cast_exchange        | (NestJS)    |
|             |                         |             |
|             |   vote_cast queue    |             |
|             |<------------------------|             |
|             |      Consumer           |             |
+-------------+                         +-------------+
```

---

## Event System Architecture

```
+-------------+    +-------------+    +-------------------+
| Controller  |--> |  Event      |--> | VoteCastEvent     |
|             |    | Dispatcher  |    | Handler           |
+-------------+    +-------------+    +--------+----------+
                                                  |
                                                  v
                                        +-------------------+
                                        | RabbitMQ Producer |
                                        | (apps/messaging)  |
                                        +--------+----------+
                                                 |
                                                 v
                                        +-------------------+
                                        |    RabbitMQ       |
                                        |                   |
                                        | vote_cast_exchange    |
                                        |   (direct)        |
                                        |        |          |
                                        |        v          |
                                        | vote_cast      |
                                        |    queue         |
                                        +-------------------+
```

---

## Internal Events

### VoteCastEvent

The core event triggered when a vote is submitted.

```typescript
// apps/api/src/events/classes/vote-cast.event.ts

export class VoteCastEvent {
  readonly pollId: string;
  readonly pollOptionId: string;
  readonly votedAt: Date;

  constructor(data: { pollId: string; pollOptionId: string }) {
    this.pollId = data.pollId;
    this.pollOptionId = data.pollOptionId;
    this.votedAt = new Date();
  }
}
```

### Event Dispatcher

The `EventDispatcher` notifies registered handlers of events.

```typescript
// apps/api/src/events/event-dispatcher.ts

export class EventDispatcher {
  async notify<T extends IEvent>(event: T): Promise<void> {
    const handlers = this.getHandlers(event.constructor.name);

    await Promise.all(handlers.map((handler) => handler.handle(event)));
  }

  private getHandlers(eventName: string): IEventHandler<IEvent>[] {
    // Returns registered handlers for the event
  }
}
```

### Event Handler

```typescript
// apps/api/src/events/handlers/vote-cast.handler.ts

export class VoteCastEventHandler implements IEventHandler<IEvent> {
  async handle(event: VoteCastEvent): Promise<void> {
    // Publish to RabbitMQ via apps/messaging
    console.log("VoteCastEventHandler", event);
  }
}
```

---

## RabbitMQ Configuration [Planned]

### Exchanges

| Exchange             | Type   | Purpose            |
| -------------------- | ------ | ------------------ |
| `vote_cast_exchange` | direct | Vote event routing |

### Queues

| Queue       | Exchange           | Routing Key | Purpose                   |
| ----------- | ------------------ | ----------- | ------------------------- |
| `vote_cast` | vote_cast_exchange | vote.cast   | Process and persist votes |

---

## Message Formats

### Vote Event Message

```json
{
  "id": "uuid-v4",
  "pollId": "uuid-v4",
  "pollOptionId": "uuid-v4",
  "votedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## Flow: Vote Processing

```
1. POST /votes
   |
   +-> VotesController.create()
   |
   +-> VoteCastEvent constructor
   |
   +-> EventDispatcher.notify(event)
   |
   +-> VoteCastEventHandler.handle()
           |
           v
2. RabbitMQ Producer (apps/messaging)
           |
           v
3. vote_cast_exchange (direct)
           |
           v
4. vote_cast queue
           |
           v
5. Worker (VoteProcessor)
   |
   +-> PostgreSQL: Insert vote
   +-> Redis: Update cache (INCR)
   |
   v
6. WebSocket broadcast -> Clients
```

> **Note**: For detailed cache strategy, see [Redis Cache Strategy](redis-cache.md).

---

## Error Handling

### Dead Letter Queue

Failed messages are routed to a dead letter queue for investigation:

```yaml
# Planned configuration
queues:
  vote_cast:
    deadLetterExchange: dlx_vote_cast
    deadLetterRoutingKey: dlq.vote_cast
```

### Retry Strategy

1. **First Attempt**: Immediate processing
2. **Retry 1**: Wait 1 second
3. **Retry 2**: Wait 5 seconds
4. **Retry 3**: Wait 30 seconds
5. **Final Failure**: Move to DLQ

---

## Monitoring [Planned]

| Metric                  | Description               |
| ----------------------- | ------------------------- |
| `votes_processed_total` | Total votes processed     |
| `queue_lag`             | Messages waiting in queue |
| `processing_duration`   | Vote processing latency   |
