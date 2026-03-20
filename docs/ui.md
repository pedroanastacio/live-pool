# UI - Voting Platform for Streamers

## Technologies
- **Framework**: Next.js + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching & Caching**: TanStack Query
- **Testing**: Jest + React Testing Library
- **Authentication**: OAuth2 (Google, Twitch)
- **WebSocket Client**: Real-time vote updates

## Folder Structure
```
/src
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication group
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/       # Dashboard group
│   │   ├── dashboard/page.tsx
│   │   └── layout.tsx
│   ├── votes/
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home
│
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Table.tsx
│   ├── charts/
│   │   └── VoteChart.tsx
│   └── auth/
│       └── LoginButton.tsx
│
├── lib/                   # Utilities and configurations
│   ├── api.ts
│   ├── websocket.ts
│   └── utils.ts
│
├── stores/                # Zustand stores
│   ├── authStore.ts
│   └── voteStore.ts
│
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   └── useVotes.ts
│
├── types/                 # TypeScript types
│   └── index.ts
│
└── __tests__/             # Tests
    ├── unit/
    └── e2e/
```

### Directory Description

| Directory | Description |
|-----------|-------------|
| `app/` | Application routes (Next.js App Router) |
| `components/ui/` | Base shadcn/ui components |
| `components/charts/` | Vote visualization charts |
| `lib/` | API, WebSocket, and utility configurations |
| `stores/` | Global state with Zustand |
| `hooks/` | Custom hooks for reusable logic |
| `types/` | TypeScript type definitions |
| `__tests__/` | Unit and e2e tests |

## Main Features
1. **Creator Dashboard**
   - Google/Twitch login
   - Vote listing
   - Create new vote
   - Vote history
   - Results chart by option
   - Vote status (active / closed)
2. **Public Voting Page**
   - Simple voting via link
   - Real-time updates with WebSocket
   - Vote validation (1 per user)
   - Instant vote counting

## API Integration
- **REST**: Vote and user CRUD
- **WebSocket**: Real-time vote updates
- **Authentication**: JWT Bearer Token

## Testing
- Unit: Validate components, stores, hooks
- E2E: Login, vote creation, vote submission, charts