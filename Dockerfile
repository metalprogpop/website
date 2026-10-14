# Production image: builds the client and serves it from the API server, so
# the site runs as one service on one origin, with per-episode link previews.
# The Dockerfiles in client/ and server/ are for the dev stack only.
#
#   docker build -t metalprogpop .
#   docker run -p 3001:3001 -e DATABASE_URL=... -e JWT_SECRET=... \
#     -e CLIENT_URL=https://<public site URL> -e RESEND_API_KEY=... \
#     -e MAGIC_LINK_BASE_URL=https://<public site URL> metalprogpop
#
# Apply migrations with the same image: append `pnpm db:migrate` to the run.

FROM node:24-alpine AS base
# Same pnpm as packageManager in the root package.json.
RUN corepack enable && corepack prepare pnpm@11.0.9 --activate
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY shared/ ./shared/

FROM base AS client
COPY client/package.json ./client/
RUN pnpm install --filter client... --frozen-lockfile
COPY client/ ./client/
# No VITE_API_URL: the API is on the same origin.
RUN pnpm --filter client build

FROM base AS server
COPY server/package.json ./server/
# Dev dependencies included: the server runs its TypeScript through tsx and
# migrations through drizzle-kit.
RUN pnpm install --filter server... --frozen-lockfile
COPY server/ ./server/
COPY --from=client /app/client/dist ./client-dist
WORKDIR /app/server
ENV NODE_ENV=production \
    PORT=3001 \
    CLIENT_DIST_DIR=/app/client-dist
EXPOSE 3001
CMD ["node", "--import", "tsx", "src/index.ts"]
