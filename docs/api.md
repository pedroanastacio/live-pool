# API - LivePool

## Overview

The API is a NestJS application that handles poll management, vote submission, and real-time updates.

**Votes are anonymous** - there is no user identification.

---

## Technologies

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL via Prisma
- **Messaging Queue**: RabbitMQ (planned)
- **Cache**: Redis (planned)
- **WebSocket**: Real-time updates (planned)
- **Testing**: Jest

---

## Folder Structure

```
/src
├── main.ts                   # Application entry point
│
├── modules/
│   ├── app/
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── app.module.ts
│   │   └── dto/
│   │       └── health-check-response.dto.ts
│   │
│   ├── polls/
│   │   ├── polls.controller.ts
│   │   ├── polls.service.ts
│   │   ├── polls.module.ts
│   │   └── dto/
│   │       ├── create-poll.dto.ts
│   │       ├── update-poll.dto.ts
│   │       └── poll-response.dto.ts
│   │
│   └── votes/
│       ├── votes.controller.ts
│       ├── votes.service.ts
│       ├── votes.module.ts
│       └── dto/
│           ├── create-vote.dto.ts
│           └── vote-response.dto.ts
│
├── events/                   # Event-driven architecture
│   ├── index.ts
│   ├── event-dispatcher.ts   # Event dispatch service
│   ├── events.module.ts
│   │
│   ├── classes/              # Event classes
│   │   ├── index.ts
│   │   └── vote-cast.event.ts
│   │
│   ├── handlers/             # Event handlers
│   │   ├── index.ts
│   │   └── vote-cast.handler.ts
│   │
│   └── types/                # Event type definitions
│       ├── index.ts
│       ├── event.type.ts
│       ├── event-handler.type.ts
│       └── event-dispatcher.type.ts
│
└── __tests__/                # Tests
    ├── unit/
    └── e2e/
```

---

## Module Description

| Module           | Description                    |
| ---------------- | ------------------------------ |
| `modules/app/`   | Health check endpoint          |
| `modules/polls/` | Poll CRUD operations           |
| `modules/votes/` | Vote submission (event-driven) |
| `events/`        | Event dispatcher and handlers  |

---

## REST Endpoints

### Polls

| Method | Route      | Description     |
| ------ | ---------- | --------------- |
| GET    | /polls     | List all polls  |
| POST   | /polls     | Create new poll |
| GET    | /polls/:id | Get poll by ID  |
| PATCH  | /polls/:id | Update poll     |
| DELETE | /polls/:id | Delete poll     |

### Votes

| Method | Route  | Description              |
| ------ | ------ | ------------------------ |
| POST   | /votes | Submit an anonymous vote |

### Health

| Method | Route | Description  |
| ------ | ----- | ------------ |
| GET    | /     | Health check |

---

## Event System

The API uses an event-driven architecture for vote processing:

```
POST /votes
    → VotesController
    → EventDispatcher.notify(VoteCastEvent)
    → VoteCastEventHandler
    → [Future: RabbitMQ Producer]
```

### VoteCastEvent

```typescript
class VoteCastEvent {
  pollId: string;
  pollOptionId: string;
}
```

### Event Flow

1. Client submits vote via `POST /votes`
2. Controller creates `VoteCastEvent`
3. `EventDispatcher` notifies registered handlers
4. Handler processes the vote (current: logs; future: publishes to queue)

---

## Future Integrations

### RabbitMQ (Planned)

- **Exchange**: `vote_cast_exchange` (direct)
- **Queue**: `vote_cast` → Processes votes asynchronously (Worker handles WebSocket broadcast)

### Redis (Planned)

- **Cache**: Real-time vote counts

### WebSocket (Planned)

- **Connection**: `/ws`
- **Events**:
  - `vote:update` → Vote count updates

---

## Testing

- **Unit**: Services, Controllers
- **Integration**: REST endpoints, Event system
