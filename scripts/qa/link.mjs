// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Enlaza (sin ejecutar) todos los módulos ES de js/ como lo haría el navegador:
// falla si un import relativo no existe o si pide un export que el módulo no tiene.
// Uso: node --experimental-vm-modules scripts/qa/link.mjs
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const cache = new Map();
let errors = 0;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.js') ? [path.join(dir, d.name)] : []);
}
function load(file) {
  if (cache.has(file)) return cache.get(file);
  if (!fs.existsSync(file)) throw new Error(`no existe ${path.relative(ROOT, file)}`);
  const m = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { identifier: file });
  cache.set(file, m);
  return m;
}
function linker(spec, ref) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) throw new Error(`import no relativo "${spec}" en ${path.relative(ROOT, ref.identifier)} (el juego no usa paquetes npm)`);
  return load(path.resolve(path.dirname(ref.identifier), spec));
}

const files = walk(path.join(ROOT, 'js'));
for (const f of files) {
  const rel = path.relative(ROOT, f);
  try { const m = load(f); if (m.status === 'unlinked') await m.link(linker); }
  catch (e) { errors++; console.error(`  ✗ ${rel}: ${e.message}`); }
}
// Archivos .js que nadie importa (código muerto) se avisan, no fallan.
const reached = new Set();
(function visit(f) { if (reached.has(f)) return; reached.add(f); const m = cache.get(f); if (!m) return;
  for (const s of m.dependencySpecifiers) visit(path.resolve(path.dirname(f), s)); })(path.join(ROOT, 'js/main.js'));
for (const f of files) if (!reached.has(f)) console.warn(`  ! ${path.relative(ROOT, f)} no se importa desde js/main.js`);
if (errors) process.exit(1);
console.log(`  ✓ ${files.length} módulos enlazados sin errores`);
