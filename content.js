// ============================================================================
//  TODO LO QUE SE LEE EN LA PÁGINA SE CAMBIA AQUÍ. No hace falta tocar nada más.
//  - Los textos van entre comillas "así". Si quieres comillas dentro de un texto, usa 'comillas simples'.
//  - \n dentro de un texto es un salto de línea.
//  - Cada línea termina en coma. Si algo sale mal, la página avisa que revises este archivo.
// ============================================================================
window.CONTENT = {

  // ---------- 0. CONTRASEÑA (pantalla antes de todo lo demás) ----------
  // Ella la escribe para entrar. No importan mayúsculas, espacios ni tildes.
  // Para quitar esta pantalla, deja la clave vacía: clave: "".
  // OJO: es un candado de cortesía; quien sepa abrir content.js puede leerla. No guardes aquí una clave que uses en otro lado.
  contrasena: {
    clave: "160922", // CÁMBIALA por la que quieras
    titulo: "Solo para ti", // lo que se lee arriba
    pista: "El primer muack", // texto de ayuda (puedes dejar una pista de cuál es)
    boton: "Entrar",
    error: "Esa no es. Intenta otra vez.", // lo que sale si se equivoca
  },

  // ---------- 1. PORTADA (lo primero que ve) ----------
  tituloPagina: "Si ves esto me debes un beso", // lo que dice la pestaña del navegador
  titulo: "Feliz Cumpleños\n Karlita",
  subtitulo: "La niña mas increible de todo el mundo",
  boton: "Abre tu regalo",
  cargando: "Cargando fotos…", // lo que dice el botón mientras llegan las fotos

  // ---------- 2. FOTOS ----------
  // Ponlas en la carpeta fotos/ y apúntalas aquí, en el orden en que caen.
  //   src:   la foto.
  //   pie:   texto corto escrito debajo de la foto (opcional).
  //   dorso: el mensajito que aparece DETRÁS de la foto cuando se toca (opcional;
  //          si falta se usa `dorsoGeneral`). Se puede escribir en varias líneas con \n.
  // Si una foto no existe, simplemente no aparece.
  fotos: [
    { src: "fotos/foto4.jpg", dorso: "Mi cara favorita para mirar." },
    { src: "fotos/foto21.jpg", dorso: "El inicio de algo precioso." },
    { src: "fotos/foto23.jpg", dorso: "Pese a que no te guste, es de mis favoritas." },
    { src: "fotos/foto7.jpg", dorso: "Contigo siempre salgo feliz." },
    { src: "fotos/foto17.jpg", dorso: "Mi lugar favorito es a tu lado." },
    { src: "fotos/foto12.jpg", dorso: "Los de siempre, desde siempre." },
    { src: "fotos/foto14.jpg", dorso: "Una sonrisa sin igual." },
    { src: "fotos/foto10.jpg", dorso: "Uno de los mejores besos." },
    { src: "fotos/foto15.jpg", dorso: "Nosotros en nuetro corazon." },
    { src: "fotos/foto8.jpg", dorso: "Un muy bonito dia juntos." },
    { src: "fotos/foto5.jpg", dorso: "Los lugares lindos lo son más contigo." },
    { src: "fotos/foto3.jpg", dorso: "Lo mas bonito de los viajes eres tú." },
    { src: "fotos/foto2.jpg", dorso: "Asi bien aztecas." },
    { src: "fotos/foto22.jpg", dorso: "De las primeras fotitos juntos." },
    { src: "fotos/foto1.jpg", dorso: "LOVE." },
    { src: "fotos/foto6.jpg", dorso: "Mi cómplice favorita." },
    { src: "fotos/foto9.jpg", dorso: "Un beso nunca sobra." },
    { src: "fotos/foto11.jpg", dorso: "Un día cualquiera contigo es un día ideal." },
    { src: "fotos/foto13.jpg", dorso: "Abrazos de los que arreglan todo." },
    { src: "fotos/foto16.jpg", dorso: "Dos enamorados de liceo." },
    { src: "fotos/foto18.jpg", dorso: "Mi bonita." },
    { src: "fotos/foto19.jpg", dorso: "Pegaditos desde la primera cita." },
    { src: "fotos/foto20.jpg", dorso: "Mi sonrisa favorita es la tuya." },
    { src: "fotos/foto24.jpg", dorso: "Siempre tuyo." },
    { src: "fotos/foto25.jpg", dorso: "La primera fotito juntos :D." },
  ],
  tituloFotos: "Mi persona favorita", // título que aparece arriba de las fotos; déjalo vacío ("") para quitarlo
  maxEnPantalla: 25, // cuántas caen (las primeras de la lista)
  columnas: 5, // fotos por fila; con 25 fotos y 5 columnas quedan 5 filas exactas
  dorsoGeneral: "Te quiero 💕", // mensajito de atrás para las fotos que no tengan `dorso`
  voltear: { pista: "Toca una foto para ver qué dice atrás" }, // cartelito de arriba; borra el texto ("") para quitarlo
  pista: "Desliza hacia abajo", // cartelito que invita a bajar a la carta

  // ---------- 3. CARTA (aparece al bajar, en el sobre) ----------
  // Cada línea es un párrafo. Agrega o quita las que quieras.
  mensaje: [
    "Feliz cumpleaños mi niñita linda, muchas gracias de verdad por ser como eres y por hacerme sentir tan afortunado desde el primer dia que te tuve.",
    "Hice esta cosita pequeña con mucho cariño y esfuerzo, asi que espero que te guste, sino te mato :D.",
    "Gracias por ser mi persona favorita. Te amo muchisimo mi tesorito.",
  ],
  firma: "Kiwi", // cámbialo por tu nombre o apodo

  // ---------- 4. CORAZÓN SECRETO (mantener presionado) ----------
  llenarAmor: {
    instruccion: "Mantén presionado para una foto mia en tanga", // texto bajo el corazón
    secreto: "Te la creiste KJSHDASKHJDASKJ\n En realidad necesito que me prestes una tanga :3", // sale al centro de la pantalla
    otraVez: "Ver la foto en tanga otra vez", // texto del corazón cuando ya lo descubrió
  },

  // ---------- 5. DETALLES TIERNOS ----------
  // Quita un nombre de la lista para apagar ese detalle; cada uno es un archivo en detalles/.
  detalles: ["corazones", "arrastrar", "voltear", "logro", "besito", "llenarAmor"],

  // Logro: sale solo cuando ella lee el mensajito de atrás de TODAS las fotos en una misma visita (no se guarda nada).
  // Para quitarlo, borra "logro" de la lista de arriba.
  logro: {
    icono: "🏆", // el trofeo; puedes poner otro emoji
    titulo: "¡Logro desbloqueado!",
    texto: "Ticket válido\npara cualquier comida", // el premio (\n = salto de línea)
    detalle: "Leíste todos los mensajitos 💌", // línea pequeña de abajo; déjala vacía ("") para quitarla
  },
  corazones: ["💖", "💗", "💕", "🩷", "💞"], // salen al tocar el fondo
  besito: ["mua", "muack", "💋"], // sale al tocar dos veces una foto (se elige uno al azar)

  // ---------- 6. BLOQUEO Y MÚSICA ----------
  // La página se abre a esta hora (hora del móvil de ella). Para verla antes: agrega ?preview=1 al enlace.
  desbloqueo: "2026-10-30T00:00:00",
  textoBloqueo: { titulo: "Todavía no, Amoshito", detalle: "Tu regalo se abre en" },
  // Opcional: pon musica.mp3 junto a index.html y suena al abrir el regalo.
  cancion: "Dandelions · Ruth B",
};
