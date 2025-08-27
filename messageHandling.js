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
  if (!estadoUsuario[from]) {
    estadoUsuario[from] = {
      pasoActual: "bienvenida", // bienvenida - menuPrincipal - compra - categorias - consulta - Finalizar
      // Para una compra
      idProducto: "",
      precioProducto: "",
      folioCompra: "",
    };
  }
  const estado = estadoUsuario[from];

  // Palabras clave frecuentes para iniciar la conversación
  const saludos = [
    "hola", "buen día", "buenos días", "buenas tardes", "buenas noches", "qué tal", "cómo estás", "hola, estoy interesado", "información", "quiero comprar", "tengo una duda", "servicio", "producto", "precio", "necesito"
  ];

  if(saludos.some(saludo => text.toLowerCase().include(saludo))){
    const bienvenida = 
    "¡Hola! Bienvenido a mi Tienda.\n"+
    "¿En qué puedo ayudarte hoy?\n"+
    "1 - Comprar\n"+
    "2 - Consultar\n"+
    "3 - Salir"+
    "Elige un número o escribe la opción";

    await enviarMensajeTexto(from, bienvenida);

    estado.pasoActual = "menuPricipal";
    return;
  }

  // Manejo de opciones no validas
  if (estado.pasoActual !== "bienvenida") {
    await enviarMensajeTexto(from, "Opción no valida. Por favor, elige una de las opciones disponibles.")
    return;
  }
}

module.exports = handleIncomingMessage;