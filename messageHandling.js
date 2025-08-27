const fs = require("fs");
const {
  enviarPlantillaWhatsApp,
  enviarMensajeTexto,
  enviarPlantillaImagen
} = require("./whatsappTemplates");

// Estado de la Compra
const estadoUsuario = {};

async function handleIncomingMessage(payload) {
  fs.appendFileSync(
    "debug_post_log.txt",
    `${new Date().toISOString()} - POST Request: ${JSON.stringify(payload)}\n`
  );

  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;

  const from = message.from; //número del usuario
  const text = message.text?.body || ""; //mensaje recibido

  // Iniciando el estado si no existe.
  if (!estadoUsuario[from]) {
    estadoUsuario[from] = {
      pasoActual: "bienvenida", // bienvenida - menuPrincipal - comprar - consultar - mostrarCompra - Finalizar
      categoria: "",
    };
  }
  const estado = estadoUsuario[from];

  // Ejemplo simulado de bd
  const compras = {
    "ABC123": { producto: "iPhone", precio: 20000 },
    "XYZ789": { producto: "Lavadora Mabe", precio: 8500 }
  };

  // Palabras clave frecuentes para iniciar la conversación
  const saludos = [
    "hola", "buen día", "buenos días", "buenas tardes", "buenas noches", "qué tal", "cómo estás", "hola, estoy interesado", "información", "quiero comprar", "tengo una duda", "servicio", "producto", "precio", "necesito"
  ];

  // Flujo de bienvenida.
  if (estado.pasoActual === "bienvenida") {
    if (saludos.some(saludo => text.toLowerCase().includes(saludo))) {
      await enviarMensajeTexto(from,
        "¡Hola! Bienvenido a mi *Tienda*.\n" +
        "Te mostraré el menú principal."
      );
    }
    estado.pasoActual = "menuPrincipal";

    // Flujo de menú principal
  } else if (estado.pasoActual === "menuPrincipal") {
    await enviarMensajeTexto(from,
      "Elige un número o escribe la opción.\n" +
      "¿En qué puedo ayudarte?\n" +
      "1 - Comprar\n" +
      "2 - Consultar\n" +
      "3 - Salir"
    );

    if (text === "1" || text.toLowerCase().includes("comprar")) {
      await enviarMensajeTexto(from,
        "Has elegido la opción *Comprar*.\n\n" +
        "Selecciona una categoría:\n" +
        "1. Electrónica\n" +
        "2. Línea Blanca"
      );
      estado.pasoActual = "comprar";

    } else if (text === "2" || text.toLowerCase().includes("consultar")) {
      await enviarMensajeTexto(from,
        "Has elegido la opción *Consultar*.\n" +
        "Por favor escribe el *folio de tu compra*.\n" +
        "O escribe 'Salir' para terminar la conversación."
      );
      estado.pasoActual = "consultar";

    } else if (text === "3" || text.toLowerCase().includes("salir")) {
      await enviarMensajeTexto(from,
        "¡Gracias por tu visita!"
      );
      estado.pasoActual = "finalizado";

    } else {
      await enviarMensajeTexto(from,
        "No entendí tu respuesta. Por favor selecciona una opción:\n\n" +
        "1. Comprar\n" +
        "2. Consultar\n" +
        "3. Salir"
      );
    }
    // Flujo de menú comprar
  } else if (estado.pasoActual === "comprar") {
    if(text === "1"){
      await enviarMensajeTexto(from, 
        "Has elegido la opción *Categorias*"
      );
    }
  }
}
module.exports = handleIncomingMessage;