FROM node:24-alpine
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/ ./shared/
COPY client/package.json ./client/
RUN pnpm install --filter client... --frozen-lockfile
COPY client/ ./client/
WORKDIR /app/client
