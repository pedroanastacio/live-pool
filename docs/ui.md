# UI - LivePool

## Overview

The UI layer of LivePool consists of two distinct parts:

1. **Design System** (`packages/ui`) - Reusable component library
2. **Web Application** (`apps/web`) - Next.js application for end users

---

## Design System - packages/ui

The design system provides foundational UI components used across the platform.

### Technologies

- **Framework**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui patterns
- **Testing**: Jest + React Testing Library

### Components

| Component    | Description                     |
| ------------ | ------------------------------- |
| `Button.tsx` | Reusable button with variants   |
| `Card.tsx`   | Container component for content |
| `Code.tsx`   | Code snippet display            |

### Usage

```tsx
import { Button, Card, Code } from "@live-pool/ui";

function MyComponent() {
  return (
    <Card>
      <Code>console.log("Hello")</Code>
      <Button>Click me</Button>
    </Card>
  );
}
```

---

## Web Application - apps/web [Planned]

A Next.js application for creators and voters.

### Technologies

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Real-time**: WebSocket Client
- **Authentication**: OAuth2 (Google, Twitch)

### Planned Features

#### Creator Dashboard

- Google/Twitch OAuth login
- Poll management (create, edit, delete)
- Vote listing and history
- Real-time results chart by option
- Poll status control (active/closed)

#### Public Voting Page

- Vote via shareable link
- Real-time updates with WebSocket
- Instant vote counting

### Planned Folder Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication group
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Dashboard group
│   │   │   ├── polls/
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   └── layout.tsx
│   │   ├── votes/
│   │   │   └── [id]/         # Public voting page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── polls/             # Poll-specific components
│   │   └── charts/            # Vote visualization
│   │
│   ├── lib/                   # Utilities
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── utils.ts
│   │
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts
│   │   └── voteStore.ts
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePolls.ts
│   │   └── useWebSocket.ts
│   │
│   └── types/                 # TypeScript types
│       └── index.ts
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

### API Integration

- **REST**: Poll CRUD, vote submission
- **WebSocket**: Real-time vote updates
- **Authentication**: JWT Bearer Token

### Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

---

## Component Architecture

The UI follows a compound component pattern:

```
┌─────────────────────────────────────────┐
│              pages/                      │
│  (Dashboard, Vote Page)                  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           components/                    │
│  (PollCard, VoteButton, ResultsChart)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           packages/ui/                    │
│  (Button, Card, Input - Design System)   │
└─────────────────────────────────────────┘
```
