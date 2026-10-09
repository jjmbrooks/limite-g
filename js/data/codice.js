// Límite G — escrito por Hark para Jhonatan J. Martínez Brooks (MIT)
// Códice Gravitacional, Acto 1 (sin aire). Textos bajo CC BY 4.0.
// speaker: gal | nova | caos · anim: nombre de la mini-animación en js/ui/anims.js
export const CODICE_ACT1 = [
  {
    id: 'ep', title: 'Energía potencial', speaker: 'gal', anim: 'ep',
    quote: 'Fragmento 1 recuperado. Todo lo que está alto guarda energía… y la suelta al caer.',
    formula: 'Ep = m · g · h',
    text: 'Es la energía que un objeto tiene por su <b>altura</b>. Depende de la masa <b>m</b> (kg), de la gravedad <b>g</b> (m/s²) y de la altura <b>h</b> (m). Se mide en joules: 1 J = 1 kg·m²/s².',
    example: { q: 'Un celular de 0.2 kg está a 5 m de altura en la Tierra (g = 9.81 m/s²). ¿Cuánta Ep tiene?',
      steps: ['Ep = m · g · h', 'Ep = 0.2 kg × 9.81 m/s² × 5 m', 'Ep = 9.81 J'] },
  },
  {
    id: 'ec', title: 'Energía cinética', speaker: 'nova', anim: 'ec',
    quote: 'Lo que rompe un paquete no es la altura: es la rapidez con la que llega.',
    formula: 'Ec = ½ · m · v²',
    text: 'Es la energía del <b>movimiento</b>. Depende de la masa y del <b>cuadrado</b> de la rapidez: si la velocidad se duplica, la Ec se multiplica por 4.',
    example: { q: 'Un huevo de criadero (0.06 kg) llega al suelo a 4 m/s. Aguanta 0.3 J. ¿Sobrevive?',
      steps: ['Ec = ½ · m · v²', 'Ec = 0.5 × 0.06 kg × (4 m/s)² = 0.5 × 0.06 × 16', 'Ec = 0.48 J > 0.3 J → ¡se rompe!'] },
  },
  {
    id: 'cons', title: 'Conservación de la energía', speaker: 'gal', anim: 'cons',
    quote: 'Sin aire no se pierde nada: la Ep se transforma, joule por joule, en Ec.',
    formula: 'Ep + Ec = constante',
    text: 'Sin resistencia del aire, la <b>energía mecánica</b> (Ep + Ec) no cambia durante la caída. Arriba todo es Ep; a media altura, mitad y mitad; al tocar el suelo, todo es Ec. Por eso la energía del impacto es igual a la <b>Ep inicial</b>.',
    example: { q: 'Un frasco de vacuna (0.1 kg) cae desde 3 m en Marte (g = 3.71 m/s²). Aguanta 1 J. ¿Con cuánta energía llega?',
      steps: ['Ep inicial = 0.1 × 3.71 × 3 = 1.113 J', 'A 1.5 m: Ep = 0.557 J y Ec = 0.557 J (suman lo mismo)', 'Al suelo: Ec = 1.113 J > 1 J → se rompe. Hay que bajar la altura.'] },
  },
  {
    id: 'caida', title: 'Caída libre', speaker: 'gal', anim: 'caida',
    quote: 'Mi nombre viene de Galileo: todos los cuerpos caen igual si no hay aire.',
    formula: 'v = √(2·g·h)   ·   t = √(2h / g)',
    text: 'Desde el reposo, la velocidad aumenta <b>g</b> m/s cada segundo (v = g·t) y la distancia recorrida es h = ½·g·t². La <b>masa no importa</b>: un robot y un huevo llegan al mismo tiempo. Mira cómo la separación entre posiciones crece en cada intervalo.',
    example: { q: 'En la Luna (g = 1.62 m/s²) sueltas un paquete desde 10 m. ¿Cuánto tarda y a qué velocidad llega?',
      steps: ['t = √(2h / g) = √(2 × 10 / 1.62) = √12.35', 't ≈ 3.51 s', 'v = √(2 × 1.62 × 10) = √32.4 ≈ 5.69 m/s'] },
  },
  {
    id: 'g', title: 'g en cada planeta', speaker: 'nova', anim: 'g',
    quote: 'Misma altura, distinto planeta… distinto golpe. Caos lo sabe y borra estos datos.',
    formula: 'Luna 1.62 · Marte 3.71 · Tierra 9.81 · Júpiter 24.79 m/s²',
    text: 'La gravedad <b>g</b> depende del planeta. Como Ep = m·g·h, a igual altura la energía del impacto es <b>proporcional a g</b>: en Júpiter un golpe es unas 15 veces más fuerte que en la Luna.',
    example: { q: 'Un celular (0.2 kg) cae desde 2 m. Compara la energía del impacto en la Luna, la Tierra y Júpiter.',
      steps: ['Luna: 0.2 × 1.62 × 2 = 0.648 J', 'Tierra: 0.2 × 9.81 × 2 = 3.924 J', 'Júpiter: 0.2 × 24.79 × 2 = 9.916 J'] },
  },
  {
    id: 'limite', title: 'Altura segura', speaker: 'caos', anim: 'limite',
    quote: 'Ja. Calcula mal un decimal y tu paquete será confeti. La entropía siempre gana.',
    formula: 'h segura = resistencia / (m · g)',
    text: 'La <b>resistencia</b> es la energía máxima que aguanta un paquete. Si igualas Ep = resistencia y despejas h, obtienes la altura máxima de entrega. La entrega perfecta usa entre el 80 % y el 100 % del límite: rápida, pero sin romper nada.',
    example: { q: 'Un celular (0.2 kg, resistencia = 3 J) se entrega en Marte (g = 3.71 m/s²). ¿Desde qué altura máxima?',
      steps: ['h = resistencia / (m · g)', 'h = 3 J / (0.2 kg × 3.71 m/s²) = 3 / 0.742', 'h ≈ 4.04 m (más alto, se rompe)'] },
  },
];

// Códice Gravitacional, Acto 2 (con aire).
export const CODICE_ACT2 = [
  {
    id: 'arrastre', title: 'Fuerza de arrastre', speaker: 'gal', anim: 'arrastre',
    quote: 'Fragmento 7: el aire empuja contra todo lo que lo atraviesa. Y empuja más fuerte cuanto más rápido vas.',
    formula: 'F = ½ · ρ · Cd · A · v²',
    text: 'Al caer, el paquete choca con moléculas de aire que lo frenan. Esa fuerza depende de la <b>densidad del aire ρ</b> (kg/m³), de la <b>forma</b> (coeficiente Cd, sin unidades), del <b>área frontal A</b> (m²) y del <b>cuadrado de la velocidad</b>. Apunta hacia arriba, contra el movimiento.',
    example: { q: 'Un celular (Cd = 1, A = 0.01 m²) cae a 10 m/s en la Tierra (ρ = 1.225 kg/m³). ¿Cuánto arrastre siente?',
      steps: ['F = ½ · ρ · Cd · A · v²', 'F = 0.5 × 1.225 × 1 × 0.01 × 10²', 'F ≈ 0.61 N (su peso es 0.2 × 9.81 = 1.96 N: todavía acelera)'] },
  },
  {
    id: 'terminal', title: 'Velocidad terminal', speaker: 'nova', anim: 'terminal',
    quote: 'Llega un momento en que el aire empuja tanto como la gravedad. Desde ahí, ya no acelero.',
    formula: 'vt = √( 2·m·g / (ρ·Cd·A) )',
    text: 'Cuando el arrastre <b>iguala al peso</b> (½·ρ·Cd·A·v² = m·g), la fuerza neta es cero y la aceleración también: el paquete sigue cayendo, pero a <b>velocidad constante</b>. En la gráfica v(t) la curva se aplana. Con aire, la masa sí importa: más masa con la misma forma → vt mayor.',
    example: { q: 'Velocidad terminal del celular (m = 0.2 kg, Cd·A = 0.01 m²) en la Tierra.',
      steps: ['vt = √(2 · 0.2 · 9.81 / (1.225 · 0.01))', 'vt = √(3.924 / 0.01225) = √320.3', 'vt ≈ 17.9 m/s (sin aire, desde 100 m llegaría a 44.3 m/s)'] },
  },
  {
    id: 'paracaidas', title: 'Paracaídas', speaker: 'gal', anim: 'paracaidas',
    quote: 'Un paracaídas no "detiene" nada: multiplica el área para que la velocidad terminal sea pequeña.',
    formula: 'A ↑  →  vt ↓   ·   A = 2·m·g / (ρ·Cd·v²)',
    text: 'Abrir el paracaídas aumenta muchísimo <b>Cd·A</b>, así que la velocidad terminal baja y con ella la <b>Ec del impacto</b>. Pero tarda en bajar: si lo abres <b>muy alto</b>, la entrega dura minutos; si lo abres <b>muy bajo</b>, no alcanza a frenar. La entrega perfecta lo abre lo más tarde posible… sin pasarse.',
    example: { q: '¿Qué área de paracaídas (Cd = 1.4) necesita el robot (5 kg) para tocar el suelo de la Tierra a 6 m/s?',
      steps: ['A = 2·m·g / (ρ·Cd·v²)', 'A = 2 × 5 × 9.81 / (1.225 × 1.4 × 6²) = 98.1 / 61.74', 'A ≈ 1.6 m² (Ec = ½ · 5 · 6² = 90 J < 200 J)'] },
  },
  {
    id: 'perdida', title: '¿Y la energía?', speaker: 'caos', anim: 'perdida',
    quote: '¿Lo ves? El aire se come tu preciosa energía. La entropía siempre gana… ¿o no?',
    formula: 'Ep inicial = Ec final + E aire',
    text: 'Con aire, Ep + Ec <b>ya no se conserva</b>: el arrastre hace trabajo y transforma parte de la energía en <b>calor</b> y movimiento del aire. La energía total del universo sí se conserva (Nova tiene razón); solo que una parte ya no está en el paquete. Por eso un paquete con aire llega con <b>menos Ec</b> que sin aire.',
    example: { q: 'El celular (0.2 kg) cae 100 m en la Tierra y llega a 17.9 m/s. ¿Cuánta energía se llevó el aire?',
      steps: ['Ep inicial = 0.2 × 9.81 × 100 = 196.2 J', 'Ec final = ½ × 0.2 × 17.9² ≈ 32.0 J', 'E aire = 196.2 − 32.0 ≈ 164.2 J (¡84 %!)'] },
  },
  {
    id: 'densidad', title: 'Aire de cada mundo', speaker: 'nova', anim: 'densidad',
    quote: 'Venus, Titán, la Tierra… mismo paquete, aire distinto. Caos borra estos datos porque sabe que valen oro.',
    formula: 'ρ: Tierra 1.2 · Titán 5.3 · Venus 65 kg/m³',
    text: 'La densidad del aire cambia muchísimo: en <b>Venus</b> es unas 50 veces la de la Tierra (casi como caer en agua muy ligera) y en <b>Titán</b> unas 4 veces, con una gravedad pequeñita. La Luna y Marte casi no tienen aire: ahí un paracaídas no sirve. Como vt ∝ 1/√ρ, más densidad → caída más lenta.',
    example: { q: 'Compara la velocidad terminal del frasco de vacuna (0.1 kg, Cd·A = 0.0016 m²) en la Tierra y en Venus.',
      steps: ['Tierra: vt = √(2 · 0.1 · 9.81 / (1.225 · 0.0016)) ≈ 31.6 m/s', 'Venus: vt = √(2 · 0.1 · 8.87 / (65 · 0.0016)) ≈ 4.1 m/s', 'En Venus llega con ½ · 0.1 · 4.1² ≈ 0.85 J: ¡sobrevive sin paracaídas!'] },
  },
  {
    id: 'compara', title: 'Sin aire vs con aire', speaker: 'gal', anim: 'compara',
    quote: 'Pon las dos gráficas juntas y verás todo el Acto 2 en un dibujo.',
    formula: 'sin aire: v = g·t  ·  con aire: v → vt',
    text: 'Sin aire, la velocidad crece en <b>línea recta</b> (v = g·t) hasta el suelo. Con aire, al principio la curva sigue esa recta (a poca velocidad casi no hay arrastre), luego se dobla y se <b>aplana en vt</b>. Al abrir un paracaídas la curva cae en picada hasta la nueva vt, mucho más baja.',
    example: { q: 'El robot (5 kg, Cd·A = 0.06 m²) cae desde 300 m en la Tierra. ¿Con qué velocidad llega con y sin aire?',
      steps: ['Sin aire: v = √(2 · 9.81 · 300) ≈ 76.7 m/s', 'Con aire: vt = √(2 · 5 · 9.81 / (1.225 · 0.06)) ≈ 36.5 m/s… y desde 300 m ya está muy cerca de vt', 'Ec: 14 715 J sin aire contra unos 3 300 J con aire. Ambos rompen el robot: hace falta paracaídas'] },
  },
];

// Códice Gravitacional, Acto 3 (impacto).
export const CODICE_ACT3 = [
  {
    id: 'impacto', title: 'Fuerza de impacto', speaker: 'gal', anim: 'impacto',
    quote: 'Fragmento 13: el suelo no "absorbe" el golpe por magia. Hace trabajo para frenar al paquete.',
    formula: 'F media · d = Ec',
    text: 'Al chocar, el suelo empuja al paquete hacia arriba con una fuerza que lo frena en una <b>distancia de frenado d</b>. El trabajo de esa fuerza (F·d) es igual a la <b>energía cinética</b> que hay que quitarle. Despejando: <b>F = Ec / d</b>. La fuerza se mide en newtons: 1 N = 1 J / 1 m.',
    example: { q: 'Un frasco de vacuna llega con 5.24 J y se frena en 2 mm (0.002 m). ¿Qué fuerza media recibe?',
      steps: ['F = Ec / d', 'F = 5.24 J / 0.002 m', 'F = 2 620 N (aguanta 500 N → ¡se rompe!)'] },
  },
  {
    id: 'frenado', title: 'Distancia de frenado', speaker: 'nova', anim: 'frenado',
    quote: 'Misma energía, más centímetros para frenar… menos fuerza. Ese es todo el secreto.',
    formula: 'd ×2  →  F ÷2',
    text: 'Para la misma Ec, la fuerza es <b>inversamente proporcional</b> a la distancia de frenado. Si duplicas d, la fuerza se reduce a la mitad. Por eso existen las bolsas de aire, los cascos con espuma, las colchonetas y por eso doblas las rodillas al saltar.',
    example: { q: 'Un celular llega con 6 J. Compara la fuerza si se frena en 0.2 cm, en 1 cm y en 3 cm.',
      steps: ['0.2 cm: F = 6 / 0.002 = 3 000 N', '1 cm: F = 6 / 0.01 = 600 N', '3 cm: F = 6 / 0.03 = 200 N'] },
  },
  {
    id: 'suelos', title: 'Suelos', speaker: 'gal', anim: 'suelos',
    quote: 'Cada suelo se hunde distinto. Ese hundimiento se suma a la distancia de frenado.',
    formula: 'concreto 0 · pasto 1 · arena 3 · espuma 8 cm',
    text: 'Todo paquete se deforma un poquito (unos <b>2 mm</b>): por eso su resistencia del Acto 1 equivale a una <b>fuerza máxima F máx = resistencia / 0.002 m</b>. Un suelo blando añade su hundimiento: d = 0.2 cm + suelo + funda. El concreto no se hunde nada; un colchón de espuma, varios centímetros.',
    example: { q: 'Un huevo (F máx = 0.3 J / 0.002 m = 150 N) llega con 1.5 J. ¿Sobrevive en pasto?',
      steps: ['d = 0.002 + 0.01 = 0.012 m', 'F = 1.5 J / 0.012 m = 125 N', '125 N < 150 N → sobrevive (en concreto: 750 N, se rompe)'] },
  },
  {
    id: 'fundas', title: 'Fundas', speaker: 'nova', anim: 'fundas',
    quote: 'Una funda es distancia de frenado que el paquete lleva puesta.',
    formula: 'd funda = k · grosor',
    text: 'Una funda se aplasta al chocar. Solo una parte de su grosor se comprime: la fracción <b>k</b> del material (cartón 0.5, unicel 0.6, hule espuma 0.8, gel 0.9). Así, 2 cm de hule espuma dan 0.8 × 2 = 1.6 cm extra de frenado. Para diseñar: <b>grosor = (d necesaria − d sin funda) / k</b>.',
    example: { q: 'Un frasco necesita d = 1.05 cm sobre concreto. ¿Qué grosor de unicel (k = 0.6) necesita?',
      steps: ['d sin funda = 0.2 cm', 'grosor = (1.05 − 0.2) / 0.6', 'grosor ≈ 1.4 cm (un poco más por la masa de la funda)'] },
  },
  {
    id: 'masafunda', title: 'La funda también cae', speaker: 'caos', anim: 'masafunda',
    quote: 'Más funda, más seguro, ¿no? Envuélvelo en gel. En mucho gel. Je, je.',
    formula: 'Ec = (m + m funda) · g · h',
    text: 'La funda tiene masa, y esa masa también cae: aumenta la <b>Ec</b> que hay que frenar y gasta combustible. Un material denso como el gel (1 000 kg/m³) puede pesar más que el paquete. Uno ligero como el unicel (20 kg/m³) casi no suma. La mejor funda es la <b>más ligera que aguanta</b>.',
    example: { q: 'Un frasco de 0.1 kg cae 40 m en Europa (g = 1.31). ¿Cuánta Ec lleva sin funda y con 0.26 kg de gel?',
      steps: ['Sin funda: 0.1 × 1.31 × 40 = 5.24 J', 'Con gel: (0.1 + 0.26) × 1.31 × 40 = 18.9 J', '¡Más del triple de energía que frenar!'] },
  },
  {
    id: 'peorcaso', title: 'Diseña para el peor caso', speaker: 'gal', anim: 'peorcaso',
    quote: 'Caos cambia los suelos. Nosotras no adivinamos: calculamos con el más duro.',
    formula: 'Europa g = 1.31 · Ío g = 1.80 m/s²',
    text: 'Si no sabes dónde caerá el paquete, diseña la funda para el <b>suelo más duro</b> (concreto). Si aguanta ahí, aguanta en cualquier otro: un suelo blando solo aumenta d y baja la fuerza. Así trabajan los ingenieros: con <b>margen de seguridad</b>. En Europa (hielo) e Ío (azufre) casi no hay aire: toda la Ep llega como Ec.',
    example: { q: 'Un cristal (F máx = 10 J / 0.002 m = 5 000 N) cae 60 m en Ío. ¿Qué d necesita en el peor caso?',
      steps: ['Ec = 0.5 × 1.80 × 60 = 54 J', 'd = Ec / F máx = 54 / 5 000 = 0.0108 m', 'd ≈ 1.1 cm: funda de unos 1.6 cm de unicel'] },
  },
];

// Códice por acto (la pantalla abre #codice, #codice/2 o #codice/3).
export const CODICE = { 1: CODICE_ACT1, 2: CODICE_ACT2, 3: CODICE_ACT3 };
