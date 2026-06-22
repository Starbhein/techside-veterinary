# Exploration: `technical-manual-dnp`

## Executive Summary

`techside-veterinary` is a NestJS/TypeScript backend API for a veterinary clinic. It supports appointment scheduling, medical records, prescriptions, payments, physician schedules/attendance, and an admin medical-history dashboard. The codebase is factually documented in `README.md` and `API-DOCS.md`; the Prisma schema in `prisma/schema.prisma` is the authoritative data model. This exploration inventories only information that can be traced to code, config, or committed documentation, and flags every gap where the DNP manual will need user input.

## Repository Map

```
techside-veterinary/
├── package.json              # Scripts, dependencies, Jest config
├── tsconfig.json             # TypeScript compiler options (ES2023, nodenext)
├── nest-cli.json             # NestJS CLI sourceRoot = src
├── eslint.config.mjs         # ESLint 9 + typescript-eslint + prettier
├── .prettierrc               # singleQuote, trailingComma: all
├── README.md                 # Setup guide, roles, high-level DB diagram
├── API-DOCS.md               # Full endpoint reference (updated 2026-06-21)
├── src/
│   ├── main.ts               # Bootstrap: CORS, helmet, Swagger, port
│   ├── app.module.ts         # Root module imports all feature modules
│   ├── config/               # env.validation.ts, cors.config.ts
│   ├── common/               # JwtAuthGuard, RolesGuard, Roles decorator,
│   │                         #   SanitizeInterceptor, HttpExceptionFilter
│   ├── auth/                 # login, register, verify-email, resend
│   ├── usuarios/             # Paginated user search
│   ├── personas/             # Authenticated profile (me)
│   ├── archivos/             # Local disk file upload service
│   ├── email/                # Resend integration + Bull email queue
│   ├── catalogos/            # Species, breeds, colors, etc.
│   ├── mascotas/             # Pet management
│   ├── mx-divisiones/        # Branch/catalog endpoints
│   ├── citas/                # Appointments, state machine, cron jobs
│   ├── medicos/              # Physicians, schedules, attendance
│   ├── recetas/              # Prescriptions
│   ├── consultas/            # Clinical visit data
│   ├── pagos/                # Payments by folio
│   ├── historial-medico/     # Medical history + PDF export
│   └── prisma/               # PrismaService
├── prisma/
│   ├── schema.prisma         # Full PostgreSQL model
│   ├── migrations/           # Two migrations (init + consultorio refactor)
│   └── seed.ts               # Seed script: branches, admin, catalogs, demo data
├── public/
│   ├── swagger-custom.css    # Swagger branding
│   ├── swagger-favicon.png
│   └── emailTemplates/       # cuentanueva.html, cuentaexistente.html
└── test/                     # Jest e2e tests (app, auth)
```

## Stack Inventory

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Runtime | Node.js | 20+ (per README) |
| Package manager | pnpm | 11.7.0 (`packageManager`) |
| Framework | NestJS | 11.0.x (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) |
| Language | TypeScript | 5.7.3, target ES2023, `moduleResolution: nodenext` |
| ORM | Prisma | 6.19.3 (`@prisma/client` + `prisma`) |
| Database | PostgreSQL | 15+ (per README); `provider = "postgresql"` in schema |
| Queue / cache | Redis + Bull | `bull` 4.16.5, `@nestjs/bull` 11.0.4, `ioredis` 5.11.1 |
| Auth | JWT + Passport | `@nestjs/jwt` 11.0.2, `passport-jwt` 4.0.1, `passport-local` 1.0.0, `bcrypt` 6.0.0 |
| Validation | Zod | 4.4.3 |
| Docs | Swagger/OpenAPI | `@nestjs/swagger` 11.0.0, `swagger-ui-express` 5.0.1 |
| Security | Helmet | 8.2.0 |
| Email | Resend | 6.12.4 |
| PDF | PDFKit | 0.19.0 |
| Scheduling | `@nestjs/schedule` | 6.1.3 |
| Testing | Jest + Supertest | Jest 30, ts-jest, supertest 7.0.0 |
| Lint/Format | ESLint 9 + Prettier | typescript-eslint, prettier 3.4.2 |

### NestJS Modules (from `app.module.ts`)

`ConfigModule`, `BullModule`, `ScheduleModule`, `PrismaModule`, `MxDivisionesModule`, `AuthModule`, `UsuariosModule`, `PersonasModule`, `ArchivosModule`, `EmailModule`, `CatalogosModule`, `MascotasModule`, `CitasModule`, `MedicosModule`, `RecetasModule`, `ConsultasModule`, `PagosModule`, `HistorialMedicoModule`.

Note: `@nestjs/throttler` is a dependency but the module is **commented out** in `app.module.ts`.

## Data Model Summary

### Enums

| Enum | Values |
|------|--------|
| `Rol` | `cliente`, `medico`, `admin` |
| `UsuarioStatus` | `activo`, `pendiente`, `inactivo` |
| `EstadoCita` | `pendiente_de_pago`, `pendiente`, `en_curso`, `inasistencia`, `completada`, `cancelada` |
| `EstadoPago` | `pendiente`, `pagada`, `cancelada` |
| `EstadoAsistencia` | `asistencia`, `falta`, `retardo`, `justificado`, `incapacidad` |
| `DiaSemana` | `domingo` … `sabado` |

### Key Entities and Relationships

- **MxDivision** → `Sucursal[]`
- **Persona** ↔ **Usuario** (1:1, `usuario.personaId` unique, cascade delete)
- **Usuario** → `Mascota[]`, `EmailVerificationToken[]`, `PasswordResetToken[]`, `Medico?`
- **Archivo** ↔ `Mascota` (profile photo, vaccination card)
- **Especie** → `Raza[]` → `Mascota[]`
- **Color**, **TipoPelo**, **PatronPelo`, **Comportamiento** → `Mascota[]`
- **CatalogoAlergia** ↔ `Mascota` via `MascotaAlergia`
- **Sucursal** → `Consultorio[]`, `Medico[]`, `Cita[]`, ↔ `Especialidad` via `SucursalEspecialidad`
- **Especialidad** → `Medico[]`, `SucursalEspecialidad[]`
- **Servicio** → `Cita[]`
- **Medico** → `MedicoHorario[]`, `MedicoAsistencia[]`, `Cita[]`, `Receta[]`
- **MedicoHorario** → linked to `Consultorio`
- **Cita** → `Receta?` (1:1), `Consulta?` (1:1), `Pago?` (1:1), `CitaEstadoHistorial[]`
- **Receta** → `DetalleReceta[]`

All primary keys are UUID (`@db.Uuid`) with `@default(uuid())`. Audit columns `created_at` / `updated_at` are mapped with `@@map`.

## Service/API Inventory

Base URL documented: `http://localhost:3000`. Swagger UI path: `/api/docs` (disabled when `NODE_ENV=production`).

| Module | Path Prefix | Key Endpoints | Role Guard Notes |
|--------|-------------|---------------|------------------|
| App | `/` | `GET /` | Public |
| Auth | `/auth` | `POST /login`, `POST /register`, `GET /verify`, `POST /resend-confirmation` | Login public; register allows optional JWT |
| Usuarios | `/usuarios` | `GET /` | `medico` or `admin` |
| Personas | `/personas` | `GET /me`, `PATCH /me` | Authenticated |
| Mascotas | `/mascotas` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id` | Authenticated; mutations `cliente/medico/admin` |
| Catálogos | `/catalogos` | `GET /especies`, `/razas`, `/colores`, `/tipos-pelo`, `/patrones-pelo`, `/comportamientos`, `/alergias`, `/servicios` | Authenticated |
| Sucursales | `/mx-divisiones`, `/sucursales` | `GET /mx-divisiones`, `GET /mx-divisiones/:id`, `GET /sucursales` | `/sucursales` public |
| Especialidades | `/api/v1/especialidades` | `GET /` | Authenticated |
| Médicos | `/api/v1/medicos` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `POST /:id/horarios`, `PATCH /:id/horarios/:horarioId`, `DELETE /:id/horarios/:horarioId`, `POST /:id/asistencias`, `GET /:id/asistencias`, `POST /:id/asistencias/salida`, `GET /:id/disponibilidad-dias`, `GET /:id/disponibilidad-slots` | Writes admin only; read authenticated |
| Citas | `/api/v1/citas` | `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/estado`, `DELETE /:id` | Create `cliente/admin`; state change `medico/admin`; delete `cliente/admin` |
| Recetas | `/api/v1/recetas` | `POST /`, `GET /`, `GET /cita/:citaId` | Write `medico/admin` |
| Consultas | `/api/v1/consultas` | `POST /`, `GET /`, `GET /:id`, `GET /cita/:citaId`, `PATCH /:id` | Write `medico/admin` |
| Pagos | `/api/v1/pagos` | `POST /`, `GET /`, `GET /:folioPago` | Authenticated; visibility scoped by role |
| Historial médico | `/mascotas/:mascotaId/historial` | `GET /`, `/citas-proximas`, `/citas-pasadas`, `/citas/:citaId`, `/peso`, `/pdf` | Authenticated; visibility scoped by role |
| Admin historial | `/admin/historial-mascotas` | `GET /` | `admin` only |

### Authentication

- JWT Bearer token (`Authorization: Bearer <token>`).
- Strategy: `passport-jwt`, extracting from auth header, validating `JWT_SECRET`, no expiration override.
- Password hashing: bcrypt, `BCRYPT_ROUNDS` default 12.
- Roles guard uses hierarchy: `cliente=1 < medico=2 < admin=3`; admin satisfies any role-restricted endpoint.

### State Machines

#### Appointment (`EstadoCita`)

```
pendiente_de_pago  ──pago──►  pendiente  ──cron (hora inicio)──►  en_curso
       │                         │                                   │
       │                         ▼                                   ▼
       └──────────────────── cancelada                        completada | inasistencia | cancelada
```

Allowed manual transitions via `PATCH /api/v1/citas/:id/estado`:
- `pendiente` → `en_curso`, `cancelada`
- `en_curso` → `completada`, `inasistencia`, `cancelada`
- `completada`, `inasistencia`, `cancelada` → none

Automatic transitions:
- `pendiente_de_pago` → `pendiente` on successful payment.
- `pendiente` → `en_curso` via cron every 5 minutes.
- `pendiente_de_pago` → `cancelada` via cron every hour if payment deadline exceeded.
- `en_curso` → `completada` automatically when both `Consulta` and `Receta` exist.

#### Payment (`EstadoPago`)

`pendiente` → `pagada` (manual `POST /api/v1/pagos`) or `cancelada` (cron / manual).

### Business Rules Implemented (from `citas.service.ts`)

| ID | Rule |
|----|------|
| V-01 | Only `cliente` or `admin` can create appointments. |
| V-02 | A client can only book their own pets; admin may book on behalf of another user via `emailUsuario`. |
| V-03 | Appointments must be at least 24 hours in the future and at most 2 months ahead. |
| V-04 | Date/time must be in the future. |
| V-05 | Only one non-cancelled appointment per pet + physician + day. |
| V-06 | No physician schedule overlap. |
| V-07 | Consultorio is derived from the physician's schedule for that weekday. |
| V-08 | No consultorio overlap and no patient overlap at the same branch. |
| V-09 | Cross-branch appointments require a 2-hour gap from other patient appointments. |
| —  | Price = `servicio.precioBase + medico.especialidadPrincipal.precio`. |
| —  | Folio format: `VET-YYYYMMDD-NNNN`. |

### Physician Schedule Rules

- Weekdays: `07:00-14:00` or `14:00-21:00`.
- Weekends: `07:00-23:00`.
- No overlap, no duplicate `(medicoId, diaSemana, horaInicio)`.

## Configuration and Deployment Facts

### Environment Variables (from `src/config/env.validation.ts`)

| Variable | Type | Default / Required | Purpose |
|----------|------|--------------------|---------|
| `NODE_ENV` | enum | `development` | `development` \| `production` \| `test` |
| `PORT` | number | `3000` | HTTP port |
| `DATABASE_URL` | string | **Required** | PostgreSQL connection |
| `JWT_SECRET` | string | **Required**, min 32 chars | JWT signing |
| `JWT_EXPIRES_IN` | string | `24h` | JWT expiration |
| `BCRYPT_ROUNDS` | number | `12` | Password hashing rounds |
| `RESEND_API_KEY` | string | **Required** | Resend email API |
| `REDIS_URL` | URL | `redis://localhost:6379` | Bull queue / Redis |
| `FRONTEND_CONFIRMATION_SUCCESS_URL` | URL | Optional | Post-verification redirect |
| `FRONTEND_CONFIRMATION_ERROR_URL` | URL | Optional | Post-verification error redirect |
| `FRONTEND_URL` | URL | Optional | CORS origin |
| `BACKEND_BASE_URL` | URL | `http://localhost:3000` | Email link base URL |

`.env.example` was blocked by the runtime safety policy, but the complete variable set and defaults above are recoverable from `env.validation.ts`.

### CORS (`src/config/cors.config.ts`)

- Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Allowed headers: `Content-Type, Authorization`.
- Origin resolution:
  - If `FRONTEND_URL` is set, use it.
  - Else if `NODE_ENV !== production`, allow `http://localhost(:port)`.
  - Else undefined (no CORS origin restriction configured in code).
- `credentials: false`.

### Security Middleware

- `helmet()` enabled globally.
- `SanitizeInterceptor` strips `<script>` tags and HTML tags from request bodies.
- `HttpExceptionFilter` normalizes errors; hides 500 stack traces from clients.

### Database Setup Scripts (from `package.json`)

| Script | Command |
|--------|---------|
| `db:generate` | `prisma generate` |
| `db:migrate` | `prisma migrate dev` |
| `db:deploy` | `prisma migrate deploy` |
| `db:seed` | `prisma db seed` |
| `db:studio` | `prisma studio` |

Seed entry point is `prisma/seed.ts` (set by Prisma convention; creates branches, admin user, catalogs, demo data).

### Application Run Scripts

| Script | Command |
|--------|---------|
| `start:dev` | `nest start --watch` |
| `start:debug` | `nest start --debug --watch` |
| `start:prod` | `node dist/main` |
| `build` | `nest build` |
| `test` | `jest` |
| `test:e2e` | `jest --config ./test/jest-e2e.json` |

### Deployment Artifacts

- **No Dockerfile** present.
- **No `docker-compose.yml`** present.
- **No CI/CD files** (`.github` directory absent).
- **No `pnpm-lock.yaml`** present in the working tree.
- Production deployment procedure is therefore not codified; only README instructions exist.

### Cron Jobs (`src/citas/citas-cron.service.ts`)

1. Every 5 minutes: transition `pendiente` → `en_curso` when appointment time arrived.
2. Every hour: auto-cancel unpaid appointments whose payment deadline has passed; payment deadline = min(`createdAt + 48h`, `appointmentStart - 24h`).

### Email Queue

- Queue name: `email-queue`.
- Jobs: `send-verification`, `send-account-exists`.
- Processor: `EmailQueueProcessor`.
- Sender address hard-coded: `VETEC <onboarding@resend.dev>`.

### File Uploads

- Local directory: `./uploads`.
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`.
- Files stored with `randomUUID()` filename; original extension preserved.

## Known Error Scenarios and Resolution Hints

Documented HTTP status codes (`API-DOCS.md`):

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| 400 | Bad Request | Validation failure, invalid date/time, missing documents |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Insufficient role / hierarchy |
| 404 | Not Found | Resource missing or not visible to current user |
| 409 | Conflict | Business conflict: schedule overlap, duplicate appointment, payment already processed |
| 429 | Too Many Requests | Rate limit (documented for auth but throttler module is commented out) |

### Code-Level Error Scenarios

- **Registration duplicate email/phone:** returns generic `201` message and sends `account-exists` email; does not leak existence.
- **Registration invalid file type:** `ArchivosService` rejects non-PDF/JPEG/PNG.
- **Login failure:** generic `401` "Credenciales inválidas".
- **Unverified/pending user:** cannot log in (`status !== activo`).
- **Appointment < 24h ahead:** `BadRequestException` with explicit message.
- **Appointment > 2 months ahead:** `BadRequestException`.
- **Same pet/physician/day conflict:** `ConflictException`.
- **Physician/consultorio/patient overlap:** `ConflictException`.
- **Cross-branch < 2h gap:** `ConflictException`.
- **Payment already paid/cancelled:** `ConflictException`.
- **Folio not found / unauthorized:** `NotFoundException` (same response for both to avoid leakage).
- **Resend not configured:** throws `Error: RESEND_API_KEY is not configured` at runtime.

## Gaps and Risks

| Gap | Impact | Needed From User |
|-----|--------|------------------|
| No production URLs / hostnames | Cannot document production endpoints | Production `FRONTEND_URL`, `BACKEND_BASE_URL` |
| No hardware sizing | Cannot document server requirements | CPU/RAM/storage specs per environment |
| No browser compatibility matrix | Cannot document client prerequisites | Supported browsers/versions |
| No backup/restore procedures | Risk for operations chapter | Backup strategy, retention policy |
| No Dockerfile / compose / CI-CD | Deployment chapter will be procedural only | Deployment platform and pipeline |
| No monitoring, alerting, or logging beyond NestJS Logger | Operations/troubleshooting incomplete | Logging stack, health-check endpoints |
| Throttler dependency installed but disabled | Documented rate limits are not enforced | Confirm whether to document as planned or remove |
| `.env.example` blocked by safety policy | Manual must rely on validation schema | Confirm all env vars and production secrets management |
| No `pnpm-lock.yaml` / reproducibility artifact | Cannot document exact dependency tree | Lockfile or registry constraints |
| License is `UNLICENSED` | Legal chapter incomplete | Intended license for the manual |
| No disaster recovery / failover | Business continuity section incomplete | RTO/RPO, failover procedures |

## Skill Resolution

- **Skill loading:** `paths-injected` — read `/home/styc/.config/opencode/skills/cognitive-doc-design/SKILL.md` as instructed.
- No fallback registry or additional skill discovery was needed.
