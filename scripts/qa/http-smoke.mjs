// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Humo HTTP (no necesita navegador): pide al servidor local index.html, el CSS y cada módulo JS
// alcanzable desde js/main.js y falla si alguno no responde 200 con el tipo correcto.
// Uso: node scripts/qa/http-smoke.mjs http://127.0.0.1:8765/
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:8000/';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const urls = new Set(['index.html', 'css/style.css']);
(function visit(rel) {
  if (urls.has(rel)) return;
  urls.add(rel);
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  for (const [, a, b] of src.matchAll(/(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]/g)) {
    const spec = a || b;
    if (spec) visit(path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec)));
  }
})('js/main.js');
let bad = 0;
for (const u of urls) {
  try {
    const r = await fetch(new URL(u, base));
    const type = r.headers.get('content-type') || '';
    const okType = u.endsWith('.js') ? /javascript/.test(type) : true;
    if (!r.ok || !okType) { bad++; console.error(`  ✗ ${u} → ${r.status} ${type}`); }
  } catch (e) { bad++; console.error(`  ✗ ${u} → ${e.message}`); }
}
if (bad) process.exit(1);
console.log(`  ✓ ${urls.size} archivos servidos correctamente por HTTP`);
