// Pantallas provisionales: se construyen en M4 (Códice) y M5 (Examen).
const soon = (title, text) => (el) => {
  el.innerHTML = `<h1 style="font-size:16px">${title}</h1><div class="panel"><p>${text}</p></div>
  <button class="btn" onclick="location.hash='simulador'">▶ Ir al Simulador</button>`;
};
export const codice = soon('CÓDICE', 'GAL-1: "Dr. Caos borró mis datos. Estoy recuperando los fragmentos..." (Próximamente)');
export const examen = soon('EXAMEN', 'GAL-1: "El examen de licencia se abre cuando recuperemos el Códice." (Próximamente)');
