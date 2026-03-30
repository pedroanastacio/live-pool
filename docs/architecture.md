# Architecture Overview

## System Design

LivePool is a real-time polling platform designed for streamers. The system follows an event-driven architecture with asynchronous vote processing.

**Votes are anonymous** - there is no user identification or user-vote association.

---

## High-Level Architecture

```
+------------+                              +------------------+
|  Clients   |                              |   Web Application |
|            |      REST / WebSocket        |   (Next.js)      |
+------------+------------------------------+------------------+
       |                                             |
       +---------------------+-----------------------+
                             |
                             v
+-----------------------------------------------------------+
|                      API (NestJS)                         |
|  +-------------+  +-------------+  +-------------------+  |
|  | Polls Module|  |Votes Module |  |  Events System   |  |
|  |   - CRUD    |  |  - Submit   |  | EventDispatcher |  |
|  +------+------+  +------+------+  +--------+--------+  |
|         |                 |                    |           |
|         +-----------------+--------------------+           |
|                          v                              |
|                 +----------------+                        |
|                 | RabbitMQ      |  Producer             |
|                 | (apps/messaging)                      |
|                 +----------------+                        |
+---------------------------+------------------------------+
                            |
                            v
+-----------------------------------------------------------+
|                     RabbitMQ                              |
|                                                           |
|   vote_cast_exchange (direct)                                 |
|         |                                                 |
|         v                                                 |
|   vote_cast queue                                       |
+---------------------------+------------------------------+
                            |
                            v
+-----------------------------------------------------------+
|              Worker (apps/worker) [Planned]               |
|                                                           |
|   +---------------------------------------------------+  |
|   |  VoteProcessor                                    |  |
|   |  - Consume vote events                            |  |
|   |  - Persist to PostgreSQL                           |  |
|   |  - Update Redis cache                             |  |
|   |  - WebSocket broadcast                            |  |
|   +---------------------------------------------------+  |
+---------------------------+------------------------------+
                            |
              +-------------+-------------+
              v                           v
        PostgreSQL                WebSocket -> Clients
              |
              v
           Redis (cache)
```

---

## Core Components

### API (`apps/api`)

The main backend service handling:

- **Poll Management**: Create, read, update, delete polls
- **Vote Submission**: Accept votes and dispatch events
- **Health Check**: Application status endpoint

**Technology**: NestJS + TypeScript

### Messaging (`apps/messaging`)

RabbitMQ service that provides:

- **Producer**: Publishes vote events from API
- **Consumer**: Consumes vote events in Worker

**Technology**: TypeScript + amqplib

### Worker (`apps/worker`)

Background processing service (planned):

- Consumes vote events from RabbitMQ queue
- Persists votes to PostgreSQL
- Updates Redis cache for real-time counts
- Broadcasts updates directly via WebSocket

**Technology**: NestJS + TypeScript

### Web (`apps/web`)

Next.js frontend application (planned):

- **Dashboard**: Creator poll management
- **Voting Page**: Public vote submission
- **Real-time**: WebSocket for live updates

**Technology**: Next.js + TypeScript + TailwindCSS

---

## Data Flow

```
1. Client
   |
   | POST /votes { pollId, pollOptionId }
   v
2. API - VotesController
   |
   | Creates VoteCastEvent
   v
3. API - EventDispatcher
   |
   | notify(VoteCastEvent)
   v
4. API - VoteCastEventHandler
   |
   | Publish to RabbitMQ
   v
5. RabbitMQ - vote_cast_exchange -> vote_cast
   |
   v
6. Worker - VoteProcessor
   |
   | Persist to PostgreSQL
   | Update Redis cache
   | Broadcast via WebSocket
   v
7. Clients receive real-time update
```

---

## Technology Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Frontend         | Next.js, TypeScript, TailwindCSS |
| Backend API      | NestJS, TypeScript               |
| Database         | PostgreSQL 18                    |
| ORM              | Prisma                           |
| Cache            | Redis (planned)                  |
| Message Queue    | RabbitMQ (planned)               |
| Real-time        | WebSocket                        |
| Containerization | Docker                           |

---

## Design Principles

### 1. Event-Driven

The system uses events for decoupled communication between components. Vote processing happens asynchronously via message queues.

### 2. Anonymous Votes

Votes are submitted anonymously - no user identification is stored with votes. Each vote submission contains only:

- `pollId`: The poll being voted on
- `pollOptionId`: The selected option

### 3. Real-time Updates

WebSocket connections provide instant vote count updates to connected clients without polling.

### 4. Scalability

The architecture supports horizontal scaling:

- API instances can be scaled independently
- Workers consume from shared queue
- Redis provides distributed caching

---

## Security Considerations

- **Authentication**: OAuth2 (Google, Twitch) for creators (dashboard access)
- **Authorization**: JWT Bearer tokens for protected endpoints
- **Input Validation**: DTOs with class-validator
