# LivePool Monorepo Structure

LivePool uses a **monorepo architecture** to manage all applications and shared code in a single repository.  
This approach improves scalability, code sharing, dependency management, and developer experience.

The monorepo is powered by:

- **Package Manager**: PNPM Workspaces
- **Build System**: Turborepo
- **Language**: TypeScript

---

## 📁 Root Structure
```
root/
│
├─ docs/ # 
├─ apps/ # Executable applications (deployable services)
├─ packages/ # Shared libraries used by apps
│
├─ turbo.json # Turborepo task pipeline configuration
├─ pnpm-workspace.yaml # PNPM workspace definition
├─ package.json # Root scripts and dev dependencies
└─ README.md
```

## 🚀 Apps Directory

The `apps` folder contains **standalone applications**.  
Each app has its own runtime, environment variables, and deployment pipeline.

### Structure
```
apps/
├─ ui/ # Frontend application
├─ api/ # Backend REST/WebSocket API
└─ worker/ # Background processing workers
```

### Applications

#### 🖥️ UI — Frontend
- Built with Next.js + TypeScript
- Responsible for dashboard and public voting pages
- Communicates with API via REST and WebSocket
- Independently deployable

#### 🔌 API — Backend Server
- Built with NestJS + TypeScript
- Handles authentication, poll management, voting, and real-time updates
- Integrates with PostgreSQL, Redis, and RabbitMQ
- Exposes REST and WebSocket endpoints

#### ⚙️ Worker — Background Processing
- Built with NestJS + TypeScript
- Consumes RabbitMQ queues
- Processes votes asynchronously
- Updates database and cache
- Emits real-time updates via WebSocket gateway


## 📦 Packages Directory

The `packages` folder contains **shared libraries** used across multiple apps.

These packages are not deployable by themselves.

### Structure
```
packages/
├─ types/ # Shared TypeScript types and interfaces
├─ ui-kit/ # Reusable UI components
├─ utils/ # Utility functions and helpers
├─ config/ # Shared Biome, TSConfig, Prettier configs
└─ sdk/ # Typed API client for frontend
```

### Shared Packages

#### 🧩 types
Centralizes shared contracts between frontend, backend, and workers:
- API request/response types
- WebSocket event types
- Domain models (Poll, Vote, User)

#### 🎨 ui-kit
Reusable design system components:
- Buttons
- Modals
- Form elements
- Layout components

Ensures consistent UI across the platform.

#### 🛠 utils
Shared helper functions:
- Date formatting
- Validation helpers
- Data transformations
- Logging helpers

#### ⚙️ config
Shared development configurations:
- ESLint rules
- Prettier formatting
- TypeScript base configs

Ensures consistent code style across all apps.

#### 🔗 sdk
Frontend SDK for consuming the API:
- Typed HTTP client
- Centralized endpoints
- Request/response typing
- Error handling abstraction

Improves frontend developer experience and type safety.