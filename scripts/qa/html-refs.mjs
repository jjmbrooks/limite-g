// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Verifica que index.html (y cualquier .html de la raíz) solo referencia archivos locales que existen.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
let bad = 0, n = 0;
for (const html of fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'))) {
  const src = fs.readFileSync(path.join(ROOT, html), 'utf8');
  for (const [, , url] of src.matchAll(/\b(src|href)=["']([^"'#]+)["']/g)) {
    if (/^(https?:|data:|mailto:|\/\/)/.test(url)) continue;
    n++;
    const file = path.join(ROOT, url.split('?')[0]);
    if (!fs.existsSync(file)) { bad++; console.error(`  ✗ ${html} → ${url} no existe`); }
  }
}
if (bad) process.exit(1);
console.log(`  ✓ ${n} referencias locales en HTML existen`);
