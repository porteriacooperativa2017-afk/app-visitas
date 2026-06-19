// =========================================================================
// 1. CONFIGURACIÓN DE ENLACES Y CONEXIONES (REEMPLAZÁ ACÁ)
// =========================================================================
const html5QrCode = new Html5Qrcode("reader");

// PEGÁ ACÁ EL ENLACE LARGO QUE TE DIO GOOGLE AL IMPLEMENTAR (Termina en /exec)
const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbwJBueaByH-UungFf6diEaGvxKgGSP36kKxsiZ9t53V6nI6zB_LZof9YikLwNxbgLN1/exec';

// Dejamos esta constante vieja acá arriba por si tu HTML o algún script la requiere, no molesta.
const URL_API_SHEETDB = 'https://sheetdb.io/api/v1/no_se_usa_pero_queda_guardada';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); 
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("MOVIMIENTOS") || ss.getSheets()[0]; 
    
    var datos;
    try {
      datos = JSON.parse(e.postData.contents);
    } catch(rawError) {
      datos = JSON.parse(e.parameter.datosJson || e.postData.contents);
    }
    
    var fechaHora = new Date();
    var datosPersonales = datos.datosPersonales || "";
    var empresa = datos.empresa || "";
    var sector = datos.sector || "";
    var anfitrion = datos.anfitrion || "";
    var observaciones = datos.observaciones || "";
    
    if (empresa !== "Particular" && empresa !== "") {
      if (!datosPersonales.toLowerCase().includes(empresa.toLowerCase())) {
        datosPersonales = datosPersonales + " / " + empresa;
      }
    }
    
    var modoTrabajo = datos.modoEvento ? "Modo Evento" : "Modo Normal";

    var nuevaFila = [
      fechaHora,       
      datosPersonales, 
      empresa,         
      sector,          
      anfitrion,       
      observaciones,   
      modoTrabajo      
    ];
    
    sheet.appendRow(nuevaFila);
    
    // ========================================================
    // 🎯 LOGICA DE ENVÍO AUTOMÁTICO DE WHATSAPP INTEGRADA
    // ========================================================
    if (anfitrion !== "") {
      try {
        // Obtenemos el número de teléfono buscando en la lista estructurada
        var telefonoDestino = obtenerTelefonoAnfitrion(anfitrion);
        
        if (telefonoDestino) {
          // Armamos un texto limpio y prolijo para enviar por el servidor
          var mensaje = "📢 *Aviso de Ingreso*\n\n" +
                        "Hola Sr/a *" + anfitrion + "*, Le informamos que se registró una nueva visita para usted en portería. Aguardamos su autorización para el ingreso:\n\n" +
                        "👤 *Visitante:* " + datosPersonales + "\n" +
                        "📍 *Sector:* " + sector + "\n" +
                        "📝 *Obs:* " + (observaciones || "Ninguna");
          
          // Despachamos el mensaje a través del proveedor de QR único
          enviarMensajeServidor(telefonoDestino, mensaje);
        }
      } catch (errorWs) {
        // Si el WhatsApp falla por alguna razón de red, se anota el error pero NO se traba la app
        sheet.appendRow([new Date(), "ERROR ENVIO WHATSAPP: " + errorWs.toString()]);
      }
    }
    // ========================================================
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "message": "Registrado con éxito"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    sheet.appendRow([new Date(), "ERROR INTERNO: " + error.toString()]);
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 🔍 Función que recorre tu estructura de datos nativa para encontrar el contacto
function obtenerTelefonoAnfitrion(nombreBuscado) {
  var directorio = {
    "Mostrador": [{ nombre: "Atención Mostrador", contacto: "N/A" }],
    "PLANTA LOGISTICA": [{ nombre: "MUGNECO ADRIAN", contacto: "5492615320950" },
                         {nombre:"Carbajo Rodrigo",contacto: "5492615320950"},
                         {nombre:"Di Lorenzo Diego",contacto: "5492615320950"}],
    "CAPITAL HUMANO": [
        { nombre: "Fernández Rubén", contacto: "5492615320950" },
        { nombre: "Pablo Iacobucci", contacto: "5492614168508" },
        { nombre: "Tissera Mariana", contacto: "5492615320950" },
    
    ],
    "Administracion": [
        { nombre: "Martin Marcelo", contacto: "5492615320950" },
        { nombre: "Bustos Marcos", contacto: "5492615320950" },
        { nombre: "Videla Javier", contacto: "5492615320950" },
        { nombre: "Agüero Antonio", contacto: "5492615320950" },
        { nombre: "Velez Daniel", contacto: "N/A" }
    ],
    "Consejo": [{ nombre: "Ganem Victoria", contacto: "5492615513444" }],
    "Funsad": [{ nombre: "Ganem Victoria", contacto: "549261551344" }],
    "Lobby": [{ nombre: "Sanchez Alejandro", contacto: "5492615158389" },
              { nombre: "Ganem Victoria", contacto: "549261551344" },
              { nombre: "Escudero Carina", contacto: "5492615320950" }],
    "Operador Logistico nave 2": [
        { nombre: "Constantino Adriana", contacto: "5492615320950" },
        { nombre: "Valdez Liliana", contacto: "5492616757808" }
    ],
    "Comercial": [
        { nombre: "Molina Andres", contacto: "5492615320950" },
        { nombre: "Tescari Maria Jose", contacto: "5492615320950" },
        { nombre: "Reina Julia", contacto: "5492615320950" },
        { nombre: "Sepulveda Marcela", contacto: "5492615320950" },
        { nombre: "Sanabria Juan", contacto: "5492615320950" },
        { nombre: "Perez Agustin", contacto: "5492615320950"}
    ],
    "Cajas": [
        { nombre: "Arce José", contacto: "5492615320950" },
        { nombre: "Ponse Matias", contacto: "5492615320950" }
       
    ],
    "Administración osep": [
        { nombre: "Pelayes Sergio", contacto: "5492615320950" },
        { nombre: "Oropel Walter", contacto: "55492615320950" },
        { nombre: "Garay Diego", contacto: "5492615320950" },
        { nombre: "Fernandez Jose Luis", contacto: "5492615320950" },
        { nombre: "Dominguez Diego", contacto: "5492615320950" },
        { nombre: "Peroso Vanesa", contacto: "5492615320950" }
    ],
    "Recepción Nave 1": [
        { nombre: "Paris Sebastian", contacto: "5492615320950" },
        { nombre: "Guerra Emanuel", contacto: "N/A" },
        { nombre: "Pubill Franco", contacto: "N/A" },
        { nombre: "Fernandez Leonardo", contacto: "N/A" },
        { nombre: "Marzonetto Emiliano", contacto: "N/A" }
    ],
    "Recepción Nave 2": [
        { nombre: "Moran Federico", contacto: "N/A" },
        { nombre: "Montenegro Victor", contacto: "N/A" },
        {nombre: "Herrera Luis" , contacto: "N/A" }],
        "Créditos": [
        { nombre: "Rovatti Dario", contacto: "5492615320950" },
        { nombre: "Agüero Rocio", contacto: "N/A" },
        {nombre: "Andreoni Anabela" , contacto: "N/A" }],
    "Sistemas": [
        { nombre: "Lujan Omar", contacto: "5492615320950" },
        { nombre: "Puebla Adrian", contacto: "5492615320950" },
        {nombre: "Placci Martin" , contacto: "5492615320950" }],
      "Devolución a Proveedor y/o donaciones": [
        { nombre: "Alvarez Cecilia", contacto: "5492615320950" }],
    "Evento": [{ nombre: "Evento", contacto: "N/A" }],
    "Recepcion Técnica": [
        { nombre: "Daniel Ríos", contacto: "5492615320950" },
        { nombre: "Cecilia Nadal", contacto: "5492615320950" },
        { nombre: "Carina Escudero", contacto: "5492615320950" },
        { nombre: "Natalia Bustos", contacto: "5492612128450" },
        { nombre: "Jennifer Agüero", contacto: "5492615320950" }
    ],
    "Mantenimiento": [{ nombre: "Marsollier Ivan", contacto: "5492615320950" },
                      { nombre: "Brizuela Tomas", contacto:"5492615320950"}],
    "Guardia": [{ nombre: "Puesto 1", contacto: "5492615320950" }],
    "EVENTO": [{ nombre: "EVENTO", contacto: "N/A" }]
};

  var limpioBuscado = nombreBuscado.toString().trim().toLowerCase();

  // Recorremos cada sector de la lista
  for (var sector in directorio) {
    var personas = directorio[sector];
    for (var i = 0; i < personas.length; i++) {
      // Si coincide el nombre, devolvemos el número de contacto
      if (personas[i].nombre.toString().trim().toLowerCase() === limpioBuscado) {
        return personas[i].contacto.toString().trim();
      }
    }
  }
  return null; // Si no lo encuentra en ningún sector
}

// 🚀 Función de pasarela de envío por API de QR único (Ejemplo Green-API gratuito o similar)
function enviarMensajeServidor(telefono, mensaje) {
  // CONFIGURAR AQUÍ TUS CREDENCIALES DEL EMISOR ÚNICO
  var idInstance = "7107649071";
  var apiTokenInstance = "f072e835115f43118a3cf6ce57b6c06188a895a0affe4da997";
  
  var url = "https://api.green-api.com/waInstance" + idInstance + "/sendMessage/" + apiTokenInstance;
  
  var payload = {
    "chatId": telefono + "@c.us", 
    "message": mensaje
  };
  
  var opciones = {
    "method" : "post",
    "contentType": "application/json",
    "payload" : JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var respuesta = UrlFetchApp.fetch(url, opciones);
  return respuesta.getContentText();
}
