// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Prueba de humo en navegador real (solo si hay Playwright y un Chromium).
// Carga cada pantalla a 360 px, hace una interacción básica y falla ante errores de consola o excepciones.
// Uso: node scripts/qa/browser-smoke.mjs http://127.0.0.1:8765/
// Variables opcionales: PLAYWRIGHT_DIR (carpeta con node_modules/playwright), CHROMIUM_PATH, SMOKE_SHOTS (carpeta para capturas).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:8000/';
const req = createRequire(process.env.PLAYWRIGHT_DIR ? path.join(process.env.PLAYWRIGHT_DIR, 'x.js') : import.meta.url);
const { chromium } = req('playwright');
const exe = process.env.CHROMIUM_PATH || ['/usr/bin/chromium-headless-shell', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const shots = process.env.SMOKE_SHOTS;
const errors = [];

async function session(reducedMotion) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  // Lo externo se bloquea: la prueba no depende de internet y solo cuenta errores del juego.
  await page.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  page.on('console', (m) => {
    const src = m.location()?.url || '';
    if (m.type() === 'error' && (src === '' || src.startsWith(base)) && !/net::ERR_FAILED/.test(m.text())) errors.push(`[${reducedMotion}] ${m.text()} ${src}`);
  });
  page.on('pageerror', (e) => errors.push(`[${reducedMotion}] ${e.message}`));
  const shot = async (name) => { if (shots) await page.screenshot({ path: path.join(shots, `${reducedMotion}-${name}.png`), fullPage: true }); };
  const visit = async (route, act) => {
    await page.goto(base + 'index.html#' + route, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    if (act) await act(page);
    await shot(route.replace('/', '-'));
  };
  const tapIf = async (sel, wait = 300) => { const el = page.locator(sel).first(); if (await el.count()) { await el.click(); await page.waitForTimeout(wait); return true; } return false; };

  await visit('menu');
  await visit('simulador', async () => { await tapIf('#drop', 2600); });
  await visit('codice', async () => { await tapIf('[data-next]'); await tapIf('[data-next]'); });
  await visit('examen', async () => { await tapIf('[data-start]'); await tapIf('.opt', 500); });
  await visit('historia', async () => { await tapIf('[data-skip]', 400); });
  await visit('simulador/m1', async () => { await tapIf('[data-skip]'); await tapIf('#drop', 2600); });
  await visit('aire'); await shot('aire-bloqueado'); // bloqueado sin progreso: muestra el aviso de GAL-1
  // Con el Acto 1 terminado (progreso inyectado en localStorage) se prueban las pantallas del Acto 2.
  await page.evaluate(() => localStorage.setItem('limiteg.v1', JSON.stringify({ seenIntro: true, rank: 'Piloto',
    missions: { m1: 3, m2: 3, m3: 3, m4: 3 }, exam: { best: 8, attempts: 1, passed: true } })));
  await page.reload({ waitUntil: 'load' }); // cambiar solo el hash no recarga: el estado en memoria pisaría el inyectado
  await visit('historia', async () => { await tapIf('[data-skip]', 400); });
  await visit('aire', async () => {
    await tapIf('#chutes .chip[data-id="grande"]');
    await tapIf('#drop', 600); await tapIf('#drop', 200); // soltar y abrir el paracaídas a mano
    await page.waitForTimeout(5000);
  });
  await visit('aire/m5', async () => { await tapIf('[data-skip]'); await tapIf('#chutes .chip[data-id="grande"]'); await tapIf('#drop', 5000); });
  await visit('aire/m8', async () => { await tapIf('[data-skip]'); });
  await visit('codice/2', async () => { await tapIf('[data-next]'); await tapIf('[data-next]'); });
  await visit('examen/2', async () => { await tapIf('[data-start]'); await tapIf('.opt', 500); });
  await visit('impacto'); await shot('impacto-bloqueado');
  // Con el Acto 2 terminado se prueban las pantallas del Acto 3.
  await page.evaluate(() => localStorage.setItem('limiteg.v1', JSON.stringify({ seenIntro: true, seenActs: [2], rank: 'Capitana',
    missions: { m1: 3, m2: 3, m3: 3, m4: 3, m5: 3, m6: 3, m7: 3, m8: 3 }, exam: { best: 8, attempts: 1, passed: true }, exam2: { best: 8, attempts: 1, passed: true } })));
  await page.reload({ waitUntil: 'load' });
  await visit('historia', async () => { await tapIf('[data-skip]', 400); });
  await visit('impacto', async () => { await tapIf('#fundas .chip[data-id="unicel"]'); await tapIf('#drop', 4500); });
  await visit('impacto/m11', async () => { await tapIf('[data-skip]'); await tapIf('#fundas .chip[data-id="hule"]'); await tapIf('#drop', 4000); });
  await visit('codice/3', async () => { await tapIf('[data-next]'); await tapIf('[data-next]'); });
  await visit('examen/3', async () => { await tapIf('[data-start]'); await tapIf('.opt', 500); });
  // Final y logros, con el Acto 3 terminado.
  await page.evaluate(() => localStorage.setItem('limiteg.v1', JSON.stringify({ seenIntro: true, seenActs: [2, 3], rank: 'Comandante', score: 120,
    missions: { m1: 3, m2: 3, m3: 3, m4: 3, m5: 3, m6: 3, m7: 3, m8: 3, m9: 3, m10: 3, m11: 3, m12: 3 },
    exam: { best: 8, attempts: 1, passed: true }, exam2: { best: 7, attempts: 1, passed: true }, exam3: { best: 6, attempts: 1, passed: true } })));
  await page.reload({ waitUntil: 'load' });
  await visit('historia', async () => { await tapIf('[data-skip]', 400); });
  await visit('simulador/f1', async () => { await tapIf('[data-skip]'); await page.fill('#hnum', '1'); await tapIf('#drop', 2600); });
  await visit('aire/f2', async () => { await tapIf('[data-skip]'); });
  await visit('impacto/f3', async () => { await tapIf('[data-skip]'); });
  await visit('logros', async () => {
    await page.fill('#alumno', 'Ana G.');
    await tapIf('[data-share]', 1500); // headless no comparte archivos: debe caer en descarga + enlace de WhatsApp
    const prev = await page.locator('.share-prev').getAttribute('src');
    if (!prev || !prev.startsWith('data:image/png')) errors.push(`[${reducedMotion}] #logros: no se generó la tarjeta PNG`);
    if (!(await page.locator('.share-msg a[href^="https://wa.me/?text="]').count())) errors.push(`[${reducedMotion}] #logros: falta el enlace de WhatsApp`);
    if (shots && prev) fs.writeFileSync(path.join(shots, `${reducedMotion}-tarjeta.png`), Buffer.from(prev.split(',')[1], 'base64'));
  });
  // Ninguna pantalla debe desbordar a lo ancho en 360 px.
  for (const r of ['menu', 'simulador', 'aire', 'impacto', 'codice/2', 'examen/2', 'codice/3', 'examen/3', 'codice', 'examen', 'historia', 'logros']) {
    await page.goto(base + 'index.html#' + r, { waitUntil: 'load' }); await page.waitForTimeout(250);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > 362) errors.push(`[${reducedMotion}] #${r} desborda: ${sw}px de ancho en 360px`);
  }
  await ctx.close();
}
// PWA: el service worker (rutas relativas) se instala, precarga todo y el juego abre sin red.
async function pwa() {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`[pwa] ${e.message}`));
  await page.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  await page.goto(base + 'index.html#menu', { waitUntil: 'load' });
  const n = await page.evaluate(async () => {
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error('el SW no se activó en 15 s')), 15000))]);
    const keys = await caches.keys(); const k = keys.find((x) => x.startsWith('limiteg-'));
    return { scope: reg.scope, n: k ? (await (await caches.open(k)).keys()).length : 0 };
  }).catch((e) => { errors.push(`[pwa] ${e.message}`); return null; });
  if (n && n.n < 40) errors.push(`[pwa] la caché solo tiene ${n.n} archivos`);
  if (n) {
    await page.reload({ waitUntil: 'load' }); // ahora la página la controla el SW
    await ctx.setOffline(true);
    await page.goto(base + 'index.html#logros', { waitUntil: 'load' }).catch((e) => errors.push(`[pwa] sin red: ${e.message}`));
    await page.waitForTimeout(500);
    const ok = await page.locator('.logros').count().catch(() => 0);
    if (!ok) errors.push('[pwa] sin red, #logros no se dibujó');
  }
  await ctx.close();
}
await pwa();
await session('no-preference');
await session('reduce');
await browser.close();
if (errors.length) { console.error(errors.map((e) => '  ✗ ' + e).join('\n')); process.exit(1); }
console.log('  ✓ navegador (360 px, con y sin movimiento reducido): pantallas e interacciones sin errores de consola');
