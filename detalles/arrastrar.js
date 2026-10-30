// Las polaroids se pueden mover; la que se toca pasa al frente.
// Con el mouse se arrastra al instante. Con el dedo hay que mantener presionada la foto un momento:
// un deslizamiento rápido sigue siendo scroll de la página.
window.Detalles = window.Detalles || {};
window.Detalles.arrastrar = {
  activar(ctx) {
    const ESPERA_MS = 220;
    let z = 200; // por encima de las polaroids (1..N)
    const dentro = (v, max) => Math.min(Math.max(v, 0), max);
    ctx.polaroids().forEach((el) => {
      let activo = null, ini = null, agarrada = false, timer = 0, cuadro = 0, ultimo = null;
      const agarrar = () => {
        agarrada = true;
        el.classList.add('arrastrando');
        el.style.zIndex = ++z;
        try { el.setPointerCapture(activo); } catch (e) { /* puntero ya liberado */ }
      };
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      el.addEventListener('pointerdown', (e) => {
        if (activo !== null) return; // un segundo dedo se ignora
        activo = e.pointerId;
        const p = ctx.punto(e);
        ini = { px: p.x, py: p.y, x: parseFloat(el.style.getPropertyValue('--x')), y: parseFloat(el.style.getPropertyValue('--y')) };
        if (e.pointerType === 'mouse') agarrar(); else timer = setTimeout(agarrar, ESPERA_MS);
      });
      el.addEventListener('pointermove', (e) => {
        if (e.pointerId !== activo) return;
        const p = ctx.punto(e);
        if (!agarrada) { if (Math.hypot(p.x - ini.px, p.y - ini.py) > 8) clearTimeout(timer); return; } // se movió antes de tiempo: es scroll
        ultimo = p;
        if (!cuadro) cuadro = requestAnimationFrame(() => { // un solo cambio de estilo por cuadro, aunque lleguen más eventos
          cuadro = 0;
          el.style.setProperty('--x', dentro(ini.x + ultimo.x - ini.px, ctx.mesa.clientWidth - el.offsetWidth) + 'px');
          el.style.setProperty('--y', dentro(ini.y + ultimo.y - ini.py, ctx.mesa.clientHeight - el.offsetHeight) + 'px');
        });
      });
      // Mientras la foto está agarrada, la página no debe hacer scroll.
      el.addEventListener('touchmove', (e) => { if (agarrada && e.cancelable) e.preventDefault(); }, { passive: false });
      const fin = (e) => {
        if (e.pointerId !== activo) return;
        clearTimeout(timer);
        activo = null; agarrada = false;
        el.classList.remove('arrastrando');
      };
      el.addEventListener('pointerup', fin);
      el.addEventListener('pointercancel', fin);
    });
  },
};
