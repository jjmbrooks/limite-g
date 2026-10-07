// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Aviso breve en la parte baja de la pantalla (logros). Se anuncia a lectores de pantalla (aria-live).
let box = null;
export function toast(html, ms = 3200) {
  if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html;
  box.appendChild(t);
  setTimeout(() => t.remove(), ms);
}
