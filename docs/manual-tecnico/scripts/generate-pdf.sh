#!/usr/bin/env bash
# Genera el PDF del Manual Técnico y de Operación usando md-to-pdf.
# Fallback para entornos sin pandoc + xelatex.
# [Fuente: design.md, spec.md#MAN-11]

set -e

BASE_DIR="docs/manual-tecnico"
PDF_DIR="${BASE_DIR}/pdf"
PLANTILLAS_DIR="${BASE_DIR}/plantillas"
OUTPUT="${PDF_DIR}/manual-tecnico.pdf"
TMP_FILE="${PDF_DIR}/.manual-combined.md"

mkdir -p "${PDF_DIR}"

# Verificar archivos fuente
for file in \
	"${PLANTILLAS_DIR}/portada.md" \
	"${BASE_DIR}/01-descripcion-sistema.md" \
	"${BASE_DIR}/02-diseno-tecnico.md" \
	"${BASE_DIR}/03-despliegue-configuracion.md" \
	"${BASE_DIR}/04-resolucion-problemas.md"; do
	if [[ ! -f "${file}" ]]; then
		echo "Error: no existe ${file}" >&2
		exit 1
	fi
done

# Concatenar capítulos en un archivo temporal
cat \
	"${PLANTILLAS_DIR}/portada.md" \
	"${BASE_DIR}/01-descripcion-sistema.md" \
	"${BASE_DIR}/02-diseno-tecnico.md" \
	"${BASE_DIR}/03-despliegue-configuracion.md" \
	"${BASE_DIR}/04-resolucion-problemas.md" \
	>"${TMP_FILE}"

# Generar PDF con md-to-pdf (el nombre de salida se deriva del archivo .md)
npx md-to-pdf "${TMP_FILE}" \
	--stylesheet "${PLANTILLAS_DIR}/pdf-style.css" \
	--pdf-options '{"format":"A4","printBackground":true,"margin":{"top":"2.5cm","right":"2.5cm","bottom":"2.5cm","left":"2.5cm"},"displayHeaderFooter":true,"headerTemplate":"<div style=\"font-size:9pt;color:#505050;width:100%;padding:0 1cm;display:flex;justify-content:space-between;\"><span>Manual Técnico y de Operación — techside-veterinary</span><span></span></div>","footerTemplate":"<div style=\"font-size:10pt;color:#333;width:100%;text-align:center;\"><span class=\"pageNumber\"></span></div>"}'

# Renombrar salida y limpiar temporal
mv "${PDF_DIR}/.manual-combined.pdf" "${OUTPUT}"
rm "${TMP_FILE}"

echo "PDF generado: ${OUTPUT}"
