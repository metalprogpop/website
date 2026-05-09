FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/ ./shared/
COPY server/package.json ./server/
RUN pnpm install --filter server... --frozen-lockfile
COPY server/ ./server/
WORKDIR /app/server
