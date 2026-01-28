# Architecture

## Stack
- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Node.js 24 + Express + TypeScript
- **Database:** PostgreSQL (Docker dev) → Supabase (prod)
- **ORM:** Drizzle
- **Package Manager:** pnpm (workspaces)

## Project Structure
```
/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.tsx
│   └── vite.config.ts
├── server/          # Node backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── tsconfig.json
├── pnpm-workspace.yaml
├── docker-compose.yml
└── package.json
```

## Commands
```bash
docker-compose up           # Start all services with hot-reload
docker-compose up -d db     # DB only

pnpm install                # Install all dependencies
pnpm db:generate            # Generate migrations
pnpm db:migrate             # Run migrations
pnpm db:studio              # Drizzle Studio
pnpm build                  # Build client & server
```

## Docker Setup
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build: ./server
    volumes:
      - ./server/src:/app/src
      - ./server/package.json:/app/package.json
      - pnpm-store:/root/.local/share/pnpm/store
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://dev:dev@db:5432/app
    depends_on:
      - db
    command: pnpm dev

  client:
    build: ./client
    volumes:
      - ./client/src:/app/src
      - ./client/package.json:/app/package.json
      - pnpm-store:/root/.local/share/pnpm/store
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3001
    command: pnpm dev

volumes:
  pgdata:
  pnpm-store:
```

## Dockerfiles
```dockerfile
# client/Dockerfile & server/Dockerfile
FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json ./
RUN pnpm install
COPY . .
```

## Workspace Config
```yaml
# pnpm-workspace.yaml
packages:
  - 'client'
  - 'server'
  - 'shared'
```

## Environment Variables
```env
# .env (Docker dev)
DATABASE_URL=postgresql://dev:dev@db:5432/app
VITE_API_URL=http://localhost:3001

# .env.production (Supabase)
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
VITE_API_URL=https://api.yourapp.com
```

## Database Connection
```typescript
// server/src/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
```

## Hot Reload
```typescript
// client/vite.config.ts
export default defineConfig({
  server: { host: true, watch: { usePolling: true } }
});
```
```json
// server/package.json — Node 24 native TS + watch
{ "scripts": { "dev": "node --watch --experimental-strip-types src/index.ts" } }
```
