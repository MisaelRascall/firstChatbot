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

    } else if (text.includes("2") || text.includes("consultar")) {
      // 3.2 - Menú consultar
      estado.pasoActual = "consultar";
    } else if (text.includes("3") || text.includes("salir")) {
      // 3.3 - Salida del flujo
      await enviarMensajeTexto(from, "¡Gracias por tu visita!")
      delete estadoUsuario[from]; // Borra el estado de un cliente específico.
      return;
    } else {
      await enviarMensajeTexto(from,
        "Opción no valida, por favor escribe 1, 2 o 3.")
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
    } else if (text.includes("3") || text.includes("regresar")) {
      // 3.1.3 Regresando al menú principal
      await enviarMensajeTexto(from,
        "Elige un número o escribe la opción:\n" +
        "1 - Comprar\n" +
        "2 - Consultar\n" +
        "3 - Salir"
      );
      estado.pasoActual = "eligiendoOpcion";
    } else {
      await enviarMensajeTexto(from,
        "Opción no valida, por favor escribe 1, 2 o 3."
      );
    }
  }

  if (estado.pasoActual == "lineaBlanca") {
    // 3.1.1.1 Producto lavadora.
    if (text.includes("1") || text.includes("lavadora")) {
      await enviarMensajeTexto(from,
        "Estos son los datos de la Lavadora:\n" +
        "Producto: Lavadora Mabe\n" +
        "Precio:$ 8500\n" +
        "Color: Blanco\n" +
        "Responde si para comprar el producto o regresar para repetir el menú principal."
      );
      estado.pasoActual = "comprarLavadora";

    } else if (text.includes("2") || text.includes("secadora")) {
      // 3.1.1.2 Producto secadora.
      await enviarMensajeTexto(from,
        "Estos son los datos de la Secadora:\n" +
        "Producto: Secadora Mabe\n" +
        "Precio:$ 10000\n" +
        "Color: Negro\n" +
        "Responde si para comprar o no para cancelar el producto\n" +
        "O escribe regresar para repetir el menú principal"
      );
      estado = "comprarSecadora";
    } else if (text.includes("3") || text.includes("regresar")) {
      // 3.1.1.3 Regresando al menú principal
      await enviarMensajeTexto(from,
        "Elige un número o escribe la opción:\n" +
        "1 - Comprar\n" +
        "2 - Consultar\n" +
        "3 - Salir"
      );
      estado.pasoActual = "eligiendoOpcion";
    } else {
      await enviarMensajeTexto(from,
        "Opción no valida, por favor escribe 1, 2 o 3."
      );
    }
  }

  if (estado.pasoActual === "comprarLavadora") {
    // 3.1.1.1.1 Respondiendo "Si" a la comra.
    if (text.includes("si")) {
      await enviarMensajeTexto(from,
        "¡Gracias! Compra realizada."
      );
      delete estadoUsuario[from];
    } else if (text.includes("no")) {
      // 3.1.1.1.2 Respondiendo "No" a la compra.
      await enviarMensajeTexto(from,
        "Esta bien. ¡Gracias por visitarnos!"
      );
      delete estadoUsuario[from];
    } else {
      await enviarMensajeTexto(from,
        "Opción no valida, regresarás al menú principal.\n" +
        "Elige un número o escribe la opción:\n" +
        "1 - Comprar\n" +
        "2 - Consultar\n" +
        "3 - Salir"
      );
      estado.pasoActual = "eligiendoOpcion";
    }
  }

  if (estado.pasoActual === "comprarSecadora") {
    if (text.includes("si")) {
      // 3.1.1.2.1 Respondiendo "Si" a la compra
      await enviarMensajeTexto(from,
        "¡Gracias! Compra realizada."
      );
      delete estadoUsuario[from];
    } else if (text.includes("no")) {
      // 3.1.1.2.2 Respondiendo "No" a la compra
      await enviarMensajeTexto(from,
        "Esta bien. ¡Gracias por visitarnos!"
      );
      delete estadoUsuario[from];
    } else {
      // 3.1.1.2.3 Regresando al menú principal
      await enviarMensajeTexto(from,
        "Opción no valida, regresarás al menú principal.\n" +
        "Elige un número o escribe la opción:\n" +
        "1 - Comprar\n" +
        "2 - Consultar\n" +
        "3 - Salir"
      );
      estado.pasoActual = "eligiendoOpcion";
    }
  }

// Definiendo el flujo de comprar categoria electrónica

  return; // Detenemos el flujo.
}
module.exports = handleIncomingMessage;