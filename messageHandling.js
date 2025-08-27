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
      pasoActual: "bienvenida", // bienvenida - menuPrincipal - comprar - categorias - consultar - mostrarCompra - Finalizar
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

  // Bienvenida.
  if (saludos.some(saludo => text.toLowerCase().includes(saludo))) {
    await enviarMensajeTexto(from,
      "¡Hola! Bienvenido a mi *Tienda*.\n" +
      "¿En qué puedo ayudarte hoy?\n" +
      "1 - Comprar\n" +
      "2 - Consultar\n" +
      "3 - Salir" +
      "Elige un número o escribe la opción."
    );
    estado.pasoActual = "menuPrincipal";
  } // Continua el flujo

  // Menú principal.
  if (estado.pasoActual === "menuPrincipal") {
    if (text.toLowerCase().includes("1") || text.toLowerCase().includes("comprar")) {
      await enviarMensajeTexto(from,
        "Elige una *Categoría*:\n" +
        "1 - Linea blanca\n" +
        "2 - Electronica\n" +
        "O puedes regresar al menú principal escribiendo la palabra regresar"
      );
      estado.pasoActual = "comprar";
      return;
    }
  }else if(estado.pasoActual === "menuPrincipal"){
    // ENCERRAR LA BIENVENIDA EN OTRA CONDICION PARA LEER estado.pasoActual === "bienvenida"
  }
}
module.exports = handleIncomingMessage;