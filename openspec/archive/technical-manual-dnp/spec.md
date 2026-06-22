# Especificación del Manual Técnico y de Operación DNP para `techside-veterinary`

Crear un manual técnico y de operación completo, en español mexicano y alineado a la *Guía para la Elaboración del Manual Técnico y de Operación del Sistema* del DNP Colombia, para el backend API `techside-veterinary`. El manual se entregará como capítulos Markdown bajo `docs/manual-tecnico/`, con una versión PDF generada, acompañado de `Dockerfile` y `docker-compose.yml`.

## Quick path

1. Redactar cuatro capítulos Markdown rastreables a `src/`, `prisma/`, `package.json`, `README.md` y `API-DOCS.md`.
2. Generar los diagramas de soporte (ER, componentes y despliegue) a partir del schema y de la estructura de módulos.
3. Crear `Dockerfile` y `docker-compose.yml` para levantar API + PostgreSQL 15 + Redis 7.
4. Generar `docs/manual-tecnico/pdf/manual-tecnico.pdf`.
5. Marcar explícitamente los vacíos operativos como `[PENDIENTE]` o secciones por completar.

## Decisiones aprobadas

| Tema | Decisión | Fuente / Nota |
|------|----------|---------------|
| Idioma | Español mexicano (es-MX) | Aprobado por el usuario |
| Despliegue de referencia | VPS / servidor propio con Docker Compose | Aprobado por el usuario |
| Política de respaldo | Genérica sugerida: `pg_dump` diario, snapshot Redis (`BGSAVE`), retención 30 días | Aprobado por el usuario |
| Rate limiting | Documentar como planificado/activo en `main`; comentado solo en rama `demos` | Aprobado por el usuario; `@nestjs/throttler` está en `package.json` y comentado en `src/app.module.ts` |
| Licencia | `UNLICENSED` documentada explícitamente | `package.json` `"license": "UNLICENSED"` |
| Stack mínimo | Node.js 20+, PostgreSQL 15+, Redis 7+, NestJS 11, pnpm 11.7 | `README.md`, `package.json` (`packageManager`, dependencias) |
| Hardware | Requisitos mínimos oficiales de cada runtime; NO usar la PC del desarrollador | Aprobado por el usuario |
| No invención de datos | Toda afirmación debe ser rastreable a código, config o docs comprometidos | Aprobado por el usuario |

## Requerimientos funcionales del manual

### MAN-01 Capítulo 1 — Descripción del Sistema

El manual DEBE incluir el archivo `docs/manual-tecnico/01-descripcion-sistema.md`, que contenga las siguientes secciones:

- **Nombre del sistema**: `techside-veterinary`.
- **Propósito**: backend API para clínica veterinaria (agendamiento, historial médico, recetas, pagos, etc.).
- **Usuarios objetivo**: clientes, médicos y administradores (roles `cliente`, `medico`, `admin` definidos en `prisma/schema.prisma` y `README.md`).
- **Resumen de módulos**: lista de módulos de NestJS tal como aparecen en `src/app.module.ts` y `README.md`.
- **Objetivos del sistema**: funcionalidades principales descritas en `README.md` y `API-DOCS.md`.
- **Límites del alcance**: qué cubre el backend y qué queda fuera (por ejemplo, frontend, CI/CD, monitoreo).

#### Escenario: Revisión del capítulo 1

- **DADO** que un revisor abre `docs/manual-tecnico/01-descripcion-sistema.md`
- **CUANDO** verifica las secciones obligatorias
- **ENTONCES** encuentra nombre, propósito, usuarios, módulos, objetivos y límites del alcance, cada uno con una fuente rastreable.

### MAN-02 Capítulo 2 — Diseño Técnico

El manual DEBE incluir el archivo `docs/manual-tecnico/02-diseno-tecnico.md`, que contenga:

- **Trazabilidad de requerimientos/reglas**: tabla que relacione reglas de negocio identificadas (por ejemplo, V-01 … V-09 de `citas.service.ts`) con archivos fuente.
- **Tabla de stack tecnológico**: versiones mínimas de Node.js, pnpm, NestJS, TypeScript, Prisma, PostgreSQL, Redis, Bull, JWT, Zod, Swagger, Helmet, etc., tomadas de `package.json` y `README.md`.
- **Estándares de componentes**: organización de módulos NestJS, guards (`JwtAuthGuard`, `RolesGuard`), decorador `@Roles`, interceptores (`SanitizeInterceptor`) y filtros (`HttpExceptionFilter`), ubicados en `src/common/`.
- **Modelo de datos**:
  - Diagrama entidad-relación generado desde `prisma/schema.prisma`.
  - Diccionario de datos que cubra todos los modelos, enums, campos, tipos, relaciones y mapeos a base de datos.
- **Funcionalidad y servicios**:
  - Módulos, prefijos de ruta y endpoints principales por rol (basado en `API-DOCS.md` y controladores en `src/`).
  - Máquinas de estados de `Cita` (`EstadoCita`) y `Pago` (`EstadoPago`), con transiciones manuales y automáticas documentadas en `src/citas/`.
  - Modelo de autenticación: JWT Bearer, Passport, bcrypt, jerarquía de roles (`cliente < medico < admin`).

#### Escenario: Revisión del capítulo 2

- **DADO** que un revisor abre `docs/manual-tecnico/02-diseno-tecnico.md`
- **CUANDO** consulta el diccionario de datos, el diagrama ER y la tabla de endpoints
- **ENTONCES** cada modelo/enum de `prisma/schema.prisma` aparece documentado y cada endpoint incluye el rol requerido con una referencia a `API-DOCS.md` o a los guards del código.

### MAN-03 Capítulo 3 — Despliegue y Configuración

El manual DEBE incluir el archivo `docs/manual-tecnico/03-despliegue-configuracion.md`, que contenga:

- **Organización de componentes**: API NestJS, PostgreSQL, Redis/Bull, cola de correo, almacenamiento local de archivos.
- **Instalación local**: pasos de `README.md` (clonar, `pnpm install`, variables de entorno, Prisma generate/deploy, seed, `pnpm run start:dev`).
- **Instalación con Docker**: uso de `Dockerfile` y `docker-compose.yml` entregados.
- **Referencia de variables de entorno**: tabla completa de variables definidas en `src/config/env.validation.ts` con tipo, obligatoriedad, valor por defecto y propósito.
- **Configuración CORS y seguridad**: orígenes permitidos (`resolveCorsOrigin` en `src/config/cors.config.ts`), métodos, headers, `credentials: false`, `helmet()`, `SanitizeInterceptor` y `HttpExceptionFilter` (de `src/main.ts`).
- **Procedimiento de despliegue**: instrucciones para VPS propio con Docker Compose, incluyendo orden de servicios y verificación de salud.
- **Respaldo y restauración**:
  - PostgreSQL: `pg_dump` diario, retención 30 días.
  - Redis: `BGSAVE`/snapshot periódico, retención 30 días.
  - Comandos de restauración genéricos.

#### Escenario: Revisión del capítulo 3

- **DADO** que un revisor abre `docs/manual-tecnico/03-despliegue-configuracion.md`
- **CUANDO** busca una variable de entorno o un paso de despliegue
- **ENTONCES** encuentra la variable con su validación en `env.validation.ts`, el procedimiento de Docker y una política de respaldo sin datos inventados.

### MAN-04 Capítulo 4 — Resolución de Problemas

El manual DEBE incluir el archivo `docs/manual-tecnico/04-resolucion-problemas.md`, que contenga una tabla de escenarios de error con: síntoma, posible causa y pasos de solución.

La tabla DEBE cubrir al menos:

- Códigos HTTP documentados en `API-DOCS.md`: 400, 401, 403, 404, 409, 429.
- Escenarios de código: email/telefono duplicado en registro, tipo de archivo inválido, login fallido, usuario pendiente/inactivo, citas < 24h o > 2 meses, conflictos de horario/médico/consultorio, pago ya procesado, folio no encontrado, `RESEND_API_KEY` no configurada.
- Escenarios operativos: la API no inicia, PostgreSQL no responde, Redis no responde, contenedores no levantan.

#### Escenario: Revisión del capítulo 4

- **DADO** que un operador consulta `04-resolucion-problemas.md` ante un error 409
- **CUANDO** lee la fila correspondiente
- **ENTONCES** encuentra síntoma (respuesta de conflicto), causa posible (superposición de horario o cita duplicada) y pasos de solución (revisar disponibilidad del médico y reintentar).

### MAN-05 Idioma

Todo el contenido de los capítulos, diagramas y metadatos del manual DEBE estar redactado en español mexicano. Se permite conservar nombres técnicos en inglés cuando son identificadores de código (por ejemplo, `JwtAuthGuard`, `EstadoCita`).

#### Escenario: Verificación de idioma

- **DADO** que un revisor abre cualquier archivo del manual
- **CUANDO** lee el texto narrativo
- **ENTONCES** está en español mexicano, sin secciones en inglés excepto nombres propios del código.

### MAN-06 Trazabilidad de afirmaciones

Cada afirmación técnica del manual DEBE incluir una fuente rastreable. Las fuentes válidas son: archivos en `src/`, `prisma/schema.prisma`, `package.json`, `README.md` y `API-DOCS.md`.

#### Escenario: Verificación de trazabilidad

- **DADO** que un auditor revisa una afirmación sobre una versión de dependencia
- **CUANDO** busca la fuente citada
- **ENTONCES** la encuentra en `package.json` o `README.md`.

### MAN-07 Placeholders para vacíos operativos

Los vacíos que no puedan resolverse con información comprometida DEBEN presentarse como placeholders explícitos, usando una marca consistente (por ejemplo, `[PENDIENTE]` o `[POR CONFIRMAR]`) y una breve explicación de la información faltante.

#### Escenario: Identificación de placeholders

- **DADO** que el manual incluye una sección sobre URL de producción
- **CUANDO** no existe una URL confirmada en el repositorio
- **ENTONCES** el manual muestra `[PENDIENTE: URL pública del backend]` en lugar de inventar un valor.

### MAN-08 Diccionario de datos completo

El manual DEBE incluir un diccionario de datos que cubra todos los modelos y enumeraciones definidos en `prisma/schema.prisma`, incluyendo: nombre del modelo/enum, descripción, campos, tipos, valores permitidos, relaciones, índices y nombre de tabla/columna en base de datos.

#### Escenario: Cobertura del diccionario

- **DADO** que `prisma/schema.prisma` contiene 25+ modelos y 5 enums
- **CUANDO** se contrasta con el diccionario del manual
- **ENTONCES** cada modelo y enum aparece documentado con al menos sus campos principales y relaciones.

### MAN-09 Diagramas de soporte

El manual DEBE incluir al menos los siguientes diagramas bajo `docs/manual-tecnico/diagramas/`:

1. **Diagrama entidad-relación** (`er-diagram.png`), generado automáticamente desde `prisma/schema.prisma` usando un generador de ERD compatible (por ejemplo, `prisma-erd-generator` o `@mermaid-js/prisma-erd-generator`). La fuente de verdad es el schema; el PNG es el artefacto renderizado.
2. **Diagrama de componentes** (`componentes.png`), dibujado como código fuente Mermaid (`componentes.mmd`), que muestre los módulos NestJS, guards, servicios compartidos y dependencias externas (PostgreSQL, Redis, Resend).
3. **Diagrama de despliegue** (`despliegue.png`), dibujado como código fuente Mermaid (`despliegue.mmd`), que muestre el VPS, contenedores (`api`, `postgres`, `redis`), volúmenes, red interna y un placeholder para proxy/balanceador si aplica.

#### Escenario: Generación reproducible de diagramas

- **DADO** que un mantenedor ejecuta el generador de ERD o renderiza los archivos `.mmd`
- **CUANDO** se compara con el schema y `app.module.ts`
- **ENTONCES** los diagramas reflejan el modelo de datos y la arquitectura de módulos sin inconsistencias.

### MAN-10 Artefactos de contenedores

El cambio DEBE entregar:

- **`Dockerfile`** para la API NestJS, con las siguientes características:
  - Imagen base: `node:20-alpine` (o `node:20-slim`).
  - Uso de `pnpm` 11.7.0, preferentemente a través de `corepack enable` o `npm install -g pnpm@11.7.0`.
  - Construcción por etapas: `deps` → `build` → `production`.
  - Instalación de dependencias de producción con `pnpm install --prod` (o equivalente).
  - Ejecución de `pnpm run build` y copia del directorio `dist/`.
  - Variables de entorno soportadas a través de archivo `.env` o inyección en runtime.
  - Puerto expuesto `${PORT}` (predeterminado `3000`).
  - Usuario no root en la etapa final.
  - `HEALTHCHECK` que consulte `GET /` y retorne éxito cuando la API responda.
  - Comando de inicio: `node dist/main`.

- **`docker-compose.yml`** con los siguientes servicios:
  - `api`: construye la imagen local (`build: .`), expone el puerto `3000`, carga variables desde `.env`, monta volúmenes para `uploads/`, depende de `db` y `redis` con condición de salud.
  - `db`: imagen `postgres:15`, variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, volumen persistente `postgres_data`, `HEALTHCHECK` con `pg_isready`.
  - `redis`: imagen `redis:7`, volumen persistente `redis_data`, `HEALTHCHECK` con `redis-cli ping`.
  - Red interna y volúmenes nombrados.

#### Escenario: Despliegue con Docker Compose

- **DADO** que un operador ejecuta `docker compose up --build` en un VPS con Docker
- **CUANDO** los servicios `db` y `redis` están sanos
- **ENTONCES** el contenedor `api` inicia, aplica migraciones si el procedimiento lo indica, y responde en `http://<host>:3000/`.

### MAN-11 Generación de PDF

El manual DEBE incluir un procedimiento documentado para generar `docs/manual-tecnico/pdf/manual-tecnico.pdf` a partir de los capítulos Markdown y los diagramas.

Se RECOMIENDA usar **pandoc** (con una plantilla LaTeX o un motor como `xelatex` o `lualatex`) o **md-to-pdf** como alternativa ligera. El procedimiento DEBE:

- Leer los cuatro capítulos en orden.
- Incluir los diagramas generados.
- Aplicar un estilo consistente (portada, numeración, índice si es posible).
- Dejar el PDF en `docs/manual-tecnico/pdf/manual-tecnico.pdf`.

#### Escenario: Generación del PDF

- **DADO** que un mantenedor ejecuta el comando de generación documentado
- **CUANDO** finaliza el proceso
- **ENTONCES** existe `docs/manual-tecnico/pdf/manual-tecnico.pdf` y contiene los cuatro capítulos y los diagramas.

### MAN-12 Tabla de resolución de errores

El capítulo 4 DEBE incluir una tabla de resolución de errores técnicos comunes, con al menos las columnas: escenario/error, síntoma, causa probable, solución paso a paso.

#### Escenario: Uso operativo de la tabla

- **DADO** que un usuario reporta que no puede iniciar sesión
- **CUANDO** el operador consulta la tabla
- **ENTONCES** encuentra filas para credenciales incorrectas, usuario no verificado y JWT ausente/inválido.

### MAN-13 Documentación del rate limiting

El manual DEBE documentar el rate limiting como funcionalidad planificada/activa en la rama `main`, basándose en que `@nestjs/throttler` está instalado (`package.json`) y su configuración comentada en `src/app.module.ts` se describe como temporal (únicamente para la rama `demos`). El manual NO DEBE activar ni modificar el módulo en el código.

#### Escenario: Verificación de la política de rate limiting

- **DADO** que un revisor lee la sección de seguridad
- **CUANDO** revisa `package.json` y `src/app.module.ts`
- **ENTONCES** el manual explica que el límite de peticiones está planificado con `ThrottlerModule`, pero que actualmente el guard no está registrado globalmente.

### MAN-14 Licencia

El manual DEBE documentar explícitamente que el sistema se distribuye bajo licencia `UNLICENSED`, tomando como fuente `package.json` (`"license": "UNLICENSED"`). Si se menciona la nota de `README.md` sobre MIT, DEBE presentarse como inconsistencia pendiente de resolver, no como verdad oficial.

#### Escenario: Verificación del capítulo legal/información del sistema

- **DADO** que un auditor consulta la licencia en el manual
- **CUANDO** contrasta con `package.json`
- **ENTONCES** el manual indica `UNLICENSED` y cita `package.json` como fuente autorizada.

### MAN-15 Mínimos oficiales de stack y hardware

El manual DEBE documentar los requisitos mínimos oficiales de Node.js 20+, PostgreSQL 15+, Redis 7+, NestJS 11 y pnpm 11.7. Los requisitos de hardware DEBEN basarse en la documentación oficial de cada runtime (por ejemplo, RAM y disco recomendados por Node.js, PostgreSQL y Redis) y NO DEBEN copiar las especificaciones de la PC de desarrollo.

#### Escenario: Validación de requisitos técnicos

- **DADO** que un revisor lee la sección de requisitos técnicos
- **CUANDO** busca la fuente de los mínimos
- **ENTONCES** encuentra referencias a la documentación oficial de cada tecnología y una nota que indica que el sizing de producción real es `[PENDIENTE]`.

## Especificaciones detalladas por capítulo

### 01-descripcion-sistema.md

Debe incluir:

1. Portada interna del capítulo (nombre del sistema, versión, fecha).
2. Introducción y contexto.
3. Nombre del sistema y versión (`0.0.1` según `package.json`).
4. Propósito general.
5. Usuarios y roles (`cliente`, `medico`, `admin`).
6. Resumen de módulos funcionales (auth, usuarios, personas, mascotas, catálogos, citas, médicos, recetas, consultas, pagos, historial médico).
7. Objetivos del sistema.
8. Alcance y límites (dentro: backend API; fuera: frontend, CI/CD, monitoreo, backups automatizados reales).
9. Glosario mínimo de términos.

### 02-diseno-tecnico.md

Debe incluir:

1. Requerimientos funcionales y reglas de negocio rastreadas a `src/`.
2. Tabla de stack tecnológico con versiones.
3. Estándares de código y arquitectura (módulos NestJS, guards, interceptores, filtros, DTOs, pipes).
4. Modelo de datos:
   - Diagrama ER.
   - Diccionario de datos completo.
5. Funcionalidad/servicios:
   - Módulos y prefijos de ruta.
   - Endpoints por rol (tabla).
   - Máquinas de estados (`EstadoCita`, `EstadoPago`).
   - Modelo de autenticación y autorización.
6. Integraciones externas: Resend (email), almacenamiento local de archivos.
7. Consideraciones de seguridad generales (helmet, sanitize, CORS).

### 03-despliegue-configuracion.md

Debe incluir:

1. Organización de componentes (diagrama de despliegue).
2. Requisitos previos de software (Node.js, pnpm, PostgreSQL, Redis, Docker, Docker Compose).
3. Instalación local paso a paso (de `README.md`).
4. Instalación con Docker Compose.
5. Referencia completa de variables de entorno (`src/config/env.validation.ts`).
6. Configuración CORS y seguridad (`src/config/cors.config.ts`, `src/main.ts`).
7. Procedimiento de despliegue en VPS/servidor propio.
8. Población inicial de datos (`prisma/seed.ts`).
9. Política de respaldo y restauración (genérica).
10. Verificación post-despliegue (`GET /`, Swagger en desarrollo, healthcheck).

### 04-resolucion-problemas.md

Debe incluir:

1. Introducción al proceso de soporte.
2. Tabla de códigos HTTP y causas.
3. Escenarios de registro y autenticación.
4. Escenarios de agendamiento de citas.
5. Escenarios de pagos.
6. Escenarios de carga de archivos.
7. Escenarios operativos (contenedores, base de datos, Redis).
8. Cómo recolectar logs (`docker compose logs`, logs de NestJS).
9. Contactos o canales de escalamiento `[PENDIENTE]`.

## Especificaciones de diagramas

| Diagrama | Fuente | Formato de salida | Herramienta sugerida |
|----------|--------|-------------------|----------------------|
| ER | `prisma/schema.prisma` | PNG (`er-diagram.png`) | `prisma-erd-generator` o similar; también se puede exportar a Mermaid |
| Componentes | `src/app.module.ts`, `src/common/`, módulos | PNG + fuente Mermaid (`componentes.mmd`) | Mermaid CLI (`mmdc`) |
| Despliegue | `docker-compose.yml`, arquitectura VPS | PNG + fuente Mermaid (`despliegue.mmd`) | Mermaid CLI |

Los archivos fuente `.mmd` DEBEN versionarse junto con el manual para permitir regeneración futura.

## Especificaciones de `Dockerfile` y `docker-compose.yml`

### `Dockerfile`

```text
- Base: node:20-alpine
- Etapas:
  1. deps: copia package.json + pnpm-lock.yaml (si existe) y ejecuta pnpm install.
  2. build: copia el código fuente, ejecuta pnpm run db:generate y pnpm run build.
  3. production: copia solo node_modules de producción y dist/; crea usuario no root.
- Puerto: EXPOSE 3000
- Healthcheck: HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1
- Comando: CMD ["node", "dist/main"]
- Nota: si no existe pnpm-lock.yaml, el Dockerfile DEBE documentar que se genera con pnpm install.
```

### `docker-compose.yml`

```text
- Servicios:
  - api: build: ., ports ["3000:3000"], env_file .env, volumes [uploads], depends_on db/redis (condition: service_healthy)
  - db: image postgres:15, environment POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB, volumen postgres_data, healthcheck pg_isready
  - redis: image redis:7, volumen redis_data, healthcheck redis-cli ping
- Red: vetec-network (bridge)
- Volúmenes: postgres_data, redis_data
- Bind mount: ./uploads:/app/uploads
```

## Especificación de generación del PDF

- **Herramienta recomendada**: `pandoc` + plantilla LaTeX (`xelatex` o `lualatex`) para mayor control tipográfico.
- **Alternativa**: `md-to-pdf` si se prefiere una dependencia Node.js pura.
- **Entradas**:
  - `docs/manual-tecnico/01-descripcion-sistema.md`
  - `docs/manual-tecnico/02-diseno-tecnico.md`
  - `docs/manual-tecnico/03-despliegue-configuracion.md`
  - `docs/manual-tecnico/04-resolucion-problemas.md`
  - Diagramas en `docs/manual-tecnico/diagramas/`
- **Salida**: `docs/manual-tecnico/pdf/manual-tecnico.pdf`
- **Requisitos del PDF**: portada, índice (si la herramienta lo permite), numeración de páginas, encabezado/pie consistente, imágenes de diagramas incrustadas.

## Criterios de aceptación del proposal mapeados a evidencia

| AC del proposal | Requerimiento de esta spec | Evidencia concreta |
|-----------------|----------------------------|--------------------|
| AC-1: Cuatro archivos Markdown en `docs/manual-tecnico/` | MAN-01 a MAN-04 | Existen `01-descripcion-sistema.md`, `02-diseno-tecnico.md`, `03-despliegue-configuracion.md`, `04-resolucion-problemas.md` |
| AC-2: Cada afirmación es rastreable | MAN-06 | Cada sección técnica incluye `[Fuente: ...]` o referencia a archivo de código/config |
| AC-3: Vacíos operativos como placeholders | MAN-07 | Secciones marcadas como `[PENDIENTE]` sin valores inventados |
| AC-4: Diccionario de datos cubre todo el schema | MAN-08 | Tabla/diccionario que incluye todos los modelos y enums de `prisma/schema.prisma` |
| AC-5: Al menos ER, componentes y despliegue | MAN-09 | Archivos `diagramas/er-diagram.png`, `diagramas/componentes.png`, `diagramas/despliegue.png` |
| AC-6: `Dockerfile` y `docker-compose.yml` funcionales | MAN-10 | `docker build -t techside-veterinary .` y `docker compose up` levantan los servicios |
| AC-7: PDF generado | MAN-11 | Archivo `docs/manual-tecnico/pdf/manual-tecnico.pdf` presente |
| AC-8: Tabla de resolución de errores | MAN-04, MAN-12 | Tabla en `04-resolucion-problemas.md` con síntomas, causas y soluciones |

## Vacíos / placeholders aún no resueltos

| Vacío | Por qué está pendiente | Cómo presentarlo en el manual |
|-------|------------------------|-------------------------------|
| URL pública de producción (`BACKEND_BASE_URL`, `FRONTEND_URL`) | No existe en el repositorio | `[PENDIENTE: definir URL de producción]` |
| Sizing de hardware de producción | Depende del volumen de usuarios concurrentes | Documentar mínimos oficiales y marcar sizing real como `[PENDIENTE]` |
| Matriz de navegadores/clientes soportados | No hay datos confirmados | Sección con `[PENDIENTE: definir navegadores mínimos]` |
| CI/CD y registry de imágenes | No existen archivos de pipeline | `[PENDIENTE: pipeline de CI/CD]` |
| Monitoreo, alertas y logs centralizados | Fuera del alcance aprobado | `[PENDIENTE: stack de observabilidad]` |
| Política de respaldo real | Solo se entrega política sugerida genérica | `[PENDIENTE: aprobar frecuencia y retención definitivas]` |
| Recuperación ante desastres (RTO/RPO) | No definidos | `[PENDIENTE: definir RTO/RPO]` |
| `pnpm-lock.yaml` | No existe en el working tree | Nota de riesgo y recomendación de generarlo |
| Inconsistencia de licencia (`package.json` UNLICENSED vs `README.md` MIT) | Requiere decisión legal | Documentar `UNLICENSED` como fuente autorizada y señalar la discrepancia |

## Notas de riesgo

- **NO inventar**: URLs de producción, nombres de host, credenciales, especificaciones de hardware reales, matrices de navegador, políticas de backup aprobadas, RTO/RPO, datos de contacto de soporte, ni nombres de proveedores cloud.
- **NO activar código**: el módulo `ThrottlerModule` debe seguir documentado como planificado; no se modificará `src/app.module.ts` en este cambio.
- **NO corregir la lógica de negocio**: el manual describe el comportamiento actual del código; si hay inconsistencias (por ejemplo, licencia), se documentan como gaps.
- **Versionar fuentes de diagramas**: siempre guardar los archivos `.mmd` y el schema para evitar divergencia futura.
- **Revisar trazabilidad antes de entregar**: cada afirmación debe poder verificarse en el repositorio con un `grep` o lectura directa del archivo citado.

## Skill resolution

- **Skill loading:** `paths-injected` — se leyó `/home/styc/.config/opencode/skills/cognitive-doc-design/SKILL.md` antes de redactar la especificación.
- No fue necesario fallback al registro ni a rutas adicionales.
- Se aplicaron los patrones del skill: título orientado al resultado, *quick path*, tablas de decisiones, listas de verificación y secciones enfocadas en decisiones.

## Checklist de salida de esta fase

- [x] Especificación escrita en `openspec/changes/technical-manual-dnp/spec.md`.
- [x] Requerimientos funcionales con al menos un escenario por requerimiento.
- [x] Especificaciones de capítulos, diagramas, Docker y PDF definidas.
- [x] Criterios de aceptación del proposal mapeados a requerimientos y evidencia.
- [x] Vacíos y riesgos documentados.
- [x] Skill resolution incluida.

## Siguiente paso recomendado

Fase de **diseño/SDD-tasks**: descomponer la spec en tareas concretas para redactar los capítulos, generar los diagramas, crear los contenedores y generar el PDF, priorizando la entrega por los tres PRs sugeridos en el proposal.
