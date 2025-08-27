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

  const from = message.from;
  const text = message.text?.body || "";

  // Iniciando el estado si no existe.
  if (!estadoUsuario[from]) {
    estadoUsuario[from] = {
      pasoActual: "bienvenida", // bienvenida - menuPrincipal - compra - categoria - consulta - Finalizar
      // Para hacer una compra
      idProducto: "",
      compraTotal: "",
      // Para hacer una consulta
      folioCompra: "",
    };
  }
  const estado = estadoUsuario[from];

  // Palabras clave frecuentes para iniciar la conversación
  const saludos = [
    "hola", "buen día", "buenos días", "buenas tardes", "buenas noches", "qué tal", "cómo estás", "hola, estoy interesado", "información", "quiero comprar", "tengo una duda", "servicio", "producto", "precio", "necesito"
  ];

  // Saludo inicial.
  if (saludos.some(saludo => text.toLowerCase().includes(saludo))) {
    await enviarMensajeTexto(from,
      "¡Hola! Bienvenido a mi *Tienda*.\n" +
      "¿En qué puedo ayudarte hoy?\n" +
      "1 - Comprar\n" +
      "2 - Consultar\n" +
      "3 - Salir" +
      "Elige un número o escribe la opción."
    );
    estado.pasoActual = "menuPricipal";
    return;
  }

  // Menú principal.
  if (estado.pasoActual === "menuPrincipal") {
    if (text.toLowerCase().includes("1") || text.toLowerCase().includes("comprar")) {
      await enviarMensajeTexto(from,
        "Selecciona una categoría:\n" +
        "1 - Línea blanca\n" +
        "2 - Electrónica\n" +
        "3 - Regresar al menú principal" +
        "Elige un número o escribe la opción."
      );
      estado.pasoActual = "categoria";

      if (text.toLowerCase().includes("1") || text.toLowerCase().includes("linea blanca")) {
        await enviarMensajeTexto(from,
          "Has elegido *Línea blanca*.\n\n" +
          "Selecciona un producto:\n" +
          "1 - Lavadora Mabe, Precio: $8500, Color: Blanco\n" +
          "2 - Secadora Mabe, Precio: $10000, Color: Negro\n" +
          "3 - Regresar al menú principal" +
          "Elige un número o escribe la opción."
        );
        estado.pasoActual = "productoSeleccionado";
        estado.categoria = "lineaBlanca";

      } else if (text.toLowerCase().includes("2") || text.toLowerCase().includes("electronica")) {
        await enviarMensajeTexto(from,
          "Has elegido *Electrónica*.\n\n" +
          "Selecciona un producto:\n" +
          "1 - iPhone, Precio: $20000\n" +
          "2 - Tableta Lenovo, Precio: $8000\n" +
          "3 - Regresar al menú principal" +
          "Elige un número o escribe la opción."
        );
        estado.pasoActual = "productoSeleccionado";
        estado.categoria = "electronica";

      } else if (text.toLowerCase().includes("3") || text.toLowerCase().includes("regresar")) {
        await enviarMensajeTexto(from,
          "Regresando al menú principal..."
        );
        estado.pasoActual = "menuPrincipal";

      } else {
        await enviarMensajeTexto(from,
          "Opción no valida.\n" +
          "1 - Línea blanca\n" +
          "2 - Electrónica\n" +
          "3 - Salir\n" +
          "Elige un número o escribe la opción."
        );
      }

    } else if (text.toLowerCase().includes("2") || text.toLowerCase().includes("consulta")) {
      await enviarMensajeTexto(from,
        "Has elegido *Consultar*.\n\n" +
        "Por favor escribe el *folio de tu compra*.\n" +
        "O escribe 'Salir' o 'Regresar' para volver al menú principal."
      );
      estado.pasoActual = "consulta";

    } else if (text.toLowerCase().includes("3") || text.toLowerCase().includes("salir")) {
      await enviarMensajeTexto(from,
        "¡Gracias por tu visita! Vuelve pronto."
      );
      delete estadoUsuario[from];
    } else {
      await enviarMensajeTexto(from,
        "Opción no válida.\n\nElige una de las opciones:\n" +
        "1 - Comprar\n" +
        "2 - Consultar\n" +
        "3 - Salir"
      );
    }

  }
}
module.exports = handleIncomingMessage;