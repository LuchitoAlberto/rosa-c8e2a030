(() => {
  const L = window.Logica;
  const $ = (s) => document.querySelector(s);
  const C = L.normalizarContenido(window.CONTENT);
  if (!C) {
    document.body.innerHTML = '<p style="padding:24px;font:1.1rem Georgia,serif">No se pudo leer <b>content.js</b>. Revisa que no falte una coma ni haya comillas dobles dentro de un texto.</p>';
    return;
  }
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const preview = new URLSearchParams(location.search).has('preview');
  const esc = $('#escena'), mesa = $('#mesa'), nota = $('#nota'), sobre = $('#sobre'), cartaWrap = $('#cartaWrap');
  const pista = $('#pista'), audio = $('#audio'), btnMusica = $('#musica');
  const PASO_MS = 250;
  const raiz = document.documentElement;
  let listo; // promesa con las polaroids ya creadas

  document.title = C.tituloPagina || `Para ${C.titulo.split('\n').pop()} 💖`;

  const bloqueada = () => !preview && L.tiempoRestante(Date.now(), C.desbloqueo).bloqueada;
  const caja = (n, l) => `<div><b>${String(n).padStart(2, '0')}</b><span>${l}</span></div>`;

  // ---------- Transiciones ----------
  // La pantalla que se va sube y se desvanece; recién entonces entra la siguiente.
  const salir = (el) => new Promise((ok) => {
    if (reducido) { el.hidden = true; return ok(); }
    el.classList.add('saliendo');
    setTimeout(() => { el.hidden = true; el.classList.remove('saliendo'); ok(); }, 450);
  });

  // En el celular, el teclado tarda un momento en cerrarse y mueve el tamaño de la pantalla.
  // Se espera a que termine (máx. 800 ms) antes de mostrar la portada, para que no se mueva sola.
  const esperarTeclado = () => new Promise((ok) => {
    const vv = window.visualViewport;
    if (!vv || vv.height >= innerHeight - 1) return ok();
    const fin = () => { clearTimeout(tope); vv.removeEventListener('resize', revisar); ok(); };
    const revisar = () => { if (vv.height >= innerHeight - 1) fin(); };
    const tope = setTimeout(fin, 800);
    vv.addEventListener('resize', revisar);
  });

  // Confeti en un canvas propio: sale en abanico desde arriba y cae con gravedad.
  function confeti(cantidad = 120) {
    if (reducido) return;
    const cv = document.createElement('canvas'), cx = cv.getContext('2d');
    cv.className = 'confeti';
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    cx.scale(dpr, dpr);
    document.body.append(cv);
    const colores = ['#D93A5B', '#FFD966', '#F28BA0', '#FFB3C6', '#FFFDFB'];
    const piezas = Array.from({ length: cantidad }, (_, i) => ({
      x: innerWidth / 2, y: innerHeight * 0.38,
      vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 14 - 4,
      r: Math.random() * 5 + 4, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.35,
      c: colores[i % colores.length], redonda: i % 4 === 0,
    }));
    (function cuadro() {
      cx.clearRect(0, 0, innerWidth, innerHeight);
      let vivas = 0;
      for (const p of piezas) {
        p.vy += 0.3; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        if (p.y > innerHeight + 20) continue;
        vivas++;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c;
        if (p.redonda) { cx.beginPath(); cx.arc(0, 0, p.r / 2, 0, 7); cx.fill(); } else cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        cx.restore();
      }
      if (vivas) requestAnimationFrame(cuadro); else cv.remove();
    })();
  }

  // ---------- Bloqueo ----------
  // shortcut: el bloqueo es solo del navegador, se salta con DevTools; aceptable para un regalo.
  function pintarCuenta() {
    const t = L.tiempoRestante(Date.now(), C.desbloqueo);
    if (!t.bloqueada) { clearInterval(reloj); salir($('#gate')).then(iniciar); return; }
    $('#gcount').innerHTML = caja(t.d, 'días') + caja(t.h, 'horas') + caja(t.m, 'min') + caja(t.s, 'seg');
  }
  let reloj;

  // ---------- Escena ----------
  const cargar = (src) => new Promise((ok) => {
    const img = new Image();
    // decode() deja la foto lista para pintarse, así la caída no se traba al decodificar 25 imágenes.
    img.onload = () => (img.decode ? img.decode().then(() => ok(img), () => ok(img)) : ok(img));
    img.onerror = () => ok(null);
    setTimeout(() => ok(null), 15000); // una foto que no llega en 15 s se descarta
    img.src = src;
  });

  function iniciar() {
    esc.hidden = false;
    $('#portada').classList.add('entra'); // título, subtítulo y botón suben uno tras otro
    setTimeout(() => confeti(130), 250);
    $('#titulo').textContent = C.titulo;
    $('#subtitulo').textContent = C.subtitulo;
    $('#abrir').textContent = C.boton;
    $('#nota .mensaje').replaceChildren(...C.mensaje.map((t) => Object.assign(document.createElement('p'), { textContent: t })));
    $('#nota .firma').textContent = C.firma;
    pista.textContent = C.pista;
    $('#tituloFotos').textContent = C.tituloFotos;
    $('#tituloFotos').hidden = !C.tituloFotos;
    raiz.classList.add('bloqueado'); // no se puede bajar hasta que terminen de caer las fotos
    $('#abrir').addEventListener('click', abrir, { once: true });
    sobre.addEventListener('click', abrirCarta);
    scrollTo(0, 0); // por si el teclado o la barra del navegador dejaron la página corrida
    listo = precargarFotos();
  }

  // Las fotos se descargan mientras ella ve la portada; las polaroids se arman recién al tocar el botón,
  // con el tamaño de pantalla de ese momento (así no importa si el teclado o la barra del navegador se movieron).
  async function precargarFotos() {
    const candidatas = L.fotosAMostrar(C.fotos, C.maxEnPantalla * 2);
    const imgs = await Promise.all(candidatas.map((f) => cargar(f.src)));
    return candidatas.map((f, i) => ({ ...f, img: imgs[i] })).filter((f) => f.img).slice(0, C.maxEnPantalla);
  }

  // shortcut: las posiciones se calculan una vez; si ella gira el móvil después, no se recolocan.
  function armarPolaroids(fotos) {
    // Las fotos cubren la primera pantalla, dejando abajo un espacio para los cartelitos de pista.
    const arriba = C.tituloFotos ? 84 : 0; // espacio para el título sobre las fotos
    const pos = L.colocarPolaroids(fotos.length, mesa.clientWidth, mesa.clientHeight - 108 - arriba, Math.random, C.columnas);
    pos.forEach((p) => { p.y += arriba; });
    return fotos.map((f, i) => {
      const el = document.createElement('figure');
      el.className = 'polaroid';
      el.style.cssText = `--x:${pos[i].x}px;--y:${pos[i].y}px;--rot:${pos[i].rot}deg;--w:${pos[i].w}px;--h:${pos[i].h}px;z-index:${i + 1}`;
      // Dos caras: el frente (foto y pie) y el dorso (mensajito). La cara de adelante gira al voltear.
      const div = (clase, ...hijos) => { const d = document.createElement('div'); d.className = clase; d.append(...hijos); return d; };
      const pie = Object.assign(document.createElement('span'), { className: 'pie', textContent: f.pie || '' });
      f.img.alt = f.pie || 'Nosotros';
      const dorso = Object.assign(document.createElement('p'), { textContent: f.dorso || C.dorsoGeneral });
      el.append(div('giro', div('cara frente', f.img, pie), div('cara dorso', dorso)));
      mesa.append(el);
      return el;
    });
  }

  async function abrir() {
    $('#abrir').disabled = true;
    $('#abrir').textContent = C.cargando;
    audio.play().catch(() => {});
    const pols = armarPolaroids(await listo);
    $('#portada').classList.add('fuera');
    $('#tituloFotos').classList.add('visible');
    const paso = Math.min(PASO_MS, Math.round(3500 / Math.max(pols.length, 1))); // la caída completa dura ~3.5 s como máximo
    // Un solo cambio de estilo para todas, con retraso escalonado en CSS: más fluido que 25 temporizadores.
    pols.forEach((el, i) => { el.style.transitionDelay = reducido ? '0ms' : i * paso + 'ms'; });
    void mesa.offsetWidth; // fija el punto de partida antes de animar
    pols.forEach((el) => el.classList.add('cayo'));
    setTimeout(() => { pols.forEach((el) => { el.style.transitionDelay = ''; }); terminar(); }, reducido ? 0 : pols.length * paso + 900);
  }

  // El sobre se abre y el papel se despliega hacia arriba; pasa solo al verlo, o al tocarlo.
  let cartaAbierta = false;
  function abrirCarta() {
    if (cartaAbierta) return;
    cartaAbierta = true;
    sobre.classList.add('abierto');
    setTimeout(() => {
      cartaWrap.classList.add('desplegada');
      setTimeout(() => nota.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' }), reducido ? 0 : 500);
    }, reducido ? 0 : 700);
  }

  function terminar() {
    raiz.classList.remove('bloqueado');
    pista.hidden = false;
    // "Desliza hacia abajo" se va desvaneciendo poco a poco mientras ella baja (y vuelve si sube).
    addEventListener('scroll', () => {
      const v = Math.max(0, 1 - scrollY / 220);
      pista.style.opacity = v;
      pista.style.pointerEvents = v ? '' : 'none';
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); abrirCarta(); } }, { threshold: 0.9 });
      io.observe(sobre);
    }
    const ctx = {
      escena: esc, mesa, nota, contenido: C, reducido,
      polaroids: () => [...mesa.querySelectorAll('.polaroid')],
      punto(ev) { const r = esc.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; },
      flotar(texto, x, y, op = {}) {
        const el = Object.assign(document.createElement('div'), { className: 'flota' + (op.clase ? ' ' + op.clase : ''), textContent: texto });
        el.style.left = x + 'px'; el.style.top = y + 'px';
        esc.append(el);
        setTimeout(() => el.remove(), reducido ? 600 : op.duracionMs || 1500);
      },
      confeti,
      // Tarjeta al centro de la pantalla, con rayos detrás (el secreto, los logros...). Un toque en cualquier parte la cierra
      // (con el teclado: Escape, Enter o espacio) y se desvanece antes de quitarse.
      tarjeta({ icono, titulo, texto, detalle, clase = '', etiqueta = '', devolverFoco }) {
        const ov = document.createElement('div');
        ov.className = 'secreto-overlay';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        ov.setAttribute('aria-label', etiqueta);
        ov.setAttribute('tabindex', '-1');
        const tarjeta = Object.assign(document.createElement('div'), { className: 'secreto-card ' + clase });
        for (const [clase, valor, oculto] of [['secreto-corazon', icono, true], ['secreto-titulo', titulo], ['secreto-texto', texto], ['secreto-detalle', detalle]]) {
          if (!valor) continue;
          const p = Object.assign(document.createElement(oculto ? 'span' : 'p'), { className: clase, textContent: valor });
          if (oculto) p.setAttribute('aria-hidden', 'true');
          tarjeta.append(p);
        }
        ov.append(tarjeta);
        let cerrando = false;
        const salir = () => {
          if (cerrando) return;
          cerrando = true;
          document.removeEventListener('keydown', tecla);
          ov.classList.add('cerrando');
          setTimeout(() => { ov.remove(); if (devolverFoco) devolverFoco.focus(); }, reducido ? 0 : 350);
        };
        const tecla = (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); salir(); } };
        const abiertoEn = Date.now();
        ov.addEventListener('click', () => { if (Date.now() - abiertoEn > 500) salir(); }); // ignora el clic de soltar un botón
        document.addEventListener('keydown', tecla);
        document.body.append(ov);
        ov.focus();
        return { cerrar: salir };
      },
    };
    for (const nombre of C.detalles || []) {
      const d = window.Detalles && window.Detalles[nombre];
      if (!d) { console.warn('detalle desconocido: ' + nombre); continue; }
      try { d.activar(ctx); } catch (e) { console.warn('el detalle ' + nombre + ' falló', e); }
    }
  }

  // ---------- Música (solo si existe musica.mp3) ----------
  audio.addEventListener('loadedmetadata', () => { btnMusica.hidden = false; btnMusica.title = C.cancion; });
  btnMusica.onclick = () => (audio.paused ? audio.play().catch(() => {}) : audio.pause());

  // ---------- Contraseña (primera pantalla, si hay una configurada) ----------
  // Se pide en cada entrada y en cada recarga; no se recuerda nada.
  function pedirClave() {
    const cfg = C.contrasena, form = $('#claveForm'), input = $('#cinput');
    $('#ctitulo').textContent = cfg.titulo;
    $('#cpista').textContent = cfg.pista;
    $('#cboton').textContent = cfg.boton;
    $('#clave').hidden = false;
    input.focus();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (L.claveCorrecta(input.value, cfg.clave)) {
        if (form.dataset.hecho) return; // Enter y toque a la vez: solo cuenta una vez
        form.dataset.hecho = '1';
        input.blur(); // se cierra el teclado mientras la pantalla se va
        salir($('#clave')).then(esperarTeclado).then(empezar);
        return;
      }
      $('#cerror').textContent = cfg.error;
      form.classList.remove('mal'); void form.offsetWidth; form.classList.add('mal'); // reinicia la sacudida
      input.value = ''; input.focus();
    });
  }

  // ---------- Arranque (al final, cuando todo lo de arriba ya existe) ----------
  function empezar() {
    if (bloqueada()) {
      $('#gtitulo').textContent = C.textoBloqueo.titulo;
      $('#gdetalle').textContent = C.textoBloqueo.detalle;
      $('#gate').hidden = false;
      pintarCuenta();
      reloj = setInterval(pintarCuenta, 1000);
    } else iniciar();
  }
  if (L.normalizarClave(C.contrasena.clave)) {
    pedirClave();
    // Si el navegador restaura la página al volver atrás, se recarga para que vuelva a pedir la clave.
    addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
  } else empezar();
})();
