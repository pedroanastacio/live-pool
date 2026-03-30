# LivePool Monorepo Structure

LivePool uses a **monorepo architecture** to manage all applications and shared code in a single repository.  
This approach improves scalability, code sharing, dependency management, and developer experience.

The monorepo is powered by:

- **Package Manager**: PNPM Workspaces
- **Build System**: Turborepo
- **Language**: TypeScript

---

## Root Structure

```
root/
│
├─ docs/                    # Documentation
├─ apps/                    # Executable applications (deployable services)
├─ packages/                # Shared libraries used by apps
├─ infra/                   # Infrastructure (Docker, configs)
│
├─ turbo.json               # Turborepo task pipeline configuration
├─ pnpm-workspace.yaml      # PNPM workspace definition
├─ package.json             # Root scripts and dev dependencies
└─ README.md
```

---

## Apps Directory

The `apps` folder contains **standalone applications**.  
Each app has its own runtime, environment variables, and deployment pipeline.

### Current Structure

```
apps/
├─ api/                    # Backend REST/WebSocket API
├─ messaging/              # RabbitMQ producer (in progress)
└─ web/                    # Next.js frontend [Planned]
```

### Applications

#### API — Backend Server

- **Framework**: NestJS + TypeScript
- **Purpose**: Handles poll management, voting, and real-time updates
- **Integrations**: PostgreSQL, Redis (planned), RabbitMQ (planned)
- **Endpoints**: REST and WebSocket
- **Status**: Active development

#### Messaging — Message Producer

- **Framework**: NestJS + TypeScript
- **Purpose**: RabbitMQ producer for async vote processing
- **Status**: Placeholder (to be implemented)

#### Web — Frontend Application [Planned]

- **Framework**: Next.js + TypeScript
- **Purpose**: Dashboard and public voting pages
- **Features**: OAuth authentication, real-time updates via WebSocket

---

## Packages Directory

The `packages` folder contains **shared libraries** used across multiple apps.

These packages are not deployable by themselves.

### Current Structure

```
packages/
├─ ui/                     # Reusable UI components (design system)
├─ database/               # Prisma ORM and database schema
├─ eslint-config           # Shared ESLint configurations
└─ typescript-config/      # Shared TypeScript configurations
```

### Shared Packages

#### UI — Design System

- **Location**: `packages/ui`
- **Purpose**: Reusable component library
- **Components**: Button, Card, Code
- **Tech**: TypeScript, TailwindCSS, shadcn/ui patterns

#### Database — Prisma Layer

- **Location**: `packages/database`
- **Purpose**: Database schema and ORM
- **Models**: Poll, PollOption, Vote
- **Tech**: Prisma, PostgreSQL

#### ESLint Config

- **Location**: `packages/eslint-config`
- **Purpose**: Shared ESLint rules
- **Configs**: Base, React, Next.js

#### TypeScript Config

- **Location**: `packages/typescript-config`
- **Purpose**: Shared TypeScript configurations

---

## Infrastructure Directory

The `infra` folder contains infrastructure configurations.

```
infra/
├─ docker-compose.yml      # PostgreSQL service
├─ package.json            # Infrastructure scripts
├─ .env                    # Environment variables
└─ .env.example            # Environment template
```

---

## Planned Additions

The following apps/packages are planned for future implementation:

### Apps

- **web**: Next.js frontend application
- **worker**: Background job processor for queue consumption

### Packages

- **utils**: Shared utility functions
- **types**: Centralized TypeScript types
- **sdk**: Typed API client for frontend
