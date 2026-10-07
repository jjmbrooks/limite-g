// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Reglas de limpieza: sin console.log olvidados y sin TODO sin marcar.
// Un TODO válido lleva módulo del PLAN: "TODO(M7): ...". Para permitir un console.log a propósito: "// qa-ok".
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : /\.(js|mjs|css|html)$/.test(d.name) ? [path.join(dir, d.name)] : []);
const files = [...walk(path.join(ROOT, 'js')), ...walk(path.join(ROOT, 'css')), path.join(ROOT, 'index.html')];
let bad = 0;
for (const f of files) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
    const where = `${path.relative(ROOT, f)}:${i + 1}`;
    if (/console\.(log|debug)\s*\(/.test(line) && !line.includes('qa-ok')) { bad++; console.error(`  ✗ ${where} console.log olvidado`); }
    if (/\b(TODO|FIXME|XXX)\b/.test(line) && !/\b(TODO|FIXME)\(M\d+\)/.test(line)) { bad++; console.error(`  ✗ ${where} TODO sin marcar (usa "TODO(Mx): ...")`); }
  });
}
if (bad) process.exit(1);
console.log(`  ✓ ${files.length} archivos limpios (sin console.log ni TODO sin marcar)`);
