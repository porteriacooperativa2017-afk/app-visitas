const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

// Configuración del Puerto
const PORT = process.env.PORT || 3000;

// URL de tu Google Sheet (para guardar el registro)
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwI8DkAT7bKZPUhaS15cXwaCLposlnQ7RjssaV0Eehm7TAaCNfncpupTIDoxXBej3dB/exec";

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- RUTA PRINCIPAL DE REGISTRO ---
app.post('/api/registro', async (req, res) => {
    const datos = req.body;
    
    try {
        // 1. Guardar en Google Sheets (función necesaria)
        await axios.post(GOOGLE_SHEETS_URL, JSON.stringify(datos), {
            headers: { 'Content-Type': 'application/json' },
            maxRedirects: 5
        });

        // 2. Lógica limpia para la Empresa
        // Si no hay empresa, o es "PARTICULAR", esta variable queda vacía y no se escribe
        let lineaEmpresa = "";
        if (datos.empresa && datos.empresa.trim() !== "" && datos.empresa.toUpperCase() !== "PARTICULAR") {
            lineaEmpresa = `\n🏢 *Empresa:* ${datos.empresa}`;
        }

        // 3. Armado final del mensaje
        const mensaje = `*NUEVO INGRESO REGISTRADO*
👤 *Visita:* ${datos.datosPersonales}${lineaEmpresa}
🚪 *Sector:* ${datos.sector || ""}
👤 *Anfitrión:* ${datos.anfitrion || ""}
📝 *Obs:* ${datos.observaciones || "Sin observaciones"}`;

        console.log("--- MENSAJE FINAL PARA WHATSAPP ---");
        console.log(mensaje);

        // 4. Disparo a la API de WhatsApp (Tu lógica original)
        // Asegurate de que esta sea la URL de tu API de mensajería
        /*
        await axios.post('URL_DE_TU_API_WHATSAPP', {
            number: datos.contactoAviso,
            message: mensaje
        });
        */

        res.status(200).json({ success: true, message: "OK" });

    } catch (error) {
        console.error("Error al procesar el registro:", error);
        res.status(500).json({ success: false, message: "Error interno" });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
