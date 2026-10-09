// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Verifica que la lista PRECACHE de sw.js contiene exactamente los archivos de runtime del repo
// (index.html, manifest.webmanifest, css/, js/, assets/; sin .gitkeep, .txt ni .md) y que todos existen.
// Uso: node scripts/qa/sw-precache.mjs        → verifica
//      node scripts/qa/sw-precache.mjs --fix  → reescribe la lista (recuerda subir VERSION en sw.js)
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const SW = path.join(ROOT, 'sw.js');
const runtime = execSync('git ls-files --cached --others --exclude-standard -- index.html manifest.webmanifest css js assets', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => f && !/\.(gitkeep|txt|md)$/.test(f) && fs.existsSync(path.join(ROOT, f)))
  // M12.1: la música por sección se guarda en caché al sonar por primera vez (ahorro de datos); solo tema.m4a y sfx/ se precargan.
  .filter((f) => !/^assets\/audio\/(?!tema\.m4a$|sfx\/)[^/]+\.m4a$/.test(f)).sort();
const want = ['./', ...runtime.filter((f) => f !== 'index.html'), 'index.html'];
const src = fs.readFileSync(SW, 'utf8');
const m = src.match(/\/\/ <precache>\n([\s\S]*?)\/\/ <\/precache>/);
if (!m) { console.error('  ✗ sw.js no tiene los marcadores // <precache> … // </precache>'); process.exit(1); }
if (process.argv.includes('--fix')) {
  const block = `const PRECACHE = [\n${want.map((f) => `  '${f}',`).join('\n')}\n];\n`;
  fs.writeFileSync(SW, src.replace(m[1], block));
  console.log(`  ✓ sw.js: PRECACHE con ${want.length} entradas (sube VERSION si vas a publicar)`);
  process.exit(0);
}
const have = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
const faltan = want.filter((f) => !have.includes(f));
const sobran = have.filter((f) => !want.includes(f));
const noExisten = have.filter((f) => f !== './' && !fs.existsSync(path.join(ROOT, f)));
if (!/const VERSION = '[^']+'/.test(src)) { console.error('  ✗ sw.js sin const VERSION'); process.exit(1); }
if (faltan.length || sobran.length || noExisten.length) {
  faltan.forEach((f) => console.error(`  ✗ falta en PRECACHE de sw.js: ${f}`));
  sobran.forEach((f) => console.error(`  ✗ sobra en PRECACHE de sw.js (no es archivo de runtime): ${f}`));
  noExisten.forEach((f) => console.error(`  ✗ PRECACHE apunta a un archivo inexistente: ${f}`));
  console.error('    Arreglo: node scripts/qa/sw-precache.mjs --fix  (y sube VERSION en sw.js)');
  process.exit(1);
}
console.log(`  ✓ sw.js precarga los ${want.length} archivos de runtime`);
