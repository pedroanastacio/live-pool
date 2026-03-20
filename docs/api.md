# API - Voting Platform

## Technologies
- **Containerization / DevOps**: Docker (for API, DB, Redis, RabbitMQ)
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL via Prisma
- **Cache / PubSub**: Redis
- **Messaging Queue**: RabbitMQ
- **WebSocket**: Real-time updates
- **Testing**: Jest

## Folder Structure

```
/src
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── votes/
│   │   ├── votes.controller.ts
│   │   ├── votes.service.ts
│   │   ├── votes.module.ts
│   │   └── dto/
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   └── dashboard/
│       ├── dashboard.controller.ts
│       ├── dashboard.service.ts
│       └── dashboard.module.ts
│
├── common/                    # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
│
├── services/                  # Core services
│   ├── websocket.service.ts
│   └── rabbitmq.service.ts
│
├── workers/                   # Queue processors
│   ├── vote.processor.ts
│   └── notification.processor.ts
│
├── config/                    # Configuration
│   └── environment.ts
│
└── __tests__/                # Tests
    ├── unit/
    └── integration/
```

### Module Description

| Module | Description |
|--------|-------------|
| `modules/auth/` | Authentication (Google/Twitch OAuth) |
| `modules/votes/` | Vote CRUD and management |
| `modules/users/` | User profile and preferences |
| `modules/dashboard/` | Creator dashboard data |
| `common/` | Shared decorators, guards, filters |
| `services/` | WebSocket and RabbitMQ services |
| `workers/` | Background job processors |
| `config/` | Environment configuration |

## REST Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST   | /auth/login | Login via Google/Twitch |
| GET    | /votes | List user votes |
| POST   | /votes | Create new voting |
| GET    | /votes/:id | Voting details |
| POST   | /votes/:id/vote | Register vote |
| GET    | /votes/:id/results | Voting results |

## WebSocket
- **Connection**: `/ws`
- **Events**:
  - `vote:update` → Updates vote counts in real-time
  - `vote:created` → Notifies new votes
- **Authentication**: JWT via query parameter

## RabbitMQ
- **Exchange**: `votes_exchange` (direct)
- **Queues**:
  - `vote_events` → Processes votes and persists to DB
  - `notification_queue` → Notifies dashboard via WebSocket

## Testing
- **Unit**: Services, Controllers, Guards
- **Integration**: REST endpoints, WebSocket, Messaging