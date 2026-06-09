// --- CONFIGURACIÓN ---
const html5QrCode = new Html5Qrcode("reader");
const URL_GOOGLE = 'https://script.google.com/macros/s/AKfycbx81QHVekrnMEKtE2O15ZKMY2HRBRPOSxTj5rNtET8A7UqvC3QQEt4gSC63g4Ol2Zk/exec';

// --- MAESTRO DE DATOS ---
const maestroSectores = {
    "PLANTA LOGISTICA": [{ nombre: "MUGNECO ADRIAN", contacto: "5492615320950" },
    { nombre: "DI LORENZO DIEGO", contacto: "5492615320950" },
    { nombre: "CARBAJO RODRIGO", contacto: "5492615320950" },
    { nombre: "PUESTO 3", contacto: "5492615320950" }],
     "ADMINISTRACIÓN GERENCIA": [{ nombre: "MARCELO MARTÍN", contacto: "5492615320950" },
    { nombre: "MARCOS BUSTOS", contacto: "5492615320950" },],
     "ADMINISTRACIÓN": [{ nombre: "GARAY DIEGO", contacto: "5492615320950" },
    { nombre: "AGÜERO ANTONIO", contacto: "5492615320950" },
    { nombre: "VIDELA JAVIER", contacto: "5492615320950" },
    { nombre: "VELEZ DANIEL", contacto: "5492615320950" },{nombre: "FERNANDEZ JOSE LUIS", contacto: "5492615320950"}],
     "MARKETING: COMERCIAL": [{ nombre: "JULIA REINA", contacto: "5492615320950" },
    { nombre: "SEPULVEDA MARCELA", contacto: "5492615320950" },
    { nombre: "TESCARI MARIA JOSE", contacto: "5492615320950" },{ nombre: "PEREZ AGUSTIN", contacto: "5492615320950" }
    ],
     "COMPRAS Y VENTAS": [{ nombre: "MOLINA ANDRES", contacto: "5492615320950" },
    { nombre: "SANABRIA JUAN", contacto: "5492615320950" },
    { nombre: "ECHEVERRIA EMILIANO", contacto: "5492615320950" },
    { nombre: "PEREIRA NATALIA", contacto: "5492615320950" }],
    "SISTEMAS": [{ nombre: "LUJAN OMAR", contacto: "5492615320950" }, 
    { nombre: "PLACCI MARTIN", contacto: "5492615320950" },
    { nombre: "PUEBLA ADRIAN", contacto: "5492615320950" },{ nombre: "ALVAREZ FERNANDO", contacto: "5492615320950" },
    { nombre: "DESARROLLO", contacto: "5492615320950" }], 
     "DIRECCIÓN TÉCNICA": [{ nombre: "NADAL CECILIA", contacto: "5492615320950" },
      { nombre: "RIOS DANIEL", contacto: "5492615320950" },
    { nombre: "BUSTOS NATALIA", contacto: "5492615320950" },
    { nombre: "ESCUDERO CARINA ", contacto: "5492615320950" },{ nombre: "AGÜERO JENIFER", contacto: "5492615320950" }],  
    "OPERADOR LOGÍSTICO NAVE 2": [{ nombre: "CONSTANTINO ADRIANA", contacto: "5492615320950" },{ nombre: "VALDEZ LILIANA", contacto: "5492615320950" },],  
    "GERENCIA LOGISTICA": [{ nombre: "FUNES CRISTIAN", contacto: "5492615320950" }],
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
