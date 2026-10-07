#!/usr/bin/env bash
# Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
# Commit firmado por Hark + línea en CHANGELOG.md (sección [Unreleased]).
#
# Uso:
#   scripts/hark-commit.sh "M3: sprites pixel art" [Tipo] ["Texto para el CHANGELOG"]
#   Tipo: Added | Changed | Fixed | Removed (por defecto Added).
#   Si no das texto de CHANGELOG se usa el mensaje del commit.
#   HARK_SKIP_CHANGELOG=1 omite la línea de CHANGELOG (p. ej. si ya la escribiste a mano).
#   HARK_SKIP_QA=1 omite scripts/qa.sh (no recomendado).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

msg="${1:?Falta el mensaje del commit}"
tipo="${2:-Added}"
texto="${3:-$msg}"
HARK="Hark <hark@hark.ai>"

if [[ "${HARK_SKIP_QA:-0}" != "1" && -x scripts/qa.sh ]]; then
  bash scripts/qa.sh || { echo "✗ qa.sh falló: no se hace commit." >&2; exit 1; }
fi

if [[ "${HARK_SKIP_CHANGELOG:-0}" != "1" ]]; then
  python3 - "$tipo" "$texto" <<'PY'
import sys, re, pathlib
tipo, texto = sys.argv[1], sys.argv[2]
p = pathlib.Path("CHANGELOG.md")
s = p.read_text(encoding="utf-8")
linea = f"- {texto} — firmado: Hark\n"
m = re.search(r"## \[Unreleased\]\n", s)
if not m:
    raise SystemExit("CHANGELOG.md no tiene sección [Unreleased]")
inicio = m.end()
fin_m = re.search(r"\n## \[", s[inicio:])
fin = inicio + fin_m.start() + 1 if fin_m else len(s)
bloque = s[inicio:fin]
h = f"### {tipo}\n"
if h in bloque:
    i = inicio + bloque.index(h) + len(h)
    # al final de la lista de esa sección
    j = i
    while j < fin and s[j:j+2] == "- ":
        j = s.index("\n", j) + 1
    s = s[:j] + linea + s[j:]
else:
    s = s[:inicio] + f"\n{h}{linea}" + s[inicio:]
p.write_text(s, encoding="utf-8")
PY
fi

git add -A
git commit -s --trailer "Co-authored-by: $HARK" -m "$msg"
git log -1 --format='✓ %h %s'
