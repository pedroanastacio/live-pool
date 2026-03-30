# Infrastructure

## Overview

LivePool infrastructure is managed via Docker containers and consists of required services (PostgreSQL) and planned services (Redis, RabbitMQ).

---

## Current Services

### PostgreSQL

**Status**: Implemented

| Property | Value         |
| -------- | ------------- |
| Image    | postgres:18   |
| Port     | 5432          |
| Database | livepool      |
| Volume   | postgres_data |

```yaml
# infra/docker-compose.yml (current)
services:
  postgres:
    image: postgres:18
    container_name: db_postgres
    restart: always
    ports:
      - "${DB_PORT}:5432"
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql
```

---

## Planned Services

### Redis

**Status**: Planned

| Property | Value              |
| -------- | ------------------ |
| Image    | redis:7-alpine     |
| Port     | 6379               |
| Purpose  | Cache, Idempotency |

```yaml
# Planned configuration
services:
  redis:
    image: redis:7-alpine
    container_name: livepool_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
```

### RabbitMQ

**Status**: Planned

| Property | Value                              |
| -------- | ---------------------------------- |
| Image    | rabbitmq:3-management-alpine       |
| Port     | 5672 (AMQP), 15672 (Management UI) |
| Purpose  | Message queue                      |
| User     | admin / admin                      |

```yaml
# Planned configuration
services:
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: livepool_rabbitmq
    restart: always
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
```

---

## Environment Variables

### Current (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=livepool
DB_ENV=development
```

### Planned Additions

```
# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin
RABBITMQ_VHOST=/

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PORT=3000
JWT_SECRET=your-secret-key
```

---

## Full Planned Docker Compose

```yaml
# infra/docker-compose.yml (planned)

services:
  postgres:
    image: postgres:18
    container_name: livepool_postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: livepool_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: livepool_rabbitmq
    restart: always
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

---

## Service Dependencies

```
┌─────────────┐
│    API      │
│  (NestJS)   │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │  RabbitMQ   │
│  (data)     │    │  (queue)    │
└─────────────┘    └──────┬──────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
              ┌─────────┐  ┌─────────┐
              │  Redis  │  │ Worker  │
              │ (cache) │  │         │
              └─────────┘  └─────────┘
```

---

## Running Infrastructure

### Start Services

```bash
cd infra
docker-compose up -d
```

### Check Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

### Stop Services

```bash
docker-compose down
```

---

## Health Checks

| Service    | Endpoint         | Expected           |
| ---------- | ---------------- | ------------------ |
| PostgreSQL | `pg_isready`     | OK                 |
| Redis      | `redis-cli ping` | PONG               |
| RabbitMQ   | Management UI    | 200 OK             |
| API        | `GET /`          | `{ status: "OK" }` |

---

## Development Tips

### Reset Database

```bash
docker-compose down -v     # Remove volumes
docker-compose up -d       # Recreate containers
cd packages/database
pnpm db:migrate deploy     # Run migrations
```

### Access PostgreSQL

```bash
docker exec -it livepool_postgres psql -U postgres -d livepool
```

### Access RabbitMQ Management

```
http://localhost:15672
Username: admin
Password: admin
```
