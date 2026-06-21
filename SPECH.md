# Habit Tracker

## 1. Overview

Habit Tracker es una aplicación web que permite a pacientes registrar hábitos diarios relacionados con su bienestar y a una nutrióloga monitorear el progreso de sus pacientes.

La aplicación tendrá tres roles:

* Patient
* Nutritionist
* Admin

Cada paciente podrá registrar información diaria relacionada con:

* Consumo de agua
* Ejercicio
* Horas de sueño

La nutrióloga podrá consultar el historial de hábitos de los pacientes asignados.

---

# 2. Goals

## Patient

* Registrarse.
* Iniciar sesión.
* Registrar hábitos diarios.
* Consultar historial de los últimos 30 días.
* Visualizar tendencias básicas.

## Nutritionist

* Iniciar sesión.
* Consultar lista de pacientes asignados.
* Consultar historial individual de cada paciente.

---

# 3. Roles

## Patient

Permisos:

* Ver su propio perfil.
* Crear registros diarios.
* Editar el registro del día actual.
* Consultar únicamente sus propios registros.
* Filtrar su historial por fecha o rango de fechas.

No puede:

* Editar registros de días anteriores.
* Ver pacientes.
* Ver información de otros usuarios.

---

## Nutritionist

Permisos:

* Ver pacientes asignados.
* Consultar hábitos de pacientes asignados.

No puede:

* Modificar registros históricos de pacientes.
* Acceder a pacientes no asignados.

---

## Admin

Permisos:

* Crear nuevos usuarios con cualquier rol (`PATIENT`, `NUTRITIONIST`, `ADMIN`).
* Consultar la lista de todos los usuarios (con filtro opcional por rol).

No puede:

* Acceder directamente a los registros de hábitos de los pacientes.
* Suplantar la identidad de otros usuarios.

---

# 4. Functional Requirements

## Authentication

El sistema debe soportar:

* Registro de paciente.
* Login.
* Refresh token.
* Logout.

---

## Daily Habit Tracking

Un paciente podrá registrar un único hábito diario por fecha.

Cada registro incluye:

| Field           | Type    |
| --------------- | ------- |
| date            | date    |
| waterIntakeMl   | integer |
| exerciseMinutes | integer |
| sleepHours      | decimal |

Un paciente puede editar el registro del día actual. No puede modificar registros de días anteriores.

---

## Dashboard

El paciente podrá visualizar:

* Últimos 30 días (por defecto).
* Consumo de agua.
* Minutos de ejercicio.
* Horas de sueño.

El paciente puede filtrar su historial por rango de fechas (`from` / `to`).

Si ya registró el hábito del día, el dashboard muestra un botón **Edit** para modificarlo.

---

## Nutritionist Dashboard

La nutrióloga podrá:

* Ver pacientes asignados.
* Abrir detalle individual.
* Consultar historial de hábitos.

---

# 5. Data Model

## User

| Field        | Type     |
| ------------ | -------- |
| id           | uuid     |
| email        | string   |
| passwordHash | string   |
| role         | enum     |
| createdAt    | datetime |
| updatedAt    | datetime |

Role values:

```text
PATIENT
NUTRITIONIST
ADMIN
```

> ADMIN users do not have a `patientProfile` or `nutritionistProfile`. The `fullName` field is `null` for ADMIN accounts.

---

## PatientProfile

| Field          | Type     |
| -------------- | -------- |
| id             | uuid     |
| userId         | uuid     |
| fullName       | string   |
| nutritionistId | uuid     |
| createdAt      | datetime |

---

## NutritionistProfile

| Field     | Type     |
| --------- | -------- |
| id        | uuid     |
| userId    | uuid     |
| fullName  | string   |
| createdAt | datetime |

---

## HabitEntry

| Field           | Type     |
| --------------- | -------- |
| id              | uuid     |
| patientId       | uuid     |
| date            | date     |
| waterIntakeMl   | integer  |
| exerciseMinutes | integer  |
| sleepHours      | decimal  |
| createdAt       | datetime |
| updatedAt       | datetime |

Constraint:

```text
patientId + date must be unique
```

Un paciente solo puede registrar una entrada por día.

---

## RefreshToken

| Field     | Type     |
| --------- | -------- |
| id        | uuid     |
| userId    | uuid     |
| tokenHash | string   |
| expiresAt | datetime |
| createdAt | datetime |

---

# 6. Authentication Strategy

## Access Token

JWT

Expiration:

```text
15 minutes
```

---

## Refresh Token

Expiration:

```text
7 days
```

Se almacenará en base de datos.

---

# 7. REST API

Base URL:

```text
/api/v1
```

---

# 8. Auth Endpoints

## Register Patient

POST

```http
/api/v1/auth/register
```

Request:

```json
{
  "email": "patient@test.com",
  "password": "Password123",
  "fullName": "John Doe"
}
```

Response:

```json
{
  "message": "Patient registered successfully"
}
```

Status:

```text
201 Created
```

---

## Login

POST

```http
/api/v1/auth/login
```

Request:

```json
{
  "email": "patient@test.com",
  "password": "Password123"
}
```

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "role": "PATIENT"
  }
}
```

Status:

```text
200 OK
```

---

## Refresh Token

POST

```http
/api/v1/auth/refresh
```

Status:

```text
200 OK
```

---

## Logout

POST

```http
/api/v1/auth/logout
```

Status:

```text
204 No Content
```

---

# 9. Patient Endpoints

## Create Habit Entry

POST

```http
/api/v1/habits
```

Request:

```json
{
  "date": "2026-06-19",
  "waterIntakeMl": 2500,
  "exerciseMinutes": 45,
  "sleepHours": 8
}
```

Status:

```text
201 Created
```

---

## Edit Habit Entry (today only)

PATCH

```http
/api/v1/habits/:id
```

Request (all fields optional):

```json
{
  "waterIntakeMl": 2500,
  "exerciseMinutes": 45,
  "sleepHours": 8
}
```

Status:

```text
200 OK
403 Forbidden — if the entry is from a past date or belongs to another patient
```

---

## Get Habit History

GET

```http
/api/v1/habits
```

Query Params:

```text
?days=30                             (default — last N days)
?from=2026-06-01&to=2026-06-21      (date range; overrides days)
?from=2026-05-01                    (open-ended range from date)
```

Status:

```text
200 OK
```

---

## Get Habit Detail

GET

```http
/api/v1/habits/:id
```

Status:

```text
200 OK
```

---

# 10. Nutritionist Endpoints

## List Assigned Patients

GET

```http
/api/v1/nutritionist/patients
```

Status:

```text
200 OK
```

---

## Patient Detail

GET

```http
/api/v1/nutritionist/patients/:patientId
```

Status:

```text
200 OK
```

---

## Patient Habit History

GET

```http
/api/v1/nutritionist/patients/:patientId/habits
```

Status:

```text
200 OK
```

---

# 10.1. Admin Endpoints

## Create User

POST

```http
/api/v1/admin/users
```

Request:

```json
{
  "email": "newuser@example.com",
  "password": "securepass",
  "role": "PATIENT",
  "fullName": "Jane Doe"
}
```

- `fullName` is required for `PATIENT` and `NUTRITIONIST`; omitted or `null` for `ADMIN`.

Status:

```text
201 Created
409 Conflict — if email is already registered
```

---

## List Users

GET

```http
/api/v1/admin/users
```

Query Params:

```text
?role=PATIENT      (optional — filter by role)
?role=NUTRITIONIST
?role=ADMIN
```

Status:

```text
200 OK
```

---

# 11. Authorization Rules

PATIENT:

```text
Can only access own habit entries.
```

NUTRITIONIST:

```text
Can only access assigned patients.
```

ADMIN:

```text
Can create and list users only.
```

Any unauthorized access:

```text
403 Forbidden
```

---

# 12. Validation

Todas las entradas externas deben validarse mediante Zod.

Ejemplos:

* email válido
* password mínima de 8 caracteres
* waterIntakeMl >= 0
* exerciseMinutes >= 0
* sleepHours entre 0 y 24

---

# 13. Error Handling

Formato estándar:

```json
{
  "message": "Validation failed",
  "errors": []
}
```

---

## Status Codes

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

---

# 14. Security Requirements

* Passwords almacenadas con bcrypt.
* JWT firmado con secret seguro.
* Refresh tokens almacenados de forma hasheada.
* Validación de ownership en todos los endpoints protegidos.

---

# 15. Mobile First Requirements

La interfaz debe ser completamente funcional en:

```text
320px+
```

Dispositivos principales:

* Android
* iPhone

---

# 16. Deployment

Backend:

* Render / Railway / Fly.io

Frontend:

* Vercel / Netlify / Render

Database:

* Neon / Railway PostgreSQL / Supabase

HTTPS obligatorio.

---

# 17. Out of Scope

No se incluye:

* Notificaciones por email.
* Exportación PDF.
* Offline sync.
