# SDD Archive Report — `technical-manual-dnp`

## Change summary

| Field | Value |
|-------|-------|
| Change name | `technical-manual-dnp` |
| Status | completed |
| Merged PRs | #45, #46, #47 |
| Merge target branch | `main` |
| Archive path | `openspec/archive/technical-manual-dnp/` |
| Archive date | 2026-06-22 |

## Archived artifacts

The following SDD artifacts were moved from `openspec/changes/technical-manual-dnp/` to `openspec/archive/technical-manual-dnp/`:

| File | Description |
|------|-------------|
| `explore.md` | Exploration of the codebase, stack, data model, and service inventory. |
| `proposal.md` | SDD proposal: outcome, scope, acceptance criteria, delivery strategy. |
| `spec.md` | Detailed specification for the four DNP manual chapters, diagrams, Docker/PDF artifacts. |
| `design.md` | Design: content architecture, chapter-by-chapter structure, diagram strategy, Dockerfile/compose design, PDF generation plan. |
| `tasks.md` | Implementation tasks split across PR-1, PR-2, and PR-3. |
| `apply-progress.md` | Apply-phase progress and TDD evidence for all three PRs. |
| `verify-report.md` | Verification report for PR-1. |
| `verify-report-pr2.md` | Verification report for PR-2. |
| `verify-report-pr3.md` | Verification report for PR-3. |
| `archive-report.md` | This archive report. |

## What was delivered

PRs #45, #46, and #47 implemented the DNP technical and operations manual for `techside-veterinary`:

- **Four Markdown chapters** under `docs/manual-tecnico/`:
  - `01-descripcion-sistema.md`
  - `02-diseno-tecnico.md`
  - `03-despliegue-configuracion.md`
  - `04-resolucion-problemas.md`
- **Support diagrams** under `docs/manual-tecnico/diagramas/`:
  - `er-diagram.png` (generated from `prisma/schema.prisma`)
  - `componentes.mmd` / `componentes.png`
  - `despliegue.mmd` / `despliegue.png`
- **Container artifacts**:
  - `Dockerfile` (multi-stage, `node:20-alpine`, pnpm, non-root, healthcheck)
  - `docker-compose.yml` (API + PostgreSQL 15 + Redis 7)
  - `.dockerignore`
- **PDF generation pipeline**:
  - `docs/manual-tecnico/plantillas/pandoc-template.tex`
  - `docs/manual-tecnico/plantillas/portada.md`
  - `docs/manual-tecnico/plantillas/pdf-style.css`
  - `docs/manual-tecnico/scripts/generate-pdf.sh`
  - `docs/manual-tecnico/pdf/manual-tecnico.pdf`
- **Build/render instructions** in `docs/manual-tecnico/README.md`.
- **Package automation** in `package.json`:
  - `manual:diagrams`, `manual:pdf`, `manual:pdf:pandoc` scripts
  - Dev dependencies for ERD generation, Mermaid CLI, and `md-to-pdf`

## Verification summary

| PR | Verify report status | Key result |
|----|----------------------|------------|
| PR-1 (#45) | partial | Content complete; stale checkboxes and strict-TDD format noted. |
| PR-2 (#46) | partial | Static/docs checks pass; Docker runtime verification blocked by environment permissions. |
| PR-3 (#47) | conditional pass | PDF/template files delivered; isolated checkout cannot regenerate PDF until PR-1/PR-2 are integrated. |

All three PRs were merged to `main` before archiving. No unchecked implementation task boxes remain in `tasks.md`.

## Known gaps / placeholders left in the manual

The following gaps were intentionally documented as `[PENDIENTE]` or noted in the verify reports rather than invented:

| Gap | Reason / location |
|-----|-------------------|
| Production URLs (`BACKEND_BASE_URL`, `FRONTEND_URL`) | Not present in the repository. |
| Real production hardware sizing | Depends on concurrent-user targets; only official runtime minimums documented. |
| Browser/client compatibility matrix | No confirmed data available. |
| CI/CD pipeline and container registry | No pipeline files exist in the repo. |
| Monitoring, alerting, and centralized logging | Out of scope for this change. |
| Approved backup/restore policy | Generic `pg_dump` / `BGSAVE` procedure delivered; real policy pending. |
| Disaster-recovery objectives (RTO/RPO) | Not defined. |
| `pnpm-lock.yaml` | Absent at time of delivery; Dockerfile uses `--frozen-lockfile=false`. |
| License discrepancy | `package.json` says `UNLICENSED`; `README.md` mentions MIT — documented as pending resolution. |
| Rate limiting | `@nestjs/throttler` installed but commented out in `app.module.ts`; documented as planned. |
| Docker runtime verification | Could not be executed in the apply/verify environment due to Docker daemon permissions. |
| Pandoc PDF path | `manual:pdf:pandoc` script not exercised; fallback `md-to-pdf` was used. |

## Lessons learned

1. **Stacked PRs work for large documentation changes**, but they create coordination overhead for shared files (`docs/manual-tecnico/README.md`, `.gitignore`, `pnpm-workspace.yaml`). Strict merge order (PR-1 → PR-2 → PR-3) is required.
2. **Repository-wide `.gitignore` rules can surprise documentation work**. A global `*.md` ignore rule required explicit `!docs/manual-tecnico/**/*.md` exceptions.
3. **pnpm 11 build approvals matter**. `prisma-erd-generator` depends on `puppeteer`; its postinstall was blocked until `puppeteer: true` was added to `pnpm-workspace.yaml#allowBuilds`.
4. **Missing lockfile hurts reproducibility**. The absence of `pnpm-lock.yaml` forced the Dockerfile to use `--frozen-lockfile=false` and was documented as a risk.
5. **PDF generation needs environment fallbacks**. The preferred `pandoc` + LaTeX path was unavailable, so an `md-to-pdf` fallback was implemented and documented.
6. **Container verification needs a Docker-capable environment**. Static review of `Dockerfile` and `docker-compose.yml` matched the design, but runtime build/compose tests were blocked.
7. **Task checkbox hygiene matters for archive**. PR-1 verification flagged stale unchecked boxes in `tasks.md` even though the work was delivered.

## Sync notes

This change did not produce domain-specific canonical specs under `openspec/specs/{domain}/`. The only existing canonical spec (`openspec/specs/api-documentation.md`) was outside this change's scope. Therefore no canonical spec sync was required before archiving.

## Skill resolution

- **Skill loading:** `paths-injected` — read `/home/styc/.config/opencode/skills/work-unit-commits/SKILL.md` before committing the archive.
- No fallback registry or additional skill discovery was needed.
