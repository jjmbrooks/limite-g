#!/usr/bin/env bash
# Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
# Control de calidad local y en CI. Uso: bash scripts/qa.sh   (requiere Node ≥ 20 y python3)
set -uo pipefail
cd "$(dirname "$0")/.."
fallos=0
paso() { printf '\n▸ %s\n' "$1"; }
ok_o_falla() { if [ "$1" -ne 0 ]; then fallos=$((fallos+1)); echo "  ✗ FALLÓ: $2"; fi; }

paso "1. Sintaxis de todos los .js / .mjs (node --check)"
n=0; err=0
while IFS= read -r f; do
  n=$((n+1))
  if ! node --check "$f" 2>/tmp/qa-check.txt; then err=$((err+1)); echo "  ✗ $f"; sed 's/^/    /' /tmp/qa-check.txt; fi
done < <(git ls-files --cached --others --exclude-standard -- '*.js' '*.mjs')
[ "$err" -eq 0 ] && echo "  ✓ $n archivos con sintaxis válida"
ok_o_falla "$err" "sintaxis"

paso "2. Imports relativos y exports (enlace de módulos ES)"
if command -v npx >/dev/null && npx --no-install esbuild --version >/dev/null 2>&1; then
  npx --no-install esbuild js/main.js --bundle --format=esm --outfile=/tmp/qa.js --log-level=warning; ok_o_falla $? "esbuild"
fi
node --experimental-vm-modules --no-warnings scripts/qa/link.mjs; ok_o_falla $? "imports"

paso "3. index.html referencia archivos existentes"
node scripts/qa/html-refs.mjs; ok_o_falla $? "referencias HTML"

paso "3b. PWA: sw.js precarga todos los archivos de runtime y el manifiesto es válido"
node scripts/qa/sw-precache.mjs; ok_o_falla $? "precache del service worker"
node -e "const m=JSON.parse(require('fs').readFileSync('manifest.webmanifest','utf8'));for(const i of m.icons){if(!require('fs').existsSync(i.src))throw new Error('falta '+i.src)}if(m.start_url!=='./'||m.scope!=='./')throw new Error('start_url/scope deben ser ./');console.log('  ✓ manifest.webmanifest válido ('+m.icons.length+' íconos)')"; ok_o_falla $? "manifiesto"

paso "4. Limpieza: console.log y TODO sin marcar"
node scripts/qa/lint.mjs; ok_o_falla $? "limpieza"

paso "5. Pruebas unitarias (física y datos)"
node --test --test-reporter=spec tests/*.test.mjs 2>&1 | grep -E "^(✔|✖|ℹ (tests|pass|fail))|✖|Error|esperado" ; r=${PIPESTATUS[0]}; r=$?
[ "$r" -eq 0 ] && echo "  ✓ pruebas en verde"
ok_o_falla "$r" "pruebas"

paso "6. Humo: servidor local"
PORT=$((8700 + RANDOM % 200))
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
for _ in $(seq 1 30); do curl -s -o /dev/null "http://127.0.0.1:$PORT/" && break; sleep 0.2; done
node scripts/qa/http-smoke.mjs "http://127.0.0.1:$PORT/"; ok_o_falla $? "humo HTTP"
hay_pw=0
if [ -n "${PLAYWRIGHT_DIR:-}" ] && [ -d "$PLAYWRIGHT_DIR/node_modules/playwright" ]; then hay_pw=1; fi
if [ "$hay_pw" -eq 0 ] && node -e "require.resolve('playwright')" >/dev/null 2>&1; then hay_pw=1; fi
if [ "$hay_pw" -eq 1 ]; then
  node scripts/qa/browser-smoke.mjs "http://127.0.0.1:$PORT/"; ok_o_falla $? "humo en navegador"
else
  echo "  ! Playwright/Chromium no disponible: se omite la prueba de consola en navegador (haz la revisión manual de docs/QA.md)."
  echo "    Para activarla: npm i playwright en otra carpeta y exporta PLAYWRIGHT_DIR=esa/carpeta (y CHROMIUM_PATH si hace falta)."
fi

echo
if [ "$fallos" -eq 0 ]; then echo "✅ QA OK"; exit 0; else echo "❌ QA con $fallos fallo(s)"; exit 1; fi
