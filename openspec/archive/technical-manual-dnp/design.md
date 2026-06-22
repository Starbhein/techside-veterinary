# SDD Design: Manual Técnico y de Operación DNP para `techside-veterinary`

## Outcome

Entregar un manual técnico y de operación completo, en español mexicano, alineado a la *Guía para la Elaboración del Manual Técnico y de Operación del Sistema* del DNP Colombia. El manual vivirá como cuatro capítulos Markdown bajo `docs/manual-tecnico/`, con diagramas generados, artefactos de contenedores (`Dockerfile`, `docker-compose.yml`) y una versión PDF.

---

## 1. Design overview

### Approach

- **Code-first y trazable**: cada afirmación técnica se liga a un archivo real del repositorio (`src/`, `prisma/`, `package.json`, `README.md`, `API-DOCS.md`).
- **Sin invención de datos**: los vacíos operativos se marcan como `[PENDIENTE]` en lugar de inventar URLs, sizing, políticas o contactos.
- **Diagrams-as-code**: el diagrama ER se genera desde `prisma/schema.prisma`; los diagramas de componentes y despliegue se escriben en Mermaid y se renderizan con CLI.
- **Entrega incremental**: tres PRs encadenados para facilitar revisión por capítulos.

### Conventions

| Convention | Rule |
|------------|------|
| Language | Español mexicano (`es-MX`). Identificadores de código permanecen en inglés. |
| Traceability | `[Fuente: <path>]` or `[Fuente: <path>#<symbol>]` after every technical claim. |
| Placeholders | `[PENDIENTE: <what is missing>]` for operational gaps. |
| Code names | Keep NestJS/Prisma names verbatim (e.g., `JwtAuthGuard`, `EstadoCita`). |
| Tables | Prefer tables for stacks, endpoints, env vars, errors, and business rules. |
| Markdown | ATX headings, fenced code blocks, and relative image paths for PDF generation. |

### Tooling choices

| Purpose | Tool | Justification |
|---------|------|---------------|
| Manual source | Markdown | Native to repo, diff-friendly, version-controllable. |
| ER diagram | `prisma-erd-generator` | Single source of truth: `prisma/schema.prisma`. |
| Component / deployment diagrams | Mermaid CLI (`mmdc`) | Diagrams live as code, renderable in CI or locally. |
| PDF | `pandoc` + `xelatex`/`lualatex` | Mature, handles Spanish typography, TOC, cross-references, images. |
| Containers | Docker + Docker Compose | Standard in Node.js ecosystem; matches approved VPS reference deployment. |
| Package manager | `pnpm` 11.7.0 | Matches `packageManager` field in `package.json`. |

---

## 2. Content architecture

```text
techside-veterinary/
├── docs/
│   └── manual-tecnico/
│       ├── 01-descripcion-sistema.md
│       ├── 02-diseno-tecnico.md
│       ├── 03-despliegue-configuracion.md
│       ├── 04-resolucion-problemas.md
│       ├── README.md                 # How to build/render the manual
│       ├── diagramas/
│       │   ├── er-diagram.png
│       │   ├── componentes.mmd
│       │   ├── componentes.png
│       │   ├── despliegue.mmd
│       │   └── despliegue.png
│       ├── plantillas/
│       │   ├── pandoc-template.tex   # LaTeX template for PDF
│       │   └── portada.md            # Cover page source
│       └── pdf/
│           └── manual-tecnico.pdf
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
├── prisma/schema.prisma
└── src/
```

### New files to create

| File | Phase | Purpose |
|------|-------|---------|
| `docs/manual-tecnico/01-descripcion-sistema.md` | PR-1 | Capítulo 1 DNP. |
| `docs/manual-tecnico/02-diseno-tecnico.md` | PR-1 | Capítulo 2 DNP. |
| `docs/manual-tecnico/03-despliegue-configuracion.md` | PR-2 | Capítulo 3 DNP. |
| `docs/manual-tecnico/04-resolucion-problemas.md` | PR-2 | Capítulo 4 DNP. |
| `docs/manual-tecnico/README.md` | PR-1 | Build/render instructions. |
| `docs/manual-tecnico/diagramas/componentes.mmd` | PR-1 | Mermaid source for component diagram. |
| `docs/manual-tecnico/diagramas/componentes.png` | PR-1 | Rendered component diagram. |
| `docs/manual-tecnico/diagramas/despliegue.mmd` | PR-2 | Mermaid source for deployment diagram. |
| `docs/manual-tecnico/diagramas/despliegue.png` | PR-2 | Rendered deployment diagram. |
| `docs/manual-tecnico/plantillas/pandoc-template.tex` | PR-3 | LaTeX template for PDF. |
| `docs/manual-tecnico/plantillas/portada.md` | PR-3 | Cover page for PDF. |
| `docs/manual-tecnico/pdf/manual-tecnico.pdf` | PR-3 | Final rendered manual. |
| `Dockerfile` | PR-2 | Production image for NestJS API. |
| `docker-compose.yml` | PR-2 | Local/production-light orchestration. |
| `.dockerignore` | PR-2 | Exclude node_modules, coverage, etc. |

### Modified files

| File | Change | Justification |
|------|--------|---------------|
| `prisma/schema.prisma` | Add `generator erd { ... }` block | Required by `prisma-erd-generator` to emit the ER diagram. |
| `package.json` | Add dev dependencies and scripts (optional) | `prisma-erd-generator`, `@mermaid-js/mermaid-cli`, PDF scripts. |

---

## 3. Chapter-by-chapter design

### 3.1 `01-descripcion-sistema.md` — Descripción del Sistema

**Requirements mapped**: MAN-01, MAN-05, MAN-06, MAN-07, MAN-14.

| Section | Contents | Tables / Diagrams | Traceability examples |
|---------|----------|-------------------|----------------------|
| 1.1 Portada interna | Nombre, versión, fecha, autoría. | — | `[Fuente: package.json]` |
| 1.2 Introducción y contexto | Qué es `techside-veterinary` y para quién. | — | `[Fuente: README.md]` |
| 1.3 Nombre del sistema y versión | `techside-veterinary` `v0.0.1`. | — | `[Fuente: package.json]` |
| 1.4 Propósito general | Backend API para clínica veterinaria. | — | `[Fuente: README.md]` |
| 1.5 Usuarios y roles | `cliente`, `medico`, `admin` con descripción. | Roles table | `[Fuente: prisma/schema.prisma#Rol]` |
| 1.6 Resumen de módulos funcionales | Lista de módulos NestJS. | Modules table | `[Fuente: src/app.module.ts]` |
| 1.7 Objetivos del sistema | Agendamiento, historial médico, recetas, pagos, etc. | — | `[Fuente: README.md, API-DOCS.md]` |
| 1.8 Alcance y límites | Dentro: backend API. Fuera: frontend, CI/CD, monitoreo, backups automatizados reales. | In/out scope table | `[Fuente: proposal.md/spec.md]` |
| 1.9 Licencia | `UNLICENSED`; notar discrepancia si `README.md` menciona MIT. | — | `[Fuente: package.json]` |
| 1.10 Glosario mínimo | Términos como cita, consultorio, folio, mascota, receta. | — | `[Fuente: API-DOCS.md]` |

**Traceability convention used**:

```markdown
El sistema expone tres roles: `cliente`, `medico` y `admin` [Fuente: prisma/schema.prisma#Rol].
La jerarquía de roles es `cliente < medico < admin` [Fuente: src/common/guards/roles.guard.ts].
```

**Placeholder example**:

```markdown
La URL pública de producción del backend es `[PENDIENTE: definir BACKEND_BASE_URL de producción]`.
```

---

### 3.2 `02-diseno-tecnico.md` — Diseño Técnico

**Requirements mapped**: MAN-02, MAN-06, MAN-08, MAN-09 (ER + componentes), MAN-13, MAN-15.

| Section | Contents | Tables / Diagrams | Traceability examples |
|---------|----------|-------------------|----------------------|
| 2.1 Requerimientos funcionales y reglas de negocio | Reglas V-01..V-09 de citas y otras reglas. | Traceability table | `[Fuente: src/citas/citas.service.ts]` |
| 2.2 Stack tecnológico | Node.js 20+, pnpm 11.7, NestJS 11, TypeScript 5.7, Prisma 6.19, PostgreSQL 15, Redis 7, etc. | Stack table | `[Fuente: package.json, README.md]` |
| 2.3 Estándares de código y arquitectura | Módulos NestJS, guards (`JwtAuthGuard`, `RolesGuard`), `@Roles`, `SanitizeInterceptor`, `HttpExceptionFilter`, DTOs, pipes. | Architecture table | `[Fuente: src/common/, src/main.ts]` |
| 2.4 Modelo de datos | Diagrama ER + diccionario de datos completo. | ER image, data dictionary tables | `[Fuente: prisma/schema.prisma]` |
| 2.5 Funcionalidad y servicios | Prefijos de ruta, endpoints por rol, state machines. | Endpoints table, state transition tables | `[Fuente: API-DOCS.md, src/citas/, src/pagos/]` |
| 2.6 Autenticación y autorización | JWT Bearer, Passport, bcrypt, jerarquía de roles. | Auth flow table | `[Fuente: src/auth/, src/common/guards/]` |
| 2.7 Integraciones externas | Resend (email), almacenamiento local de archivos. | Integration table | `[Fuente: src/email/, src/archivos/]` |
| 2.8 Consideraciones de seguridad | helmet, sanitize, CORS, rate limiting planificado. | Security table | `[Fuente: src/main.ts, src/config/cors.config.ts]` |
| 2.9 Requisitos técnicos mínimos | Mínimos oficiales de stack; sizing real `[PENDIENTE]`. | Requirements table | `[Fuente: documentación oficial + MAN-15]` |

**State machine documentation shape**:

```markdown
### Máquina de estados `EstadoCita`

| Estado actual | Transición permitida | Disparador | Fuente |
|---------------|----------------------|------------|--------|
| `pendiente_de_pago` | `pendiente` | Pago exitoso | `[Fuente: src/citas/citas.service.ts]` |
| `pendiente` | `en_curso` | Cron cada 5 min al llegar la hora | `[Fuente: src/citas/citas-cron.service.ts]` |
| ... | ... | ... | ... |
```

**Endpoint table shape**:

```markdown
| Módulo | Ruta | Método | Rol | Descripción | Fuente |
|--------|------|--------|-----|-------------|--------|
| Citas | `/api/v1/citas` | POST | `cliente` / `admin` | Crear cita | `[Fuente: API-DOCS.md, src/citas/citas.controller.ts]` |
```

---

### 3.3 `03-despliegue-configuracion.md` — Despliegue y Configuración

**Requirements mapped**: MAN-03, MAN-06, MAN-07, MAN-10, MAN-15.

| Section | Contents | Tables / Diagrams | Traceability examples |
|---------|----------|-------------------|----------------------|
| 3.1 Organización de componentes | API, PostgreSQL, Redis/Bull, email queue, uploads. | Deployment diagram | `[Fuente: docker-compose.yml, src/app.module.ts]` |
| 3.2 Requisitos previos | Node.js, pnpm, PostgreSQL, Redis, Docker, Docker Compose. | Requirements table | `[Fuente: README.md, package.json]` |
| 3.3 Instalación local | Clonar, `pnpm install`, env, Prisma generate/deploy, seed, `pnpm run start:dev`. | Step list | `[Fuente: README.md]` |
| 3.4 Instalación con Docker Compose | `docker compose up --build`, healthchecks, migraciones. | Command blocks | `[Fuente: docker-compose.yml]` |
| 3.5 Variables de entorno | Tabla completa con tipo, obligatoriedad, default, propósito. | Env table | `[Fuente: src/config/env.validation.ts]` |
| 3.6 CORS y seguridad | Orígenes, métodos, headers, `helmet()`, `SanitizeInterceptor`, `HttpExceptionFilter`. | Config table | `[Fuente: src/config/cors.config.ts, src/main.ts]` |
| 3.7 Procedimiento de despliegue en VPS | Orden de servicios, `.env`, certificado `[PENDIENTE]`, proxy `[PENDIENTE]`. | Procedure list | `[Fuente: proposal.md]` |
| 3.8 Población inicial de datos | `prisma/seed.ts`, qué crea. | — | `[Fuente: prisma/seed.ts]` |
| 3.9 Respaldo y restauración | `pg_dump` diario, `BGSAVE` Redis, retención 30 días, comandos genéricos. | Backup table | `[Fuente: spec.md]` |
| 3.10 Verificación post-despliegue | `GET /`, Swagger `/api/docs` (dev), healthchecks. | Checklist | `[Fuente: src/main.ts, Dockerfile]` |

**Environment variable table shape**:

```markdown
| Variable | Tipo | Obligatoria | Default | Propósito | Fuente |
|----------|------|-------------|---------|-----------|--------|
| `NODE_ENV` | enum | No | `development` | Ambiente de ejecución | `[Fuente: src/config/env.validation.ts]` |
| `DATABASE_URL` | string | Sí | — | Conexión PostgreSQL | `[Fuente: src/config/env.validation.ts]` |
```

---

### 3.4 `04-resolucion-problemas.md` — Resolución de Problemas

**Requirements mapped**: MAN-04, MAN-06, MAN-12.

| Section | Contents | Tables | Traceability examples |
|---------|----------|--------|----------------------|
| 4.1 Proceso de soporte | Cómo reportar, niveles, logs. | — | `[Fuente: proposal.md]` |
| 4.2 Códigos HTTP | 400, 401, 403, 404, 409, 429. | Error codes table | `[Fuente: API-DOCS.md]` |
| 4.3 Registro y autenticación | Email/telefono duplicado, login fallido, usuario pendiente, JWT inválido. | Scenario table | `[Fuente: src/auth/, src/usuarios/]` |
| 4.4 Agendamiento de citas | <24h, >2 meses, conflictos de horario/consultorio/médico, gap cross-branch. | Scenario table | `[Fuente: src/citas/citas.service.ts]` |
| 4.5 Pagos | Pago ya procesado, folio no encontrado. | Scenario table | `[Fuente: src/pagos/pagos.service.ts]` |
| 4.6 Carga de archivos | Tipo MIME inválido, tamaño, directorio `uploads/`. | Scenario table | `[Fuente: src/archivos/archivos.service.ts]` |
| 4.7 Operativos | API no inicia, PostgreSQL no responde, Redis no responde, contenedores no levantan. | Scenario table | `[Fuente: docker-compose.yml, src/main.ts]` |
| 4.8 Recolección de logs | `docker compose logs`, logs de NestJS, niveles. | Command blocks | `[Fuente: README.md]` |
| 4.9 Escalamiento | `[PENDIENTE: canales de soporte]` | — | — |

**Error scenario table shape**:

```markdown
| Escenario / Error | Síntoma | Causa probable | Solución paso a paso | Fuente |
|-------------------|---------|----------------|----------------------|--------|
| Conflicto de cita | HTTP 409 | Superposición de médico, consultorio o paciente | Revisar disponibilidad en `GET /api/v1/medicos/:id/disponibilidad-slots` y reintentar | `[Fuente: src/citas/citas.service.ts, API-DOCS.md]` |
```

---

## 4. Diagram strategy

### 4.1 ER diagram

| Attribute | Decision |
|-----------|----------|
| Tool | `prisma-erd-generator` (Prisma generator). |
| Source | `prisma/schema.prisma` — single source of truth. |
| Output | `docs/manual-tecnico/diagramas/er-diagram.png` |
| Generator block to add | ```generator erd { provider = "prisma-erd-generator" output = "../docs/manual-tecnico/diagramas/er-diagram.png" }``` |
| Regeneration command | `pnpm run db:generate` |
| Alternative | If generator fails, export to Mermaid via `@mermaid-js/prisma-erd-generator` and render with `mmdc`. |

### 4.2 Component diagram

| Attribute | Decision |
|-----------|----------|
| Tool | Mermaid CLI (`mmdc`). |
| Source | `docs/manual-tecnico/diagramas/componentes.mmd` |
| Output | `docs/manual-tecnico/diagramas/componentes.png` |
| Render command | `npx -y @mermaid-js/mermaid-cli mmdc -i docs/manual-tecnico/diagramas/componentes.mmd -o docs/manual-tecnico/diagramas/componentes.png -b transparent` |
| Contents | NestJS modules, `JwtAuthGuard`, `RolesGuard`, `SanitizeInterceptor`, `HttpExceptionFilter`, `PrismaService`, `BullModule`, `ScheduleModule`, external PostgreSQL/Redis/Resend. |

### 4.3 Deployment diagram

| Attribute | Decision |
|-----------|----------|
| Tool | Mermaid CLI (`mmdc`). |
| Source | `docs/manual-tecnico/diagramas/despliegue.mmd` |
| Output | `docs/manual-tecnico/diagramas/despliegue.png` |
| Render command | `npx -y @mermaid-js/mermaid-cli mmdc -i docs/manual-tecnico/diagramas/despliegue.mmd -o docs/manual-tecnico/diagramas/despliegue.png -b transparent` |
| Contents | VPS/host, Docker network `vetec-network`, containers `api`, `postgres`, `redis`, named volumes `postgres_data`, `redis_data`, bind mount `./uploads`, placeholder proxy/balanceador. |

---

## 5. Dockerfile design

### Base image and stages

| Decision | Value |
|----------|-------|
| Base image | `node:20-alpine` (lightweight, Node 20 LTS). |
| Stages | `deps` → `build` → `production` |
| Package manager | `pnpm` 11.7.0 via `corepack enable` (matches `packageManager`). |
| Port | `EXPOSE 3000` (overridable by `PORT` env). |
| User | `node` (non-root) in `production` stage. |
| Healthcheck | `HEALTHCHECK CMD wget -qO- http://localhost:${PORT:-3000}/ || exit 1` |
| Start command | `CMD ["node", "dist/main"]` |

### Stage details

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json .
RUN corepack enable && pnpm install --frozen-lockfile=false

FROM node:20-alpine AS build
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm run db:generate && pnpm run build

FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
RUN mkdir -p uploads && chown -R node:node uploads
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/ || exit 1
CMD ["node", "dist/main"]
```

### Handling missing `pnpm-lock.yaml`

- The repo currently has **no** `pnpm-lock.yaml`.
- **Design choice**: do not fail the build. Use `pnpm install --frozen-lockfile=false` in `deps` stage so Docker can resolve dependencies.
- **Risk**: non-reproducible installs.
- **Mitigation**: document in `03-despliegue-configuracion.md` that the team should commit `pnpm-lock.yaml` as soon as possible and switch the Dockerfile to `--frozen-lockfile`.

### Prisma in Alpine

- Prisma requires `openssl` and `libc6-compat` on Alpine.
- The `db:generate` step runs in `build` stage; query engine is copied with `node_modules` to `production` stage.
- If runtime engine errors appear, add `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` to `generator client` in `schema.prisma`.

---

## 6. `docker-compose.yml` design

### Services

| Service | Image / Build | Ports | Env | Volumes | Healthcheck | Depends on |
|---------|---------------|-------|-----|---------|-------------|------------|
| `api` | `build: .` | `3000:3000` | `.env` | `./uploads:/app/uploads` | `wget -qO- http://localhost:3000/ \|\| exit 1` | `db` healthy, `redis` healthy |
| `db` | `postgres:15` | — | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `postgres_data:/var/lib/postgresql/data` | `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB` | — |
| `redis` | `redis:7` | — | — | `redis_data:/data` | `redis-cli ping \| grep PONG` | — |

### Networks and volumes

```yaml
networks:
  vetec-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Dependency order

1. `db` and `redis` start first and report healthy.
2. `api` starts only after both dependencies are healthy (`condition: service_healthy`).
3. Migrations are applied manually or via startup command (see below).

### Migration handling

- **Default `api` command**: run `node dist/main`.
- **Recommended deployment step**: after `docker compose up -d`, execute:
  ```bash
  docker compose exec api pnpm run db:deploy
  docker compose exec api pnpm run db:seed
  ```
- **Alternative**: set `command: sh -c "pnpm run db:deploy && node dist/main"` for local/CI environments. This must be documented as optional because `db:deploy` requires write access to the schema/migrations state.

### `.dockerignore`

```text
node_modules
dist
.git
.github
coverage
.vscode
.env
.env.*
!.env.example
uploads
*.md
!README.md
```

---

## 7. PDF generation design

### Recommended tool

| Tool | Use case | Command |
|------|----------|---------|
| `pandoc` + `xelatex`/`lualatex` | Primary; best typography, TOC, numbering. | See below. |
| `md-to-pdf` | Fallback if LaTeX is unavailable; Node-only. | Documented as alternative. |

### Pandoc command

```bash
pandoc \
  docs/manual-tecnico/plantillas/portada.md \
  docs/manual-tecnico/01-descripcion-sistema.md \
  docs/manual-tecnico/02-diseno-tecnico.md \
  docs/manual-tecnico/03-despliegue-configuracion.md \
  docs/manual-tecnico/04-resolucion-problemas.md \
  -o docs/manual-tecnico/pdf/manual-tecnico.pdf \
  --pdf-engine=xelatex \
  --template=docs/manual-tecnico/plantillas/pandoc-template.tex \
  --toc \
  --toc-depth=3 \
  --number-sections \
  -V geometry:margin=2.5cm \
  -V lang=es-MX
```

### Template approach

- `plantillas/pandoc-template.tex`: custom LaTeX template with logo placeholder `[PENDIENTE: logo]`, header/footer, page numbers, and Spanish hyphenation.
- `plantillas/portada.md`: title page with system name, version, date, and `[PENDIENTE]` fields for client/author.

### Handling images

- Markdown image syntax: `![Diagrama ER](diagramas/er-diagram.png)`.
- Pandoc converts these to LaTeX `figure` environments automatically.
- Ensure image paths are relative to the chapter files or use a `--resource-path` flag:
  ```bash
  --resource-path=docs/manual-tecnico:.
  ```

### Optional npm script

Add to `package.json`:

```json
"manual:pdf": "pandoc docs/manual-tecnico/plantillas/portada.md docs/manual-tecnico/01-descripcion-sistema.md docs/manual-tecnico/02-diseno-tecnico.md docs/manual-tecnico/03-despliegue-configuracion.md docs/manual-tecnico/04-resolucion-problemas.md -o docs/manual-tecnico/pdf/manual-tecnico.pdf --pdf-engine=xelatex --template=docs/manual-tecnico/plantillas/pandoc-template.tex --toc --toc-depth=3 --number-sections -V geometry:margin=2.5cm -V lang=es-MX"
```

---

## 8. Delivery plan / chained PRs

| PR | Contents | Files | Est. changed lines | Review focus |
|----|----------|-------|--------------------|--------------|
| **PR-1: Estructura y capítulos 1-2** | Capítulo 1, capítulo 2, README del manual, ER diagram, component diagram, generator block. | `docs/manual-tecnico/01-descripcion-sistema.md`, `docs/manual-tecnico/02-diseno-tecnico.md`, `docs/manual-tecnico/README.md`, `docs/manual-tecnico/diagramas/componentes.mmd`, `docs/manual-tecnico/diagramas/componentes.png`, `docs/manual-tecnico/diagramas/er-diagram.png`, `prisma/schema.prisma`, `package.json` | ~750 | Technical accuracy, traceability, data dictionary completeness. |
| **PR-2: Capítulos 3-4 y contenedores** | Capítulo 3, capítulo 4, deployment diagram, `Dockerfile`, `docker-compose.yml`, `.dockerignore`. | `docs/manual-tecnico/03-despliegue-configuracion.md`, `docs/manual-tecnico/04-resolucion-problemas.md`, `docs/manual-tecnico/diagramas/despliegue.mmd`, `docs/manual-tecnico/diagramas/despliegue.png`, `Dockerfile`, `docker-compose.yml`, `.dockerignore` | ~900 | Operational correctness, container build, healthchecks, env variable coverage. |
| **PR-3: PDF y ajustes finales** | LaTeX template, cover page, PDF artifact, npm scripts, fixes from review. | `docs/manual-tecnico/plantillas/pandoc-template.tex`, `docs/manual-tecnico/plantillas/portada.md`, `docs/manual-tecnico/pdf/manual-tecnico.pdf`, `package.json`, possibly chapter fixes | ~350 | PDF rendering, formatting, final acceptance criteria. |
| **Total** | — | — | **~2,000** | — |

### Review budget note

The default review budget is 400 changed lines, but Markdown documentation for a full DNP manual naturally exceeds that. Each PR remains reviewable by chapter/diagram; if the user wants stricter line limits, PR-1 and PR-2 can be split further by section.

---

## 9. Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| No `pnpm-lock.yaml` | Non-reproducible Docker builds and inaccurate dependency tree in manual. | Dockerfile uses `--frozen-lockfile=false`; manual documents the gap and recommends committing the lockfile. |
| Prisma engine on Alpine | Runtime query-engine errors in container. | Install `openssl`/`libc6-compat`; add `binaryTargets` if needed; test `docker compose up` in PR-2. |
| Large markdown diffs | PRs exceed review line budget. | Split by chapter/artifact; use tables and signposting to ease review. |
| ER generator drift | Diagram becomes stale after schema changes. | Regenerate via `pnpm run db:generate`; version `.mmd` sources as fallback. |
| PDF requires LaTeX | Not all contributors have `xelatex`/`lualatex`. | Provide `md-to-pdf` fallback; document system dependencies. |
| Missing operational data | Manual may look incomplete with many `[PENDIENTE]`. | Use placeholders consistently and explain why each is pending; avoid invented values. |
| License inconsistency (`README.md` MIT vs `package.json` UNLICENSED`) | Legal ambiguity. | Document `UNLICENSED` as authoritative source and flag discrepancy. |
| Throttler commented out | Manual may overstate rate limiting. | Document as planificado/activo en `main` but not currently registered globally. |
| Docker migration order | `api` may start before migrations run. | Use `depends_on` with healthchecks; run `db:deploy` manually or via optional startup command. |

---

## 10. Skill resolution

- **Skill loading**: `paths-injected` — read `/home/styc/.config/opencode/skills/cognitive-doc-design/SKILL.md` as instructed.
- **Patterns applied**:
  - Lead with the answer (outcome and quick path at the top).
  - Progressive disclosure (overview → architecture → chapters → tools → risks).
  - Chunking (one section per chapter, one table per decision).
  - Signposting (requirements mapped, traceability examples, placeholder labels).
  - Review empathy (PR plan, line estimates, review focus).
- No fallback registry or additional skill discovery was needed.

---

## Checklist

- [x] Design overview with approach, conventions, and tooling.
- [x] Exact file tree under `docs/manual-tecnico/` plus root-level `Dockerfile`/`docker-compose.yml`.
- [x] Chapter-by-chapter design with sections, tables, diagrams, MAN-XX mapping, and traceability convention.
- [x] Diagram strategy for ER, component, and deployment diagrams.
- [x] Dockerfile design: base, stages, pnpm, missing lockfile, non-root, healthcheck.
- [x] `docker-compose.yml` design: services, networks, volumes, env, healthchecks, dependency order.
- [x] PDF generation design: pandoc vs md-to-pdf, command, template, images.
- [x] Delivery plan with three chained PRs and line estimates.
- [x] Risks and mitigations.
- [x] Skill resolution.
