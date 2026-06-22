# SDD Tasks: Manual Técnico y de Operación DNP para `techside-veterinary`

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,000 (PR-1 ~750, PR-2 ~900, PR-3 ~350) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR-1 (capítulos 1-2 + diagramas ER/componentes + generator) → PR-2 (capítulos 3-4 + Docker + diagrama de despliegue) → PR-3 (PDF + plantillas + npm scripts + fixes) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

---

## Implementation Tasks

> Apply in order. Each PR is a reviewable work unit with its own verification. Do **not** start the next PR until the previous one merges.

---

### PR-1: Estructura del manual, capítulos 1-2, ER y componentes

**Goal:** Entregar la estructura base del manual, los capítulos de descripción y diseño técnico, y los diagramas ER y de componentes.

#### T1.1 — Crear estructura de carpetas del manual
- [x] Crear directorios:
  - `docs/manual-tecnico/`
  - `docs/manual-tecnico/diagramas/`
  - `docs/manual-tecnico/plantillas/`
  - `docs/manual-tecnico/pdf/`
- [ x Crear `docs/manual-tecnico/README.md` con instrucciones de construcción/renderizado del manual.
- **Verification:** `ls docs/manual-tecnico/ && ls docs/manual-tecnico/diagramas/ && ls docs/manual-tecnico/plantillas/ && ls docs/manual-tecnico/pdf/`

#### T1.2 — Agregar generador ER a Prisma
- [x] Editar `prisma/schema.prisma` y agregar el bloque `generator erd { ... }` que apunte a `docs/manual-tecnico/diagramas/er-diagram.png`.
- [x] Asegurar que el generador no rompa `prisma generate` actual.
- **Verification (GREEN):** `pnpm run db:generate` completa sin errores y produce `docs/manual-tecnico/diagramas/er-diagram.png`.
- **TDD evidence:**
  - RED: ejecutar `pnpm run db:generate` antes de instalar el generador → falla o no genera `er-diagram.png`.
  - GREEN: después de agregar el generador y dependencias, `pnpm run db:generate` produce el PNG.

#### T1.3 — Instalar dependencias del manual (dev)
- [x] Agregar a `package.json` (devDependencies):
  - `prisma-erd-generator` o `@mermaid-js/prisma-erd-generator`
  - `@mermaid-js/mermaid-cli` (para renderizar `.mmd` a `.png`)
  - Herramienta PDF opcional si se elige `md-to-pdf` como fallback.
- [ x Ejecutar `pnpm install`.
- **Verification (GREEN):** `pnpm install`, `pnpm run lint` y `pnpm test` pasan sin errores.
- **TDD evidence:**
  - RED: `pnpm run db:generate` no encuentra el generador ERD.
  - GREEN: `pnpm install` resuelve el generador; `pnpm run lint` y `pnpm test` siguen pasando.

#### T1.4 — Redactar `docs/manual-tecnico/01-descripcion-sistema.md`
- [x] Portada interna: nombre, versión `0.0.1` [Fuente: `package.json`], fecha.
- [ x Introducción y contexto.
- [ x Propósito general del backend API.
- [ x Usuarios y roles (`cliente`, `medico`, `admin`) [Fuente: `prisma/schema.prisma#Rol`, `README.md`].
- [ x Resumen de módulos NestJS [Fuente: `src/app.module.ts`].
- [ x Objetivos del sistema [Fuente: `README.md`, `API-DOCS.md`].
- [ x Alcance y límites: dentro (backend API); fuera (frontend, CI/CD, monitoreo, backups automatizados reales).
- [ x Licencia `UNLICENSED` [Fuente: `package.json`]; notar discrepancia si `README.md` menciona MIT.
- [ x Glosario mínimo.
- [ x Marcar vacíos operativos con `[PENDIENTE]`.
- **Verification:** `grep -E "^#{1,3} " docs/manual-tecnico/01-descripcion-sistema.md` lista todas las secciones obligatorias; `grep -c "\[Fuente:"` >= 5; `grep -c "\[PENDIENTE"` >= 1.

#### T1.5 — Redactar `docs/manual-tecnico/02-diseno-tecnico.md`
- [x] Requerimientos funcionales y reglas de negocio V-01..V-09 [Fuente: `src/citas/citas.service.ts`].
- [ x Tabla de stack tecnológico [Fuente: `package.json`, `README.md`].
- [ x Estándares de código y arquitectura (módulos, guards, interceptores, filtros) [Fuente: `src/common/`, `src/main.ts`].
- [ x Modelo de datos: incrustar `diagramas/er-diagram.png` y diccionario de datos completo de `prisma/schema.prisma`.
- [ x Funcionalidad y servicios: prefijos de ruta, endpoints por rol [Fuente: `API-DOCS.md`, `src/`], máquinas de estados `EstadoCita` y `EstadoPago` [Fuente: `src/citas/`, `src/pagos/`].
- [ x Autenticación y autorización: JWT Bearer, Passport, bcrypt, jerarquía de roles [Fuente: `src/auth/`, `src/common/guards/roles.guard.ts`].
- [ x Integraciones externas: Resend, almacenamiento local [Fuente: `src/email/`, `src/archivos/`].
- [ x Consideraciones de seguridad: helmet, sanitize, CORS, rate limiting planificado [Fuente: `src/main.ts`, `src/config/cors.config.ts`, `src/app.module.ts`].
- [ x Requisitos técnicos mínimos oficiales; sizing real `[PENDIENTE]`.
- **Verification:** diccionario cubre todos los modelos/enums (`grep -E "^model|^enum" prisma/schema.prisma | wc -l` == filas en diccionario); `grep -c "\[Fuente:"` >= 15.

#### T1.6 — Crear diagrama de componentes
- [x] Crear `docs/manual-tecnico/diagramas/componentes.mmd` con módulos NestJS, guards, servicios compartidos, PostgreSQL, Redis, Resend.
- [x] Renderizar a `docs/manual-tecnico/diagramas/componentes.png` usando `mmdc`.
- **Verification (GREEN):** `npx -y @mermaid-js/mermaid-cli mmdc -i docs/manual-tecnico/diagramas/componentes.mmd -o docs/manual-tecnico/diagramas/componentes.png` genera el PNG.
- **TDD evidence:**
  - RED: no existe `componentes.png`.
  - GREEN: el comando `mmdc` genera `componentes.png`.

#### T1.7 — Commit PR-1
- [x] Revisar diff con `git diff --stat`; asegurar que solo incluye archivos de PR-1.
- [x] Ejecutar `pnpm run lint` y `pnpm test`.
- [x] Commit con mensaje tipo: `docs(manual): estructura y capítulos 1-2 del manual técnico DNP`.

---

### PR-2: Capítulos 3-4, Docker, docker-compose y diagrama de despliegue

**Goal:** Entregar los capítulos operativos, los artefactos de contenedores y el diagrama de despliegue.

#### T2.1 — Crear `Dockerfile`
- [ x Base `node:20-alpine`, etapas `deps` → `build` → `production`.
- [ x Usar `corepack enable` para `pnpm@11.7.0`.
- [ x Instalar `openssl` y `libc6-compat` para Prisma en Alpine.
- [ x Manejar ausencia de `pnpm-lock.yaml` con `pnpm install --frozen-lockfile=false` y documentar el riesgo.
- [ x Ejecutar `pnpm run db:generate` y `pnpm run build` en etapa `build`.
- [ x Etapa final con usuario `node`, `EXPOSE 3000`, `HEALTHCHECK` a `GET /`, `CMD ["node", "dist/main"]`.
- **Verification (GREEN):** `docker build -t techside-veterinary .` completa exitosamente.
- **TDD evidence:**
  - RED: `docker build` falla antes de crear el Dockerfile.
  - GREEN: `docker build -t techside-veterinary .` genera la imagen.

#### T2.2 — Crear `docker-compose.yml`
- [ x Servicio `api`: `build: .`, puerto `3000`, `env_file: .env`, volumen `./uploads:/app/uploads`, `depends_on` con `condition: service_healthy`.
- [ x Servicio `db`: `postgres:15`, variables `POSTGRES_USER/PASSWORD/DB`, volumen `postgres_data`, `HEALTHCHECK` con `pg_isready`.
- [ x Servicio `redis`: `redis:7`, volumen `redis_data`, `HEALTHCHECK` con `redis-cli ping`.
- [ x Red `vetec-network` y volúmenes `postgres_data`, `redis_data`.
- **Verification (GREEN):** `docker compose up --build` levanta `db` y `redis` sanos; `api` inicia y responde `GET /`.
- **TDD evidence:**
  - RED: `docker compose up --build` falla o `api` no responde.
  - GREEN: `curl -f http://localhost:3000/` retorna `200 OK` después de `docker compose up --build`.

#### T2.3 — Crear `.dockerignore`
- [ x Excluir `node_modules`, `dist`, `.git`, `coverage`, `.vscode`, `.env`, `uploads`, `*.md` excepto `README.md`.
- **Verification:** `docker build` no copia archivos innecesarios; `docker run --rm techside-veterinary ls -la /app` no muestra `node_modules` del host.

#### T2.4 — Redactar `docs/manual-tecnico/03-despliegue-configuracion.md`
- [ x Organización de componentes con diagrama de despliegue.
- [ x Requisitos previos de software.
- [ x Instalación local paso a paso [Fuente: `README.md`].
- [ x Instalación con Docker Compose [Fuente: `docker-compose.yml`].
- [ x Tabla completa de variables de entorno [Fuente: `src/config/env.validation.ts`].
- [ x Configuración CORS y seguridad [Fuente: `src/config/cors.config.ts`, `src/main.ts`].
- [ x Procedimiento de despliegue en VPS/servidor propio; marcar certificado/proxy como `[PENDIENTE]`.
- [ x Población inicial con `prisma/seed.ts` [Fuente: `prisma/seed.ts`].
- [ x Política genérica de respaldo (`pg_dump`, `BGSAVE`, retención 30 días) y restauración.
- [ x Verificación post-despliegue (`GET /`, Swagger, healthchecks).
- **Verification:** `grep -c "\[Fuente:"` >= 10; todas las variables de `env.validation.ts` aparecen en la tabla.

#### T2.5 — Redactar `docs/manual-tecnico/04-resolucion-problemas.md`
- [ x Introducción al proceso de soporte.
- [ x Tabla de códigos HTTP 400, 401, 403, 404, 409, 429 [Fuente: `API-DOCS.md`].
- [ x Escenarios de registro/autenticación.
- [ x Escenarios de agendamiento (V-01..V-09).
- [ x Escenarios de pagos.
- [ x Escenarios de carga de archivos.
- [ x Escenarios operativos (API no inicia, PostgreSQL/Redis no responde, contenedores no levantan).
- [ x Recolección de logs (`docker compose logs`, logs NestJS).
- [ x Escalamiento `[PENDIENTE]`.
- **Verification:** la tabla cubre al menos los escenarios listados en MAN-04; `grep -c "\[Fuente:"` >= 10.

#### T2.6 — Crear diagrama de despliegue
- [ x Crear `docs/manual-tecnico/diagramas/despliegue.mmd` con VPS, contenedores `api`/`postgres`/`redis`, volúmenes, red interna y proxy placeholder.
- [ x Renderizar a `docs/manual-tecnico/diagramas/despliegue.png`.
- **Verification (GREEN):** `npx -y @mermaid-js/mermaid-cli mmdc -i docs/manual-tecnico/diagramas/despliegue.mmd -o docs/manual-tecnico/diagramas/despliegue.png` genera el PNG.

#### T2.7 — Commit PR-2
- [ x Revisar diff con `git diff --stat`.
- [ x Ejecutar `docker build -t techside-veterinary .` y `docker compose up --build -d` + `curl http://localhost:3000/`.
- [ x Commit con mensaje tipo: `docs(manual): capítulos 3-4, Dockerfile y docker-compose del manual DNP`.

---

### PR-3: Plantilla LaTeX, portada, PDF y ajustes finales

**Goal:** Generar el PDF final del manual, agregar scripts npm y aplicar correcciones de revisión.

#### T3.1 — Crear plantilla LaTeX
- [ x Crear `docs/manual-tecnico/plantillas/pandoc-template.tex` con portada, numeración, encabezado/pie, idioma `es-MX` y placeholder de logo.
- **Verification:** el archivo compila sin errores de sintaxis al usarlo con pandoc.

#### T3.2 — Crear portada del PDF
- [ x Crear `docs/manual-tecnico/plantillas/portada.md` con nombre del sistema, versión, fecha y campos `[PENDIENTE]`.
- **Verification:** el archivo se incluye como primera página del PDF.

#### T3.3 — Agregar scripts npm para generación de diagramas y PDF
- [ x Agregar a `package.json`:
  - `"manual:diagrams": "mmdc -i docs/manual-tecnico/diagramas/componentes.mmd -o docs/manual-tecnico/diagramas/componentes.png && mmdc -i docs/manual-tecnico/diagramas/despliegue.mmd -o docs/manual-tecnico/diagramas/despliegue.png"`
  - `"manual:pdf": "pandoc ... (comando documentado en design.md)"`
- [ x Documentar dependencias del sistema (`pandoc`, `xelatex`/`lualatex`) en `docs/manual-tecnico/README.md`.
- **Verification (GREEN):** `pnpm run manual:diagrams` regenera los PNG; `pnpm run manual:pdf` genera el PDF (requiere pandoc/LaTeX instalados).
- **TDD evidence:**
  - RED: `pnpm run manual:pdf` no existe o falla.
  - GREEN: el script produce `docs/manual-tecnico/pdf/manual-tecnico.pdf`.

#### T3.4 — Generar PDF final
- [ x Ejecutar `pnpm run manual:pdf`.
- [ x Verificar que `docs/manual-tecnico/pdf/manual-tecnico.pdf` contenga los cuatro capítulos y los diagramas.
- **Verification:** `ls -lh docs/manual-tecnico/pdf/manual-tecnico.pdf` y apertura/visualización del PDF.

#### T3.5 — Aplicar fixes de revisión
- [ x Revisar comentarios de PR-1 y PR-2.
- [ x Corregir trazabilidad, placeholders, tablas y diagramas según feedback.
- [ x Re-ejecutar `pnpm run lint`, `pnpm test`, `docker build` y `docker compose up` si se tocan artefactos de código.

#### T3.6 — Auditoría de trazabilidad final
- [ x Ejecutar `grep -R "\[Fuente:" docs/manual-tecnico/*.md` y asegurar que cada afirmación técnica tiene fuente.
- [ x Ejecutar `grep -R "\[PENDIENTE" docs/manual-tecnico/*.md` y verificar que los vacíos están justificados.
- [ x Ejecutar `grep -E "^model|^enum" prisma/schema.prisma | wc -l` y comparar con cobertura del diccionario.

#### T3.7 — Commit PR-3
- [ x Revisar diff con `git diff --stat`.
- [ x Commit con mensaje tipo: `docs(manual): generación PDF y ajustes finales del manual DNP`.

---

## TDD Evidence Plan

### Code artifacts (Dockerfile, docker-compose)

| Test | Command | Expected result |
|------|---------|-----------------|
| Build image | `docker build -t techside-veterinary .` | Exit 0, image created |
| Compose smoke test | `docker compose up --build -d && sleep 15 && curl -f http://localhost:3000/` | HTTP 200, body contains API root response |
| Healthcheck | `docker inspect --format='{{.State.Health.Status}}' <api-container>` | `healthy` after start period |
| Database connectivity | `docker compose exec db pg_isready -U $POSTGRES_USER` | `accepting connections` |
| Redis connectivity | `docker compose exec redis redis-cli ping` | `PONG` |

### Docs artifacts (traceability & quality)

| Test | Command | Expected result |
|------|---------|-----------------|
| Traceability audit | `grep -R "\[Fuente:" docs/manual-tecnico/*.md` | Every technical section cites a source |
| Placeholder audit | `grep -R "\[PENDIENTE" docs/manual-tecnico/*.md` | All operational gaps are explicit |
| Structure check | `grep -E "^#{1,3} " docs/manual-tecnico/0*.md` | All required sections present |
| Spell/grammar | Manual review + `npx markdown-spellcheck` if available | No obvious errors |

### Prisma ER generator

| Test | Command | Expected result |
|------|---------|-----------------|
| Generator produces ER | `pnpm run db:generate` | `docs/manual-tecnico/diagramas/er-diagram.png` exists |

### Package changes

| Test | Command | Expected result |
|------|---------|-----------------|
| Install | `pnpm install` | Exit 0, lockfile updated/created |
| Lint | `pnpm run lint` | Exit 0 |
| Unit tests | `pnpm test` | Exit 0 |
| e2e tests | `pnpm run test:e2e` | Exit 0 (if env is available) |

---

## Risk Notes and Rollback Plan

### Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| No `pnpm-lock.yaml` causa builds no reproducibles | High | Medium | Usar `--frozen-lockfile=false` en Docker; documentar que se recomienda generar el lockfile. |
| Prisma query engine falla en Alpine | Medium | High | Instalar `openssl`/`libc6-compat`; agregar `binaryTargets` si es necesario. |
| PDF requiere LaTeX no instalado en CI/review | Medium | Medium | Proporcionar fallback `md-to-pdf`; documentar prerequisitos. |
| ER generator no soporta relaciones complejas | Low | Medium | Fallback a `@mermaid-js/prisma-erd-generator` + `mmdc`. |
| Diff de PR-1/PR-2 excede presupuesto de revisión | High | Medium | Mantener split por PR; si es necesario, subdividir capítulos en PRs adicionales. |
| Placeholders `[PENDIENTE]` percibidos como incompleto | Medium | Low | Explicar en capítulo 1 que los vacíos son intencionales y requieren input operativo. |
| Rate limiting documentado pero no activo | Baja | Media | Documentar explícitamente como planificado/activo en `main` y no modificar `app.module.ts`. |
| Inconsistencia de licencia (`README.md` MIT vs `package.json` UNLICENSED) | Baja | Alta | Documentar `UNLICENSED` como fuente autorizada y la discrepancia. |

### Rollback plan

1. **Rollback de PR-1:**
   - Revertir commits de PR-1.
   - Eliminar `docs/manual-tecnico/01-descripcion-sistema.md`, `docs/manual-tecnico/02-diseno-tecnico.md`, `docs/manual-tecnico/README.md`, diagramas `componentes.*`, `er-diagram.png`.
   - Revertir cambios a `prisma/schema.prisma` y `package.json`.
   - Verificar `pnpm run db:generate` y `pnpm test`.

2. **Rollback de PR-2:**
   - Revertir commits de PR-2.
   - Eliminar `Dockerfile`, `docker-compose.yml`, `.dockerignore`, capítulos 3-4, diagrama de despliegue.
   - Verificar que el repositorio sigue funcionando en local sin Docker.

3. **Rollback de PR-3:**
   - Revertir commits de PR-3.
   - Eliminar `docs/manual-tecnico/plantillas/`, `docs/manual-tecnico/pdf/manual-tecnico.pdf`.
   - Revertir scripts de `package.json`.

---

## Dependencies Between Tasks

```
T1.1 ──► T1.2 ──► T1.3 ──► T1.4, T1.5, T1.6 ──► T1.7
                          ▲
                          └── T1.4 y T1.5 dependen de T1.2 (ER listo)

T2.1 ──► T2.2 ──► T2.3 ──► T2.4, T2.5, T2.6 ──► T2.7
                          ▲
                          └── T2.4 depende de T2.2 (compose listo)

T3.1 ──► T3.2 ──► T3.3 ──► T3.4 ──► T3.5 ──► T3.6 ──► T3.7
```

- PR-2 depends on PR-1 (estructura y convenciones aprobadas).
- PR-3 depends on PR-1 and PR-2 (contenido final y artefactos listos).

---

## Skill Resolution

- **Skill loading:** `paths-injected`.
- **Skills used:**
  - `/home/styc/.config/opencode/skills/cognitive-doc-design/SKILL.md` — estructura del manual, tablas, convenciones de trazabilidad y placeholders.
  - `/home/styc/.config/opencode/skills/work-unit-commits/SKILL.md` — división en PRs/commits por unidades de trabajo, manteniendo verificación en la misma unidad.
- No fue necesario fallback al registro ni rutas adicionales.
