// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Fondo estrellado pixel art con paralaje (3 capas). Respeta prefers-reduced-motion y se pausa en segundo plano.
const SCALE = 3; // 1 pixel lógico = 3 px de pantalla
const LAYERS = [
  { n: 70, speed: 3, size: 1, colors: ['#3a4580', '#55609a'] },
  { n: 35, speed: 8, size: 1, colors: ['#9cc9ff', '#ffffff', '#ffc078'] },
  { n: 12, speed: 16, size: 2, colors: ['#ffffff', '#2de2c8', '#ff8a1f'] },
];

export function mountStarfield(host) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const cv = document.createElement('canvas'), g = cv.getContext('2d');
  cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);
  let w = 0, h = 0, stars = [], raf = 0, last = 0, t = 0;

  function resize() {
    w = Math.ceil(innerWidth / SCALE); h = Math.ceil(innerHeight / SCALE);
    cv.width = w; cv.height = h;
    stars = LAYERS.flatMap((L, li) => Array.from({ length: Math.round((L.n * w * h) / 15000) + 4 }, () => ({
      x: Math.random() * w, y: Math.random() * h, li, c: L.colors[(Math.random() * L.colors.length) | 0], tw: Math.random() * 6.28,
    })));
    paint();
  }
  function paint() {
    g.clearRect(0, 0, w, h);
    const scroll = reduce.matches ? 0 : scrollY / SCALE;
    for (const s of stars) {
      const L = LAYERS[s.li];
      const y = (((s.y + t * L.speed - scroll * (s.li + 1) * 0.15) % h) + h) % h;
      const on = reduce.matches || s.li === 0 || Math.sin(t * 2 + s.tw) > -0.7;
      if (!on) continue;
      g.fillStyle = s.c;
      g.fillRect(Math.round(s.x), Math.round(y), L.size, L.size);
      if (L.size === 2 && Math.sin(t * 3 + s.tw) > 0.6) { g.fillRect(Math.round(s.x) - 1, Math.round(y), 4, 1); g.fillRect(Math.round(s.x), Math.round(y) - 1, 1, 4); }
    }
  }
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps bastan para un fondo
    t += Math.min(now - last, 100) / 1000; last = now;
    paint();
  }
  function start() { cancelAnimationFrame(raf); if (!reduce.matches && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(loop); } else paint(); }
  addEventListener('resize', resize);
  addEventListener('scroll', () => { if (reduce.matches) return; if (!raf) paint(); }, { passive: true });
  document.addEventListener('visibilitychange', start);
  reduce.addEventListener?.('change', start);
  resize(); start();
}
