// Corazoncitos donde ella toca el fondo (no sobre fotos, botones ni durante un arrastre).
window.Detalles = window.Detalles || {};
window.Detalles.corazones = {
  activar(ctx) {
    const L = window.Logica;
    let abajo = null;
    const ignorado = (t) => t.closest('.polaroid, .llenar, #musica, .secreto-overlay');
    ctx.escena.addEventListener('pointerdown', (e) => {
      abajo = ignorado(e.target) ? null : { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    ctx.escena.addEventListener('pointerup', (e) => {
      if (!abajo) return;
      const arriba = { x: e.clientX, y: e.clientY, t: Date.now() };
      if (L.esToque(abajo, arriba)) {
        const p = ctx.punto(e);
        for (let i = 0; i < 3; i++) {
          ctx.flotar(L.elegirAlAzar(ctx.contenido.corazones), p.x + (Math.random() - 0.5) * 60, p.y + (Math.random() - 0.5) * 30);
        }
      }
      abajo = null;
    });
  },
};
