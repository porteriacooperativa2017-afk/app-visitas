// --- CONFIGURACIÓN ---
const html5QrCode = new Html5Qrcode("reader");
const URL_GOOGLE = 'https://script.google.com/macros/s/AKfycbx81QHVekrnMEKtE2O15ZKMY2HRBRPOSxTj5rNtET8A7UqvC3QQEt4gSC63g4Ol2Zk/exec';

// --- MAESTRO DE DATOS ---
const maestroSectores = {
    "PLANTA LOGISTICA": [{ nombre: "MUGNECO ADRIAN", contacto: "5492615320950" }],
    "CAPITAL HUMANO": [{ nombre: "Fernández Rubén", contacto: "5492615320950" }, { nombre: "Pablo Jacuzzi", contacto: "5492615320950" }],
    // ... (aquí mantén toda tu lista de sectores igual)
    "EVENTO": [{ nombre: "EVENTO", contacto: "N/A" }]
};

// --- ELEMENTOS DOM ---
const escaneoRawInput = document.getElementById('escaneoRaw');
const datosPersonalesInput = document.getElementById('datosPersonales');
const empresaInput = document.getElementById('empresa');
const sectorSelect = document.getElementById('sector');
const anfitrionSelect = document.getElementById('anfitrion');
const modoEventoCheck = document.getElementById('modoEvento');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnWhatsApp = document.getElementById('btnWhatsApp');

// --- FUNCIONES DE ESCANEO ---
async function iniciarEscaneo() {
    if (html5QrCode.isScanning) return;
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                datosPersonalesInput.value = decodedText;
                datosPersonalesInput.dispatchEvent(new Event('input'));
                html5QrCode.stop();
            },
            () => {}
        );
    } catch (err) { alert("Error de cámara"); }
}

// --- FUNCIÓN DE REGISTRO (CONECTA GOOGLE + WHATSAPP) ---
async function registrarIngreso() {
    if (!datosPersonalesInput.value || !sectorSelect.value) {
        alert('Completa los campos obligatorios.');
        return;
    }

    const payload = {
        datosPersonales: datosPersonalesInput.value,
        empresa: empresaInput.value,
        sector: sectorSelect.value,
        anfitrion: anfitrionSelect.value,
        observaciones: document.getElementById('observaciones').value,
        modoEvento: modoEventoCheck.checked
    };

    try {
        const response = await fetch(URL_GOOGLE, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        alert("✅ Registro exitoso.");
        
        // Habilitar botón WhatsApp con el número fijo
        const mensajeWP = `Nuevo ingreso: ${payload.datosPersonales} | Empresa: ${payload.empresa} | Sector: ${payload.sector}`;
        btnWhatsApp.style.display = "block";
        btnWhatsApp.onclick = () => window.open(`https://wa.me/5492615320950?text=${encodeURIComponent(mensajeWP)}`, '_blank');
        
    } catch (error) {
        alert("Error al guardar en planilla.");
    }
}

// --- EVENTOS DE INTERFAZ ---
btnRegistrar.addEventListener('click', registrarIngreso);

// Mantén aquí tus listeners originales de "sectorSelect.addEventListener('change', ...)"
// y la lógica de "escaneoRawInput.addEventListener('input', ...)" que ya tenías funcionando.
