# SDD Proposal: Manual Técnico y de Operación DNP para `techside-veterinary`

## Outcome

Crear un manual técnico y de operación completo, en español mexicano y alineado a la *Guía para la Elaboración del Manual Técnico y de Operación del Sistema* del DNP Colombia, para el backend API `techside-veterinary` (NestJS + PostgreSQL + Redis). El manual se entregará como capítulos Markdown bajo `docs/manual-tecnico/` y una versión PDF generada, acompañado de los artefactos de despliegue `Dockerfile` y `docker-compose.yml`.

## Quick path

1. Recopilar la información técnica directamente de código, configuración y documentación comprometida (`README.md`, `API-DOCS.md`, `prisma/schema.prisma`, `src/`, `package.json`).
2. Redactar los cuatro capítulos DNP en archivos Markdown independientes.
3. Generar diagramas de soporte (ER, componentes, despliegue) a partir del schema y la estructura de módulos.
4. Crear `Dockerfile` y `docker-compose.yml` para el stack API + PostgreSQL + Redis.
5. Exportar el manual a PDF.
6. Revisar que toda afirmación sea rastreable y que los vacíos operativos estén marcados como *placeholders*, no inventados.

## Problem statement and motivation

Actualmente la documentación del sistema está fragmentada en `README.md` (guía de instalación local), `API-DOCS.md` (referencia de endpoints) y el propio código. No existe un documento único que describa el sistema para auditoría, entrega a cliente/operaciones o cumplimiento formal. La guía DNP exige cuatro capítulos estructurados (descripción, diseño técnico, despliegue y resolución de problemas) que hoy no están consolidados. Además, no hay artefactos de contenedores que codifiquen el despliegue, por lo que las instrucciones de operación son procedimentales y dependen del entorno del lector.

## Scope

### In scope

- Redactar los cuatro capítulos del manual DNP en `docs/manual-tecnico/`:
  1. Descripción del Sistema de Información Desarrollado.
  2. Diseño técnico del sistema de información.
  3. Despliegue y configuración de componentes.
  4. Resolución de problemas.
- Crear diagramas de soporte: modelo entidad-relación, diagrama de componentes y diagrama de despliegue.
- Construir diccionario de datos basado en `prisma/schema.prisma`.
- Documentar endpoints, roles, guards y máquinas de estados rastreables a `src/`.
- Crear `Dockerfile` para la API NestJS.
- Crear `docker-compose.yml` para levantar API + PostgreSQL 15 + Redis 7.
- Generar versión PDF del manual.

### Non-goals

- No se modificará la lógica de negocio ni los endpoints existentes.
- No se implementará CI/CD, monitoreo, alerting ni backups reales (solo se documentarán los procedimientos conocidos o los vacíos).
- No se corregirá el módulo de throttler comentado ni se activará rate limiting.
- No se inventarán URLs de producción, especificaciones de hardware, políticas de respaldo ni matrices de navegador.

## Acceptance criteria

| ID | Criterio |
|----|----------|
| AC-1 | Existen cuatro archivos Markdown bajo `docs/manual-tecnico/`, uno por capítulo DNP, en español mexicano. |
| AC-2 | Cada afirmación técnica del manual se puede rastrear a `src/`, `prisma/`, `package.json`, `README.md` o `API-DOCS.md`. |
| AC-3 | Los vacíos operativos (URLs de producción, sizing, backup, CI/CD, etc.) aparecen explícitamente como *placeholders* o secciones pendientes, sin datos inventados. |
| AC-4 | El diccionario de datos cubre todas las entidades y enums de `prisma/schema.prisma`. |
| AC-5 | Se incluyen al menos un diagrama ER, un diagrama de componentes y un diagrama de despliegue. |
| AC-6 | Existe un `Dockerfile` funcional para la API y un `docker-compose.yml` que levanta API + PostgreSQL 15 + Redis 7. |
| AC-7 | Se genera un PDF del manual completo bajo `docs/manual-tecnico/pdf/`. |
| AC-8 | El manual incluye tablas de resolución de errores técnicos comunes con causa y solución. |

## Deliverables

| Ruta | Descripción |
|------|-------------|
| `docs/manual-tecnico/01-descripcion-sistema.md` | Introducción, objetivos y descripción general del sistema. |
| `docs/manual-tecnico/02-diseno-tecnico.md` | Requerimientos, stack, componentes, modelo de datos, funcionalidad y servicios. |
| `docs/manual-tecnico/03-despliegue-configuracion.md` | Organización de componentes, instalación local, Docker, configuración y despliegue. |
| `docs/manual-tecnico/04-resolucion-problemas.md` | Errores comunes, diagnóstico y solución. |
| `docs/manual-tecnico/diagramas/er-diagram.png` | Diagrama entidad-relación generado desde Prisma. |
| `docs/manual-tecnico/diagramas/componentes.png` | Diagrama de componentes de NestJS. |
| `docs/manual-tecnico/diagramas/despliegue.png` | Diagrama de despliegue con contenedores. |
| `Dockerfile` | Imagen de producción para la API. |
| `docker-compose.yml` | Orquestación local/producción ligera de API + PostgreSQL + Redis. |
| `docs/manual-tecnico/pdf/manual-tecnico.pdf` | Versión PDF del manual completo. |

## Risks and dependencies

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Falta de datos operativos reales (URL prod, sizing, backup) | El capítulo 3 quedará con *placeholders* | Listar los vacíos explícitamente y solicitarlos al usuario durante spec/design. |
| No existe `pnpm-lock.yaml` | No se puede documentar un árbol de dependencias reproducible exacto | Documentar versiones semánticas de `package.json` y señalar la falta del lockfile. |
| Throttler instalado pero deshabilitado en `app.module.ts` | La documentación de rate limits en `API-DOCS.md` no se ejecuta | Verificar con el usuario si se documenta como planificado o se retira. |
| Licencia `UNLICENSED` en `package.json` | Capítulo legal/información del sistema incompleto | Solicitar licencia final del sistema y del manual. |
| Diagramas manuales propensos a quedar desactualizados | Riesgo de inconsistencia entre manual y código | Generar el ER desde Prisma y mantener los diagramas como código (Mermaid/PlantUML) cuando sea posible. |
| Requisitos de hardware mínimos vs. PC de desarrollo | Puede confundirse el entorno de desarrollo con sizing de producción | Usar los mínimos oficiales de Node.js 20, PostgreSQL 15, Redis 7 y NestJS; separar claramente dev vs. producción. |

## Gaps that need user input during spec/design

| Gap | Por qué importa | Pregunta clave |
|-----|-----------------|----------------|
| Producción: URLs, hostnames y entorno de despliegue | Necesarios para el diagrama de despliegue y variables de entorno de producción | ¿Cuál es la URL pública del backend, del frontend y el proveedor de infraestructura (AWS, VPS, on-premise)? |
| Sizing de hardware por ambiente | El DNP solicita requisitos técnicos del sistema | ¿Cuáles son los recursos CPU/RAM/disco esperados para producción y cuántos usuarios concurrentes se esperan? |
| Política de respaldos y restauración | Capítulo de operaciones requiere procedimientos de backup | ¿Existe una política de backup de PostgreSQL/Redis (frecuencia, retención, herramienta) o debe proponerse una genérica? |
| CI/CD y registry de imágenes | El despliegue no está codificado | ¿Se utiliza GitHub Actions, GitLab CI, otro pipeline o se entrega solo el compose manual? |
| Navegadores/clientes soportados | Prerrequisitos del usuario final | ¿Qué navegadores y versiones mínimas deben soportar los clientes del sistema? |
| Licencia del sistema y del manual | Información legal | ¿Bajo qué licencia se publica el sistema y el manual? |
| Recuperación ante desastres (RTO/RPO) | Continuidad del negocio | ¿Existen objetivos de tiempo de recuperación y punto de recuperación definidos? |

## Chained PR / delivery strategy recommendation

Se recomienda dividir la entrega en tres PRs para mantener la revisión por debajo del presupuesto de ~400 líneas cambiadas y facilitar retroalimentación:

1. **PR-1: Estructura del manual y capítulos 1-2**
   - `docs/manual-tecnico/01-descripcion-sistema.md`
   - `docs/manual-tecnico/02-diseno-tecnico.md`
   - Diagramas ER y de componentes.
   - Objetivo: validar contenido técnico y diccionario de datos.

2. **PR-2: Capítulos 3-4 y artefactos de despliegue**
   - `docs/manual-tecnico/03-despliegue-configuracion.md`
   - `docs/manual-tecnico/04-resolucion-problemas.md`
   - `Dockerfile`
   - `docker-compose.yml`
   - Diagrama de despliegue.
   - Objetivo: validar procedimientos operativos y contenedores.

3. **PR-3: PDF generado y ajustes finales**
   - Script/generación de `docs/manual-tecnico/pdf/manual-tecnico.pdf`.
   - Correcciones derivadas de las revisiones anteriores.
   - Objetivo: aprobación final del manual completo.

Si el usuario prefiere una única entrega, se puede consolidar en un solo PR siempre que el diff no exceda el presupuesto de revisión.

## Skill resolution

- `paths-injected`: se cargó el skill `cognitive-doc-design` desde `/home/styc/.config/opencode/skills/cognitive-doc-design/SKILL.md`.
- No fue necesario fallback al registro ni a rutas adicionales.

## Proposal question round

Antes de pasar a la fase de especificación/diseño, necesito confirmar o corregir los siguientes supuestos para que el manual refleje la realidad operativa del proyecto y no incluya datos inventados.

1. **Entorno de producción**: ¿El despliegue productivo será en un VPS/VM propia, AWS ECS/Fargate, otra nube o aún no está definido? Esto afecta el diagrama de despliegue y las variables `BACKEND_BASE_URL` / `FRONTEND_URL`.

2. **Backup y restauración**: ¿Existe hoy una política de respaldo de PostgreSQL/Redis (herramienta, frecuencia, retención) o debo dejarlo como sección pendiente con un procedimiento genérico?

3. **Rate limiting**: `API-DOCS.md` documenta respuestas `429 Too Many Requests`, pero `@nestjs/throttler` está comentado en `app.module.ts`. ¿Se documenta el rate limiting como funcionalidad planificada, o se elimina la referencia al `429` del manual?

4. **Navegadores/clientes soportados**: ¿Qué navegadores y versiones mínimas deben soportar los clientes del sistema (dueños de mascotas, médicos, administradores)?

5. **Licencia**: `package.json` indica `UNLICENSED`. ¿Cuál es la licencia final del sistema y bajo qué licencia se publicará el manual?
