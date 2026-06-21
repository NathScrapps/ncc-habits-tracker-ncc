# =============================================================================
# Stage 1 — Builder
# Installs all deps, generates Prisma client, compiles TypeScript.
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first (all required for npm workspaces resolution)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

# Copy TypeScript base config and source packages
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/

# 1. Build the shared package (backend may import from it)
RUN npm run build -w @habit-tracker/shared

# 2. Generate Prisma client (must run before tsc — adds @prisma/client types)
RUN npm run db:generate -w @habit-tracker/backend

# 3. Compile TypeScript
RUN npm run build -w @habit-tracker/backend

# =============================================================================
# Stage 2 — Runner
# Installs only production dependencies, copies compiled output.
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy workspace manifests (required for npm workspaces to install prod deps)
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci --omit=dev

# Copy generated Prisma query engine (created by prisma generate in builder)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled packages
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy Prisma schema and migrations (needed for prisma migrate deploy at runtime)
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

EXPOSE 4000

# Run pending migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && node apps/backend/dist/server.js"]
