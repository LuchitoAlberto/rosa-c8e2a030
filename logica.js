// Funciones puras (sin DOM) para poder probarlas con `node --test`.
const Logica = {
  fotosAMostrar(fotos, max = 14) {
    return (fotos || []).filter((f) => f && typeof f.src === 'string' && f.src).slice(0, max);
  },

  // Cuadrícula de `columnas` por fila (5 por defecto); si la última fila queda incompleta, se centra.
  // Las polaroids se solapan un poco, como un collage.
  colocarPolaroids(n, ancho, alto, azar = Math.random, columnas = 5) {
    if (n <= 0) return [];
    const cols = Math.min(n, Math.max(1, Math.floor(columnas)));
    const filas = Math.ceil(n / cols);
    const celdaW = ancho / cols, celdaH = alto / filas;
    const w = Math.min(celdaW * 1.1, (celdaH / 1.25) * 1.6, 240);
    const h = w * 1.25;
    const dentro = (v, max, min = 0) => Math.min(Math.max(v, min), max);
    const margenArriba = Math.min(12, Math.max(alto - h, 0)); // deja ver la cinta de la fila de arriba
    return Array.from({ length: n }, (_, i) => {
      const c = i % cols, f = Math.floor(i / cols);
      const enFila = Math.min(cols, n - f * cols);
      const x = c * celdaW + ((cols - enFila) * celdaW) / 2 + (celdaW - w) / 2 + (azar() - 0.5) * celdaW * 0.3;
      const y = f * celdaH + (celdaH - h) / 2 + (azar() - 0.5) * celdaH * 0.3;
      return { x: dentro(x, ancho - w), y: dentro(y, alto - h, margenArriba), rot: (azar() * 2 - 1) * 8, w, h };
    });
  },

  elegirAlAzar(opciones, azar = Math.random) {
    if (typeof opciones === 'string') return opciones;
    if (!opciones || !opciones.length) return '';
    return opciones[Math.floor(azar() * opciones.length)];
  },

  tiempoRestante(ahoraMs, desbloqueoIso) {
    const falta = new Date(desbloqueoIso).getTime() - ahoraMs;
    if (!(falta > 0)) return { bloqueada: false, d: 0, h: 0, m: 0, s: 0 };
    const s = Math.floor(falta / 1000);
    return { bloqueada: true, d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  },

  esToque(abajo, arriba) {
    return Math.hypot(arriba.x - abajo.x, arriba.y - abajo.y) <= 10 && arriba.t - abajo.t <= 400;
  },

  esDobleToque(previo, toque) {
    return !!previo && toque.t - previo.t <= 350 && Math.hypot(toque.x - previo.x, toque.y - previo.y) <= 30;
  },

  // Tolera ediciones torpes de content.js: lo que falte o venga con el tipo equivocado toma un valor seguro.
  normalizarContenido(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const lista = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    const max = Number(raw.maxEnPantalla);
    return {
      ...raw,
      titulo: String(raw.titulo || ''),
      subtitulo: String(raw.subtitulo || ''),
      boton: String(raw.boton || 'Abrir'),
      firma: String(raw.firma || ''),
      mensaje: lista(raw.mensaje),
      fotos: Array.isArray(raw.fotos) ? raw.fotos : [],
      maxEnPantalla: max >= 1 ? Math.floor(max) : 14,
      detalles: lista(raw.detalles),
      cargando: String(raw.cargando || 'Cargando fotos…'),
      pista: String(raw.pista ?? 'Desliza hacia abajo'),
      columnas: Number(raw.columnas) >= 1 ? Math.floor(Number(raw.columnas)) : 5,
      dorsoGeneral: String(raw.dorsoGeneral ?? '💕'),
      tituloPagina: String(raw.tituloPagina || ''),
      tituloFotos: String(raw.tituloFotos ?? ''),
      contrasena: { clave: '', titulo: '', pista: '', boton: 'Entrar', error: 'Esa no es. Intenta otra vez.', ...raw.contrasena },
      textoBloqueo: { titulo: '', detalle: '', ...raw.textoBloqueo },
    };
  },

  // Sin mayúsculas, espacios ni tildes: "  Amoshíto " vale como "amoshito".
  normalizarClave(texto) {
    return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
  },

  // shortcut: la clave vive en content.js y se compara en el navegador; es un candado de cortesía, no seguridad real.
  claveCorrecta(intento, clave) {
    const esperada = Logica.normalizarClave(clave);
    return !esperada || Logica.normalizarClave(intento) === esperada;
  },

  progresoLlenado(msPresionado, msTotal = 2000) {
    return Math.min(Math.max(msPresionado / msTotal, 0), 1);
  },

  progresoTrasSoltar(progreso, msDesdeSoltar, msVaciado = 800) {
    return Math.max(progreso - msDesdeSoltar / msVaciado, 0);
  },
};

if (typeof module !== 'undefined') module.exports = Logica;
else window.Logica = Logica;
