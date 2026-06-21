# TECHNICAL_SPEC.md

# Habit Tracker - Technical Design Specification

## Project Goal

Crea una aplicación web «full-stack» lista para producción destinada al seguimiento de hábitos, con tres roles de usuario:

* PACIENTE
* NUTRICIONISTA
* ADMIN

La aplicación debe estar diseñada pensando primero en los dispositivos móviles y ser accesible al público a través de HTTPS.

---

# Criterios de aceptación
* Registro y login funcionando con JWT + refresh.
* Paciente puede registrar hábitos diarios, ver su historial de 30 días con un mini-chart.
* Nutrióloga puede ver lista de sus pacientes y abrir el detalle de cada uno.
* Ningún paciente puede acceder a datos de otro paciente (probado con un test e2e).
* Deployada en producción, accesible públicamente con HTTPS.


# Architecture

The project must be implemented as a monorepo.

Structure:

```text
habit-tracker/

├── apps/
│   ├── backend/
│   └── frontend/
│
├── packages/
│   └── shared/
│
├── docs/
│
└── .github/
```

---

# Technology Stack

## Backend

* Node.js 20+
* TypeScript strict mode
* Fastify
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Zod Validation

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* React Router
* React Query
* React Hook Form
* Zod
* Base Colors: #d3c5f6, #3b2a60, #f0f0f0,  #ffffff

## Shared

Shared package contains:

* Zod schemas
* DTOs
* Enums
* API types

---

# Backend Architecture

```text
src/

├── modules/
│
│   ├── auth/
│   ├── users/
│   ├── patients/
│   ├── nutritionists/
│   ├── habits/
│   └── admin/
│
├── common/
│
│   ├── middleware/
│   ├── plugins/
│   ├── errors/
│   └── utils/
│
├── prisma/
│
└── server.ts
```

Each module contains:

```text
module/

├── routes.ts
├── controller.ts
├── service.ts
├── repository.ts
├── schemas.ts
└── types.ts
```

---

# Frontend Architecture

```text
src/

├── pages/
│
├── features/
│
│   ├── auth/
│   ├── habits/
│   ├── patients/
│   └── admin/
│
├── components/
│
├── services/
│
├── hooks/
│
├── layouts/
│
├── router/
│
└── lib/
```

---

# Authentication

Authentication flow:

1. User submits credentials.
2. Backend validates credentials.
3. Access token generated.
4. Refresh token generated.
5. Refresh token stored hashed in database.
6. Access token stored in memory.
7. Refresh token stored in localStorage.

Access Token:

```text
15 minutes
```

Refresh Token:

```text
7 days
```

---

# Authorization

PATIENT

Can:

* Create habit entries
* Edit today's habit entry
* View own habits
* Filter own habit history by date or date range

Cannot:

* Edit habit entries from past days
* View other patients
* View nutritionist data

NUTRITIONIST

Can:

* View assigned patients
* View assigned patient habits

Cannot:

* Access non-assigned patients

ADMIN

Can:

* Create new users with any role (`PATIENT`, `NUTRITIONIST`, `ADMIN`)
* List all users, optionally filtered by role

Cannot:

* Access patient habit data directly
* Impersonate other users

> ADMIN users have no `patientProfile` or `nutritionistProfile`. The `fullName` field is `null` for ADMIN accounts.

---

# Database Design

Entities:

User

PatientProfile

NutritionistProfile

HabitEntry

RefreshToken

Relationships:

User 1:1 PatientProfile

User 1:1 NutritionistProfile

NutritionistProfile 1:N PatientProfile

PatientProfile 1:N HabitEntry

User 1:N RefreshToken

---

# Validation

All external inputs must be validated using Zod.

No request reaches service layer without validation.

Validation must exist for:

* Body
* Params
* Query parameters

---

# Error Handling

Use centralized error handling.

Response format:

{
"message": "Validation failed",
"errors": []
}

Allowed HTTP statuses:

200
201
204
400
401
403
404
409
422
500

---

# API Versioning

All routes must start with:

/api/v1

---

# API Documentation

Swagger must be enabled in development.

Swagger must not be public in production.

---

# Security

Passwords:

bcrypt

Minimum rounds:

12

Refresh tokens:

Store hash only

Never store raw refresh tokens.

---

# Frontend State Management

React Query for server state.

React Context only for auth state.

No Redux.

---

# Charts

Use Recharts.

Patient dashboard must show:

* Water intake
* Exercise minutes
* Sleep hours

Last 30 days by default.

The patient can filter the chart history by date range using `from` / `to` inputs. When a filter is active, the chart displays only the selected range.

# Admin User Management

Admins access the system at `/admin/users`. The page provides:

* **Create user form** — role selector (PATIENT / NUTRITIONIST / ADMIN), email, password, and a conditionally shown Full name field (hidden for ADMIN role). On success the form resets and the user list refreshes automatically.
* **User table** — displays all users with name, email, role badge, and creation date. A role filter dropdown narrows the list.

Backend endpoints:

| Method | Path                   | Role  | Description                                   |
|--------|------------------------|-------|-----------------------------------------------|
| POST   | `/api/v1/admin/users`  | ADMIN | Create user; `fullName` required for non-ADMIN roles |
| GET    | `/api/v1/admin/users`  | ADMIN | List users; optional `?role=` filter          |

Frontend routing: ADMIN users are redirected to `/admin/users` after login. The route is protected by `ProtectedRoute requiredRole="ADMIN"`.

---

# Edit Habit

A patient can edit the habit entry for the **current day only** from the dashboard.

The dashboard shows an **Edit** button on today's summary card. Clicking it replaces the card with the pre-populated edit form.

The `PATCH /api/v1/habits/:id` endpoint enforces the today-only constraint server-side; the frontend restriction is supplementary.

---

# Testing

Backend:

Vitest

Required:

* Unit tests
* Auth tests
* Authorization tests

Frontend:

Vitest

Required:

* Component tests
* Hook tests

Critical E2E Test:

Patient A cannot access Patient B habits.

---

# CI

GitHub Actions

Run:

* lint
* test
* build

Before merge.

---

# Non Functional Requirements

Mobile-first

Responsive from:

320px

Accessibility:

Basic WCAG support

Performance:

Dashboard loads under 2 seconds with 1000 habit entries.

```
```
