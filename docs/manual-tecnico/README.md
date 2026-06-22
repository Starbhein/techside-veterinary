# Manual Técnico y de Operación — Instrucciones de construcción

Este directorio contiene el manual técnico del sistema `techside-veterinary`, elaborado conforme a la *Guía para la Elaboración del Manual Técnico y de Operación del Sistema* del DNP Colombia.

## Estructura

```text
docs/manual-tecnico/
├── 01-descripcion-sistema.md      # Capítulo 1 — Descripción del sistema
├── 02-diseno-tecnico.md           # Capítulo 2 — Diseño técnico
├── 03-despliegue-configuracion.md # Capítulo 3 — Despliegue y configuración
├── 04-resolucion-problemas.md     # Capítulo 4 — Resolución de problemas
├── README.md                      # Este archivo
├── diagramas/
│   ├── er-diagram.png             # Generado desde `prisma/schema.prisma`
│   ├── componentes.mmd            # Fuente del diagrama de componentes
│   ├── componentes.png            # Renderizado del diagrama de componentes
│   ├── despliegue.mmd             # Fuente del diagrama de despliegue (PR-2)
│   └── despliegue.png             # Renderizado del diagrama de despliegue (PR-2)
├── plantillas/
│   ├── portada.md                 # Portada para el PDF (PR-3)
│   └── pandoc-template.tex        # Plantilla LaTeX (PR-3)
└── pdf/
    └── manual-tecnico.pdf         # PDF final generado (PR-3)
```

## Regenerar diagramas

### Diagrama entidad-relación

El diagrama ER se genera automáticamente al ejecutar Prisma generate:

```bash
pnpm run db:generate
```

El resultado se escribe en `docs/manual-tecnico/diagramas/er-diagram.png`.

### Diagramas de componentes y despliegue

Los diagramas Mermaid se renderizan con `@mermaid-js/mermaid-cli`:

```bash
pnpm run manual:diagrams
```

O manualmente:

```bash
mmdc -i docs/manual-tecnico/diagramas/componentes.mmd -o docs/manual-tecnico/diagramas/componentes.png -b transparent
mmdc -i docs/manual-tecnico/diagramas/despliegue.mmd -o docs/manual-tecnico/diagramas/despliegue.png -b transparent
```

## Generar el PDF

### Opción recomendada (pandoc + LaTeX)

Si están disponibles [pandoc](https://pandoc.org/installing.html) y un motor LaTeX como `xelatex` o `lualatex`:

```bash
pnpm run manual:pdf:pandoc
```

Esta opción utiliza la plantilla `docs/manual-tecnico/plantillas/pandoc-template.tex` y genera un PDF con índice, numeración y estilos tipográficos completos.

### Opción por defecto en este entorno (md-to-pdf)

Como fallback cuando no se dispone de LaTeX, el proyecto incluye `md-to-pdf` y un script que concatena la portada y los cuatro capítulos:

```bash
pnpm run manual:pdf
```

El PDF resultante se guarda en `docs/manual-tecnico/pdf/manual-tecnico.pdf`.

> **Nota:** `md-to-pdf` usa Puppeteer/Chromium. En entornos sin interfaz gráfica puede requerir las opciones `--no-sandbox`.

## Verificación de trazabilidad

Para asegurar que cada afirmación técnica tenga fuente:

```bash
grep -R "\[Fuente:" docs/manual-tecnico/*.md
```

Para listar los vacíos operativos pendientes:

```bash
grep -R "\[PENDIENTE" docs/manual-tecnico/*.md
```
