# Database - LivePool

## Overview

LivePool uses PostgreSQL as the primary database with Prisma as the ORM. The database layer is encapsulated in the `packages/database` package.

---

## Technology Stack

- **Database**: PostgreSQL 18
- **ORM**: Prisma
- **Package**: `@live-pool/database`

---

## Schema

### Models

```
┌─────────────────┐       ┌─────────────────┐
│     Poll        │       │   PollOption    │
├─────────────────┤       ├─────────────────┤
│ id              │──1:N──│ id              │
│ title           │       │ description     │
│ description     │       │ orderIndex      │
│ status          │       │ pollId (FK)     │
│ expiresAt       │       │ createdAt       │
│ createdAt       │       │ updatedAt       │
│ updatedAt       │       └────────┬────────┘
└────────┬────────┘                │
         │                          │ 1:1
         │ 1:N                      ▼
         │                    ┌─────────────┐
         └───────────────────▶│    Vote     │
                              ├─────────────┤
                              │ id           │
                              │ pollId (FK)  │
                              │ pollOptionId │
                              │ createdAt    │
                              │ updatedAt    │
                              └─────────────┘
```

---

## Poll

Represents a voting poll created by a streamer.

| Field         | Type                             | Description           |
| ------------- | -------------------------------- | --------------------- |
| `id`          | UUID                             | Primary key           |
| `title`       | String                           | Poll title            |
| `description` | String?                          | Optional description  |
| `status`      | Enum (ACTIVE, CANCELLED, CLOSED) | Poll status           |
| `expiresAt`   | DateTime                         | Expiration timestamp  |
| `createdAt`   | DateTime                         | Creation timestamp    |
| `updatedAt`   | DateTime                         | Last update timestamp |

### Relationships

- `options`: One-to-many with `PollOption`
- `votes`: One-to-many with `Vote`

---

## PollOption

Represents a single choice within a poll.

| Field         | Type     | Description           |
| ------------- | -------- | --------------------- |
| `id`          | UUID     | Primary key           |
| `description` | String   | Option text           |
| `orderIndex`  | Int      | Display order         |
| `pollId`      | UUID     | Foreign key to Poll   |
| `createdAt`   | DateTime | Creation timestamp    |
| `updatedAt`   | DateTime | Last update timestamp |

### Relationships

- `poll`: Many-to-one with `Poll`
- `votes`: One-to-many with `Vote`

---

## Vote

Represents a single vote (anonymous).

| Field          | Type     | Description               |
| -------------- | -------- | ------------------------- |
| `id`           | UUID     | Primary key               |
| `pollId`       | UUID     | Foreign key to Poll       |
| `pollOptionId` | UUID     | Foreign key to PollOption |
| `createdAt`    | DateTime | Creation timestamp        |
| `updatedAt`    | DateTime | Last update timestamp     |

### Constraints

Votes are anonymous - no user identification is stored.

### Relationships

- `poll`: Many-to-one with `Poll`
- `pollOption`: Many-to-one with `PollOption`

---

## Prisma Schema

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum PollStatus {
  ACTIVE
  CANCELLED
  CLOSED
}

model Poll {
  id          String       @id @default(uuid())
  title       String
  description String?
  status      PollStatus   @default(ACTIVE)
  expiresAt   DateTime     @map("expires_at")
  options     PollOption[]
  votes       Vote[]
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@map("poll")
}

model PollOption {
  id          String   @id @default(uuid())
  description String
  orderIndex  Int      @map("order_index")
  pollId      String   @map("poll_id")
  poll        Poll     @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes       Vote[]
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("poll_option")
}

model Vote {
  id            String      @id @default(uuid())
  pollId        String      @map("poll_id")
  pollOptionId  String      @map("poll_option_id")
  poll          Poll        @relation(fields: [pollId], references: [id])
  pollOption    PollOption  @relation(fields: [pollOptionId], references: [id])
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  @@map("vote")
}
```

---

## Package Usage

### Installation

```bash
pnpm add @live-pool/database
```

### Prisma Service

```typescript
import { PrismaService } from "@live-pool/database";

@Injectable()
export class PollsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Poll[]> {
    return this.prisma.poll.findMany({
      include: {
        options: true,
      },
    });
  }
}
```

### Generated Types

```typescript
import { Poll, PollOption, Vote } from "@live-pool/database/generated/prisma";

const poll: Poll = {
  id: "uuid",
  title: "Best Streamer?",
  // ...
};
```

---

## Migrations

### Running Migrations

```bash
cd packages/database
pnpm db:migrate
```

### Generating Client

```bash
cd packages/database
pnpm db:generate
```

### Available Migrations

| Migration                           | Description                        |
| ----------------------------------- | ---------------------------------- |
| `20260322165117_create_poll_tables` | Creates Poll and PollOption tables |
| `20260325192529_create_vote_table`  | Creates Vote table                 |

---

## Future Schema Additions

### User (Planned - for creator authentication only)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  provider  String   // google, twitch
  providerId String
  polls     Poll[]  // Polls created by this user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("user")
}
```

> Note: Users are only for creator authentication. Votes remain anonymous and are NOT linked to users.

---

## Queries

### Get Poll with Options and Vote Count

```typescript
const poll = await prisma.poll.findUnique({
  where: { id: pollId },
  include: {
    options: {
      include: {
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { orderIndex: "asc" },
    },
  },
});
```

### Submit Vote (with transaction)

```typescript
const vote = await prisma.$transaction(async (tx) => {
  // Check if poll is active
  const poll = await tx.poll.findUnique({ where: { id: pollId } });
  if (poll?.status !== "ACTIVE") {
    throw new Error("Poll is not active");
  }

  // Create vote
  return tx.vote.create({
    data: {
      pollId,
      pollOptionId,
    },
  });
});
```
