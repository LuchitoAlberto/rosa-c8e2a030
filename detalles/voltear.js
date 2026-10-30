// Un toque en una foto la voltea: crece al centro de la pantalla y muestra su mensajito de atrás.
// Otro toque (o tocar fuera) la devuelve a su lugar. Un doble toque es el "mua" (detalle besito) y no cambia nada.
window.Detalles = window.Detalles || {};
window.Detalles.voltear = {
  activar(ctx) {
    const L = window.Logica;
    let z = 1000, actual = null;

    const cfg = ctx.contenido.voltear || {};
    let aviso = null;
    if (cfg.pista) {
      aviso = Object.assign(document.createElement('p'), { className: 'pista pista-fotos', textContent: cfg.pista });
      ctx.mesa.append(aviso);
    }
    const quitarAviso = () => { // se desvanece y recién después se quita
      if (!aviso) return;
      const viejo = aviso; aviso = null;
      viejo.classList.add('oculta');
      setTimeout(() => viejo.remove(), 600);
    };

    function cerrar(el) {
      el.classList.remove('volteada');
      el.style.setProperty('--x', el.dataset.x); el.style.setProperty('--y', el.dataset.y);
      el.style.setProperty('--rot', el.dataset.rot); el.style.setProperty('--s', 1);
      el.style.zIndex = ++z; // vuelve a su sitio por encima de las demás; así no se "mete detrás" a mitad de la animación
      if (actual === el) actual = null;
    }

    function abrir(el) {
      if (actual && actual !== el) cerrar(actual);
      const ps = el.style;
      Object.assign(el.dataset, { x: ps.getPropertyValue('--x'), y: ps.getPropertyValue('--y'), rot: ps.getPropertyValue('--rot'), z: ps.zIndex });
      const w = el.offsetWidth, h = el.offsetHeight;
      const escala = Math.min((ctx.mesa.clientWidth * 0.72) / w, 3.2);
      // Centro de lo que ella está viendo ahora, dentro de la mesa.
      const r = ctx.mesa.getBoundingClientRect();
      const cx = ctx.mesa.clientWidth / 2;
      const cy = Math.min(Math.max(innerHeight / 2 - r.top, (h * escala) / 2), ctx.mesa.clientHeight - (h * escala) / 2);
      ps.setProperty('--x', cx - w / 2 + 'px'); ps.setProperty('--y', cy - h / 2 + 'px');
      ps.setProperty('--rot', '-2deg'); ps.setProperty('--s', escala);
      ps.zIndex = ++z;
      el.classList.add('volteada');
      actual = el;
      quitarAviso();
      ctx.escena.dispatchEvent(new CustomEvent('foto-volteada', { detail: { el } })); // lo escucha el detalle "logro"
    }

    const alternar = (el) => (el.classList.contains('volteada') ? cerrar(el) : abrir(el));

    ctx.polaroids().forEach((el) => {
      let abajo = null, previo = null;
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alternar(el); } });
      el.addEventListener('pointerdown', (e) => { abajo = { x: e.clientX, y: e.clientY, t: Date.now() }; });
      el.addEventListener('pointerup', (e) => {
        if (!abajo) return;
        const arriba = { x: e.clientX, y: e.clientY, t: Date.now() };
        const fueToque = L.esToque(abajo, arriba); // un arrastre no voltea
        abajo = null;
        if (!fueToque) { previo = null; return; }
        // Responde al instante (sin esperar a ver si viene un segundo toque). Si resulta ser un doble toque
        // ("mua"), el segundo toque deshace el primero y la foto queda como estaba.
        alternar(el);
        previo = L.esDobleToque(previo, arriba) ? null : arriba;
      });
    });

    // Tocar fuera de la foto grande la devuelve a su lugar.
    ctx.escena.addEventListener('pointerdown', (e) => { if (actual && !e.target.closest('.polaroid.volteada')) cerrar(actual); });
  },
};
