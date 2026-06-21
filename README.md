# Habit Tracker

Full-stack web application for daily habit tracking with three user roles: **PATIENT**, **NUTRITIONIST**, and **ADMIN**.

Patients log daily habits (water intake, exercise, sleep). Nutritionists view progress charts for their assigned patients. Admins create and manage user accounts. Mobile-first, deployed publicly over HTTPS.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start — Docker](#quick-start--docker)
- [Quick Start — Local Dev](#quick-start--local-dev)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Running Tests](#running-tests)
- [CI Pipeline](#ci-pipeline)
- [Deployment](#deployment)
- [Initial Accounts](#initial-accounts)

---

## Tech Stack

| Layer     | Technology                                                         |
|-----------|--------------------------------------------------------------------|
| Backend   | Node.js 20, TypeScript strict, Fastify v4, Prisma v5, Zod, bcrypt |
| Frontend  | React 18, TypeScript, Vite 5, TailwindCSS, TanStack Query, Recharts |
| Database  | PostgreSQL 16 (Neon in production)                                 |
| Auth      | JWT access token (15 min) + refresh token (7 days, hashed in DB)  |
| Infra     | Docker Compose (local), Render (backend), Vercel (frontend)        |
| CI        | GitHub Actions                                                     |

---

## Project Structure

```
habit-tracker/
├── apps/
│   ├── backend/          # Fastify API
│   │   ├── prisma/       # Schema, migrations, seed
│   │   └── src/
│   │       ├── modules/  # auth · users · habits · patients · nutritionists
│   │       ├── common/   # middleware · plugins · errors · utils
│   │       └── server.ts
│   └── frontend/         # React + Vite SPA
│       └── src/
│           ├── features/ # auth · habits · patients · admin
│           ├── pages/
│           ├── services/
│           ├── router/
│           └── lib/
├── packages/
│   └── shared/           # Zod schemas · DTOs · enums (shared between apps)
├── docs/
│   └── adr/              # Architecture Decision Records
├── .github/
│   └── workflows/
│       └── ci.yml
└── docker-compose.yml
```

Each backend module follows the same layout:

```
module/
├── routes.ts      # HTTP routes + preHandlers
├── controller.ts  # request/response mapping
├── service.ts     # business logic
├── repository.ts  # database access (Prisma)
├── schemas.ts     # Zod validation schemas
└── types.ts       # module-local types / DTOs
```

Backend modules: `auth` · `users` · `habits` · `patients` · `nutritionists` · `admin`

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose (for the containerised setup)

---

## Quick Start — Docker

The fastest path to a running stack:

```bash
# Clone and enter the repo
git clone <repo-url> habit-tracker
cd habit-tracker

# Copy env template and fill in the two required secrets
cp .env.example .env
# Edit .env and set JWT_SECRET and REFRESH_SECRET

# Build images and start all services
docker compose up --build

# In a separate terminal — run migrations (admin user is provisioned automatically)
docker compose exec backend npx prisma migrate deploy
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:4000  |
| Swagger  | http://localhost:4000/documentation |

---

## Quick Start — Local Dev

### 1. Install dependencies

```bash
npm ci
```

This installs all workspace dependencies from the root `package-lock.json`.

### 2. Start PostgreSQL

```bash
docker compose up db -d
```

Or point `DATABASE_URL` at an existing PostgreSQL 16 instance.

### 3. Configure environment

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
```

Set `DATABASE_URL`, `JWT_SECRET`, and `REFRESH_SECRET` (see [Environment Variables](#environment-variables)).

### 4. Generate Prisma client and run migrations

```bash
npm run db:generate -w @habit-tracker/backend
npm run db:migrate:dev -w @habit-tracker/backend
```

### 5. Start development servers

```bash
# Terminal 1 — backend (port 4000)
npm run dev:backend

# Terminal 2 — frontend (port 5173)
npm run dev:frontend
```

> The admin user (`ADMIN` role) is provisioned via migration and is already present in the database after running `prisma migrate deploy`. No seed script is needed.

---

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable        | Required | Description                                      |
|-----------------|----------|--------------------------------------------------|
| `DATABASE_URL`  | yes      | PostgreSQL connection string                     |
| `JWT_SECRET`    | yes      | Secret for signing access tokens (min 32 chars)  |
| `REFRESH_SECRET`| yes      | Secret for signing refresh tokens (min 32 chars) |
| `CORS_ORIGIN`   | no       | Allowed origin (default: `*`)                    |
| `PORT`          | no       | Port to listen on (default: `4000`)              |
| `LOG_LEVEL`     | no       | Fastify log level (default: `info`)              |
| `NODE_ENV`      | no       | `development` · `production` · `test`            |

Example:

```env
DATABASE_URL=postgresql://habit_user:habit_pass@localhost:5432/habit_tracker
JWT_SECRET=change-me-to-something-long-and-random-32chars
REFRESH_SECRET=also-change-me-to-something-long-32chars
CORS_ORIGIN=http://localhost:5173
```

### Frontend

Vite reads variables prefixed with `VITE_`:

| Variable           | Required | Description                |
|--------------------|----------|----------------------------|
| `VITE_API_BASE_URL`| no       | Backend base URL (default: `http://localhost:4000`) |

---

## Database

### Schema overview

```
User (id, email, passwordHash, role)
  ├── PatientProfile (fullName, nutritionistId?)
  │     └── HabitEntry (date, waterIntakeMl, exerciseMinutes, sleepHours)
  ├── NutritionistProfile (fullName)
  │     └── [assigned PatientProfiles]
  └── RefreshToken (tokenHash, expiresAt)
```

### Useful commands

```bash
# Generate Prisma client after schema changes
npm run db:generate -w @habit-tracker/backend

# Create and apply a new migration (dev only)
npm run db:migrate:dev -w @habit-tracker/backend

# Apply migrations in production / CI
npm run db:migrate:deploy -w @habit-tracker/backend

# Open Prisma Studio
npm run db:studio -w @habit-tracker/backend

# Run seed script
npm run db:seed -w @habit-tracker/backend
```

---

## API Reference

Base path: `/api/v1`

Swagger UI is available at `/documentation` in non-production environments.

### Auth — `/api/v1/auth`

| Method | Path       | Auth | Description                        |
|--------|------------|------|------------------------------------|
| POST   | `/register`| —    | Register a new PATIENT account     |
| POST   | `/login`   | —    | Login, receive access + refresh tokens |
| POST   | `/refresh` | —    | Exchange refresh token for new access token |
| POST   | `/logout`  | —    | Revoke refresh token               |

### Users — `/api/v1/users`

| Method | Path            | Auth      | Description              |
|--------|-----------------|-----------|--------------------------|
| GET    | `/me`           | Bearer    | Get current user profile |
| PATCH  | `/me`           | Bearer    | Update full name         |
| PATCH  | `/me/password`  | Bearer    | Change password          |

### Habits — `/api/v1/habits` _(PATIENT only)_

| Method | Path    | Auth   | Description                                |
|--------|---------|--------|--------------------------------------------|
| POST   | `/`     | Bearer | Create today's habit entry (one per day)   |
| PATCH  | `/:id`  | Bearer | Edit today's habit entry (today only)      |
| GET    | `/`     | Bearer | List habit history with optional filtering |
| GET    | `/:id`  | Bearer | Get a single habit entry                   |

Unique constraint: one entry per patient per calendar day.

#### `PATCH /api/v1/habits/:id` — Edit today's habit

Body (all fields optional, at least one must be provided):

```json
{ "waterIntakeMl": 2500, "exerciseMinutes": 45, "sleepHours": 8 }
```

Returns `403 Forbidden` if the entry belongs to another patient or if the entry date is not today. The patient can **only edit the current day's record**.

#### `GET /api/v1/habits` — Filter query params

| Param  | Type   | Default | Description                             |
|--------|--------|---------|-----------------------------------------|
| `days` | number | `30`    | Return entries from the last N days     |
| `from` | string | —       | Start date `YYYY-MM-DD` (inclusive)     |
| `to`   | string | —       | End date `YYYY-MM-DD` (inclusive)       |

When `from` or `to` is provided, `days` is ignored. Examples:

```
GET /api/v1/habits?days=7
GET /api/v1/habits?from=2026-06-01&to=2026-06-21
GET /api/v1/habits?from=2026-05-01
```

### Patients (nutritionist view) — `/api/v1/nutritionist` _(NUTRITIONIST only)_

| Method | Path                        | Auth   | Description                        |
|--------|-----------------------------|--------|------------------------------------|
| GET    | `/patients`                 | Bearer | List assigned patients             |
| GET    | `/patients/:patientId`      | Bearer | Get patient profile                |
| GET    | `/patients/:patientId/habits` | Bearer | Get patient habit history        |

### Nutritionists — `/api/v1/nutritionists` _(NUTRITIONIST only)_

| Method | Path                         | Auth   | Description                |
|--------|------------------------------|--------|----------------------------|
| POST   | `/patients/:patientId`       | Bearer | Assign a patient           |
| DELETE | `/patients/:patientId`       | Bearer | Unassign a patient         |

### Admin — `/api/v1/admin` _(ADMIN only)_

| Method | Path      | Auth   | Description                                      |
|--------|-----------|--------|--------------------------------------------------|
| POST   | `/users`  | Bearer | Create a new user with any role                  |
| GET    | `/users`  | Bearer | List all users, optionally filtered by role      |

#### `POST /api/v1/admin/users` — Create user

Body:

```json
{
  "email": "newuser@example.com",
  "password": "securepass",
  "role": "PATIENT",
  "fullName": "Jane Doe"
}
```

- `role`: `"PATIENT"` | `"NUTRITIONIST"` | `"ADMIN"`
- `fullName`: required for `PATIENT` and `NUTRITIONIST`; omitted or `null` for `ADMIN`

Returns `409 Conflict` if the email is already registered.

#### `GET /api/v1/admin/users` — List users

| Param  | Type   | Description                          |
|--------|--------|--------------------------------------|
| `role` | string | Optional filter: `PATIENT` · `NUTRITIONIST` · `ADMIN` |

Response: array of `AdminUserDto` objects:

```json
[
  {
    "id": "...",
    "email": "alice@example.com",
    "role": "NUTRITIONIST",
    "fullName": "Alice Smith",
    "createdAt": "2026-06-21T00:00:00.000Z"
  }
]
```

#### Token usage

Send the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The refresh token is stored in `localStorage` on the client and sent in the request body to `/api/v1/auth/refresh`.

---

## Running Tests

```bash
# All workspaces
npm test

# Backend only
npm run test -w @habit-tracker/backend

# Frontend only
npm run test -w @habit-tracker/frontend

# Watch mode (backend)
npm run test:watch -w @habit-tracker/backend
```

Backend tests are pure unit tests using mock repositories — no database connection required.

### Type-checking

```bash
# All workspaces
npm run lint

# Per workspace
npm run lint -w @habit-tracker/backend
npm run lint -w @habit-tracker/frontend
```

---

## CI Pipeline

GitHub Actions runs on every `push` and `pull_request` (`.github/workflows/ci.yml`).

Two parallel jobs:

```
backend:  npm ci → prisma generate → lint → test → build
frontend: npm ci → lint → test → build
```

No database service is needed in CI — all backend tests use mock repositories.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** pointing to the repo root.
2. Set **Root directory**: `apps/backend`
3. **Build command**: `npm ci && npx prisma generate && npm run build`
4. **Start command**: `npx prisma migrate deploy && node dist/server.js`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `REFRESH_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`

### Frontend — Vercel

1. Import the repository into Vercel.
2. Set **Root directory**: `apps/frontend`
3. **Build command**: `npm run build`
4. **Output directory**: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://<your-render-url>`

### Database — Neon PostgreSQL

1. Create a project on [neon.tech](https://neon.tech).
2. Copy the connection string into `DATABASE_URL` on Render.
3. Migrations run automatically on first deploy via `prisma migrate deploy`.

---

## Initial Accounts

The admin user is provisioned automatically by migration `20260621000001_seed_admin_user` when `prisma migrate deploy` runs. No extra script is required.

To register patient or nutritionist accounts, use the Admin UI (`/admin/users`) or the `POST /api/v1/admin/users` endpoint with an ADMIN token.
