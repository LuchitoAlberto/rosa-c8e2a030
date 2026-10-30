// Logro: cuando ella ha leído el mensajito de atrás de TODAS las fotos, sale un trofeo con un ticket.
// No se guarda nada: si recarga la página, empieza de cero.
window.Detalles = window.Detalles || {};
window.Detalles.logro = {
  activar(ctx) {
    const cfg = ctx.contenido.logro || {};
    if (!cfg.texto && !cfg.titulo) return;
    const LECTURA_MS = 700; // la foto tiene que quedar volteada este tiempo para contar como leída
    const total = ctx.polaroids().length;
    const leidas = new Set();
    let entregado = false;
    if (!total) return;

    ctx.escena.addEventListener('foto-volteada', (e) => {
      const el = e.detail.el;
      setTimeout(() => {
        if (entregado || !el.classList.contains('volteada')) return; // la cerró enseguida: no la leyó
        leidas.add(el);
        if (leidas.size < total) return;
        entregado = true;
        // Pequeña pausa para que la última foto termine de cerrarse y luego aparece el premio.
        setTimeout(() => {
          ctx.tarjeta({ icono: cfg.icono || '🏆', titulo: cfg.titulo, texto: cfg.texto, detalle: cfg.detalle, clase: 'ticket', etiqueta: 'Logro desbloqueado' });
          ctx.confeti(160);
        }, ctx.reducido ? 0 : 900);
      }, LECTURA_MS);
    });
  },
};
