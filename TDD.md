# Technical Design Document (TDD)

# Habit Tracker

## 1. Objetivo

Desarrollar una aplicación web full-stack lista para producción destinada al seguimiento de hábitos diarios.
El sistema admite tres roles:

* PACIENTE
* NUTRICIONISTA
* ADMIN

Los pacientes pueden registrar sus hábitos diarios.
Los nutricionistas pueden ver el progreso de los pacientes que tienen asignados.
La aplicación debe estar optimizada para dispositivos móviles y poder implementarse públicamente.

---

# 2. Mandatory Technology Stack

## Backend

* Node.js 20+
* TypeScript
* Fastify
* Prisma
* PostgreSQL
* Zod
* JWT Authentication
* bcrypt

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* React Router
* TanStack Query
* React Hook Form
* Zod

## Shared Package

Debe contener:

* Esquemas de Zod
* DTO
* Enumeraciones
* Tipos compartidos

---

# 3. Repository Strategy

Utilizar una estructura de monorepo.

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

# 4. Backend Architecture

El backend debe seguir una arquitectura modular.

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
│   ├── types/
│   └── utils/
│
├── prisma/
│
└── server.ts
```

Cada módulo debe contener:

```text
module/

├── routes.ts
├── controller.ts
├── service.ts
├── repository.ts
├── schemas.ts
└── types.ts
```

Responsibilities:

routes → HTTP routes

controller → request/response mapping

service → business logic

repository → database access

schemas → Zod validation

types → local module types

---

# 5. Frontend Architecture

Frontend must follow feature-based architecture.

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

Business logic must not exist inside pages.

---

# 6. Authentication

Authentication uses:

* Access Token
* Refresh Token

Access Token

Expiration:

15 minutes

Refresh Token

Expiration:

7 days

Requirements:

* Refresh token stored hashed in database
* Never store raw refresh token in database
* Passwords hashed using bcrypt
* Minimum bcrypt rounds: 12

---

# 7. Authorization

Role-based access control (RBAC).

Roles:

PATIENT

NUTRITIONIST

ADMIN

Rules:

PATIENT can access only own resources.

NUTRITIONIST can access only assigned patients.

ADMIN can create and list users only.

Ownership validation must be enforced in service layer.

Authorization must never rely only on frontend validation.

---

# 8. Database Design

Models:

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

# 9. Habit Entry Rules

Each patient can create only one habit record per day.

Unique constraint:

(patientId, date)

Habit fields:

date

waterIntakeMl

exerciseMinutes

sleepHours

Future fields must be easy to add without breaking architecture.

Example future field:

mood

The architecture must support this extension.

### Edit Rule

A patient can only edit the habit entry for the **current calendar day** (UTC).

Attempting to edit an entry from any previous date must return `403 Forbidden`.

Ownership must be validated in the service layer before applying the update.

### History Filter Rule

The `GET /api/v1/habits` endpoint accepts optional `from` and `to` query parameters (format `YYYY-MM-DD`).

When `from` or `to` is provided, the `days` parameter is ignored and the date range bounds are used instead.

Both bounds are inclusive.

---

# 10. Validation

All external inputs must be validated using Zod.

Validate:

* request body
* route params
* query params

No request reaches service layer without validation.

Shared schemas must live in packages/shared.

Frontend and backend must reuse schemas whenever possible.

---

# 11. API Design

Base path:

/api/v1

Modules:

auth

patients

nutritionists

habits

admin

Controllers must return DTOs.

Prisma models must never be returned directly.

---

# 12. Error Handling

Centralized error handling only.

Do not use try/catch inside every route.

Create custom error classes.

Response format:

{
"message": "Validation failed",
"errors": []
}

Supported statuses:

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

# 13. Frontend State Management

Server State:

TanStack Query

Auth State:

React Context

Do not use Redux.

---

# 14. Forms

All forms must use:

React Hook Form

Zod Resolver

No manual validation logic.

---

# 15. Dashboard

Patient dashboard:

Last 30 days

Display:

* Water Intake
* Exercise Minutes
* Sleep Hours

Use Recharts.

---

# 16. Responsive Design

Mobile-first mandatory.

Minimum supported width:

320px

Primary breakpoint:

768px

Desktop breakpoint:

1024px

---

# 17. Security Requirements

Passwords:

bcrypt

JWT Secret:

environment variable

Refresh Secret:

environment variable

Never expose secrets to frontend.

Never trust role information sent by client.

Role must always be resolved from JWT.

---

# 18. Testing Requirements

Backend

Vitest

Required:

* Service tests
* Repository tests
* Auth tests
* Authorization tests

Critical tests:

* Patient A cannot access Patient B records.
* Patient cannot edit a habit entry from a past date (ForbiddenError).
* `findHabitsByPatientId` uses date-range bounds when `from`/`to` are provided.
* ADMIN can create PATIENT, NUTRITIONIST, and ADMIN users.
* `createUser` returns `ConflictError` on duplicate email.
* `listUsers` returns all users; filtered by role when `role` param is provided.

Frontend

Vitest

Required:

* Component tests
* Hook tests
* `useUpdateHabit` mutation tests (success, error, partial update)
* `CreateUserForm` component tests (role toggle, ADMIN hides fullName, validation, submission)
* `useCreateAdminUser` mutation tests (success, error, ADMIN without fullName)

---

# 19. CI/CD

GitHub Actions required.

Pipeline:

install

lint

test

build

Pipeline must execute on:

push

pull_request

---

# 20. Deployment

Backend:

Render

Frontend:

Vercel

Database:

Neon PostgreSQL

Environment variables must be documented.

---

# 21. Forbidden Decisions

Do NOT:

* Use any
* Use Prisma directly inside controllers
* Store refresh tokens in plain text
* Return Prisma entities directly
* Put business logic in React pages
* Skip Zod validation
* Use localStorage as source of authorization

---

# 22. Deliverables

Claude must generate:

* Complete backend structure
* Complete frontend structure
* Shared package
* Prisma schema
* Initial migrations
* Auth flow
* Validation layer
* Tests
* CI pipeline
* Dockerfiles
* README setup instructions

Claude must NOT invent additional business requirements outside this document.
