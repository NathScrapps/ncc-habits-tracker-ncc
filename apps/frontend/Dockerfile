# =============================================================================
# Stage 1 — Builder
# Installs deps and runs Vite build to produce static assets.
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

# Copy source files
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/frontend/ ./apps/frontend/

# Build shared package first (frontend may import from it)
RUN npm run build -w @habit-tracker/shared

# Build frontend (outputs to apps/frontend/dist)
RUN npm run build -w @habit-tracker/frontend

# =============================================================================
# Stage 2 — Runner
# Serves the compiled static assets with Nginx.
# =============================================================================
FROM nginx:1.27-alpine AS runner

# Copy compiled static assets
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Replace default nginx config with our SPA config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
