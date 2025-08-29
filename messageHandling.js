const fs = require("fs");
const {
  enviarPlantillaWhatsApp,
  enviarMensajeTexto,
  enviarPlantillaImagen
} = require("./whatsappTemplates");
const { env } = require("process");

// Reiniciando el estado
const estadoUsuario = {};

async function handleIncomingMessage(payload) {
  fs.appendFileSync(
    "debug_post_log.txt",
    `${new Date().toISOString()} - POST Request: ${JSON.stringify(payload)}\n`
  );

  const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;

  const from = message.from; //número del usuario
  const text = message.text?.body?.toLowerCase() || ""; //mensaje recibido

  // Iniciando el estado si no existe.
  if (!estadoUsuario[from]) {
    estadoUsuario[from] = {
      pasoActual: "Bienvenida",
      categoria: "",
      producto: "",
      respuesta: "",
      folio: "",
    };
  }
  const estado = estadoUsuario[from]; // Alias de estadoUsuario

  // Palabras clave 
  const saludos = [
    "hola", "buen día", "buenos días", "buenas tardes", "buenas noches", "qué tal", "cómo estás", "hola, estoy interesado", "información", "quiero comprar", "tengo una duda", "servicio", "producto", "precio", "necesito"
  ];

  const categoria1 = [
    "línea", "linea", "blanca",
  ];

  const categoria2 = [
    "electronica", electrónica,
  ];

  // 1 - Bienvenida
  if (saludos.some(saludo => text.includes(saludo)) && estado.pasoActual === "bienvenida") {
    await enviarMensajeTexto(from,
      "!Hola¡ Bienvenido a *Mi Tienda*."
    );

    estado.pasoActual = "menuPrincipal";
  }

  // 2 - Menú principal
  if (estado.pasoActual === "menuPrincipal") {
    await enviarMensajeTexto(from,
      "Elige un número o escribe la opción:\n" +
      "1 - Comprar\n" +
      "2 - Consultar\n" +
      "3 - Salir"
    );

    estado.pasoActual = "eligiendoOpcion";
    return;
  }

  // 3 - Esperando respuesta al menú
  if (estado.pasoActual === "eligiendoOpcion") {
    // 3.1 - Menú comprar
    if (text.includes("1") || text.includes("comprar")) {
      await enviarMensajeTexto(from,
        "Estas dentro del menú de *Compras*:\n" +
        "Selecciona el número o escribe la opción que deseas.\n" +
        "1 - Linea blanca\n" +
        "2 - Electronica\n" +
        "3 - Regresar al menú principal"
      );
      estado.pasoActual = "comprar";

      // Averiguar como hacer el flujo para cuando el cliente elige la opción 3

    } else if (text.includes("2") || text.includes("consultar")) {
      estado.pasoActual = "consultar";
    } else if (text.includes("3") || text.includes("salir")) {
      await enviarMensajeTexto(from, "¡Gracias por tu visita!")
      delete estadoUsuario[from]; // Borra el estado de un cliente específico.
      return;
    } else {
      await enviarMensajeTexto(from, "Opción no valida, por favor escribe 1, 2 o 3.")
    }
    return;
  }

  if (estado.pasoActual === "comprar") {
    // 3.1.1 Menú línea blanca
    if (text.includes("1") || categoria1.some(c => text.includes(c))) {
      await enviarMensajeTexto(from,
        "Elije el *Producto* que quieres comprar:\n" +
        "1 - Lavadora Mabe\n" +
        "2 - Secadora Mabe\n" +
        "3 - Regresar al menú principal"
      );
      estado.pasoActual = "lineaBlanca";
    } else if (text.includes("2") || categoria2.some(c => text.includes(c))) {
      // 3.1.2 Menú electrónica
      await enviarMensajeTexto(from,
        "Elije el *Producto* que quieres comprar:\n" +
        "1 - iPhone\n" +
        "2 - Tableta Lenovo\n" +
        "3 - Regresar al menú principal"
      );
      estado.pasoActual = "electronica";
    }
  } else if(text.includes("3") || text.includes("regresar")){
    await enviarMensajeTexto(from,
      "Elige un número o escribe la opción:\n" +
      "1 - Comprar\n" +
      "2 - Consultar\n" +
      "3 - Salir"
    );
    estado.pasoActual = "eligiendoOpcion";
  }

  if(estado.pasoActual == "lineaBlanca") {
    // 3.1.1.1 Producto lavadora
    if(text.includes("1") || text.includes("lavadora")){

    }else if(text.includes("2") || text.includes("secadora")){

    }else if(text.includes("3") || text.includes("regresar")){

    } else {
      await enviarMensajeTexto(from,
        "Opción no valida, por favor escribe 1, 2 o 3."
      );
    }

  }

}
module.exports = handleIncomingMessage;