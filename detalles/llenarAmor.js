// Corazón que se llena mientras ella mantiene presionado; al completarse, el secreto aparece
// al centro de la pantalla. Después puede volver a verlo tocando el corazón.
window.Detalles = window.Detalles || {};
window.Detalles.llenarAmor = {
  activar(ctx) {
    const L = window.Logica;
    const cfg = ctx.contenido.llenarAmor || {};
    const { instruccion, secreto } = cfg;
    if (!instruccion && !secreto) return;
    const MS_TOTAL = 2000;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'llenar';
    btn.innerHTML = '<span class="corazon" aria-hidden="true"><span>🤍</span><span class="lleno">❤️</span></span>';
    const etiqueta = document.createTextNode(instruccion || '');
    btn.append(etiqueta);
    ctx.nota.append(btn);

    let id = null, p = 0, t0 = 0, pSoltar = 0, tSoltar = 0, raf = 0, completo = false, esperaSoltar = false;

    function paso() {
      const ahora = performance.now();
      p = id !== null ? L.progresoLlenado(ahora - t0, MS_TOTAL) : L.progresoTrasSoltar(pSoltar, ahora - tSoltar);
      btn.style.setProperty('--lleno', p);
      if (p >= 1) return terminar();
      if (id !== null || p > 0) raf = requestAnimationFrame(paso);
    }

    btn.addEventListener('pointerdown', (e) => {
      if (completo || id !== null) return; // un segundo dedo se ignora
      id = e.pointerId;
      try { btn.setPointerCapture(id); } catch (err) { /* puntero ya liberado */ }
      t0 = performance.now() - p * MS_TOTAL; // retoma desde donde quedó
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paso);
    });
    const soltar = (e) => {
      if (e.pointerId !== id) return;
      id = null; pSoltar = p; tSoltar = performance.now();
    };
    btn.addEventListener('pointerup', soltar);
    btn.addEventListener('pointercancel', soltar);
    btn.addEventListener('click', () => {
      if (!completo) return;
      if (esperaSoltar) { esperaSoltar = false; return; } // el click de soltar tras completar no reabre
      mostrar(false);
    });

    function terminar() {
      completo = true; esperaSoltar = id !== null; id = null;
      etiqueta.textContent = cfg.otraVez || 'Ver el secreto otra vez';
      mostrar(true);
    }

    function mostrar(conFiesta) {
      ctx.tarjeta({ icono: '💖', texto: secreto, etiqueta: 'Mensaje secreto', devolverFoco: btn });
      if (conFiesta) {
        const r = ctx.escena.getBoundingClientRect();
        const cx = innerWidth / 2 - r.left, cy = innerHeight / 2 - r.top;
        for (let i = 0; i < 24; i++) {
          setTimeout(() => ctx.flotar(L.elegirAlAzar(ctx.contenido.corazones), cx + (Math.random() - 0.5) * 300, cy + (Math.random() - 0.5) * 200), ctx.reducido ? 0 : i * 70);
        }
      }
    }
  },
};
