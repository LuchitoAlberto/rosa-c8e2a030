// Doble toque en una foto: sale un "mua" flotando desde ahí.
window.Detalles = window.Detalles || {};
window.Detalles.besito = {
  activar(ctx) {
    const L = window.Logica;
    ctx.polaroids().forEach((el) => {
      let abajo = null, previo = null;
      el.addEventListener('pointerdown', (e) => { abajo = { x: e.clientX, y: e.clientY, t: Date.now() }; });
      el.addEventListener('pointerup', (e) => {
        if (!abajo) return;
        const arriba = { x: e.clientX, y: e.clientY, t: Date.now() };
        const fueToque = L.esToque(abajo, arriba); // un arrastre no cuenta
        abajo = null;
        if (!fueToque) { previo = null; return; }
        if (L.esDobleToque(previo, arriba)) {
          const p = ctx.punto(e);
          ctx.flotar(L.elegirAlAzar(ctx.contenido.besito), p.x, p.y, { clase: 'besito' });
          previo = null;
        } else previo = arriba;
      });
    });
  },
};
