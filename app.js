const html5QrCode = new Html5Qrcode("reader");

async function iniciarEscaneo() {
    // Si ya hay una instancia, la detenemos antes de iniciar
    if (html5QrCode.isScanning) {
        return;
    }

    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                // 1. EL CAMPO: Asegurate que 'datosPersonales' sea el ID correcto que tienes en tu HTML
                const inputField = document.getElementById('datosPersonales');
                
                if (inputField) {
                    // 2. Insertamos el valor
                    inputField.value = decodedText;

                    // 3. DISPARAMOS LOS EVENTOS (Esto engaña al formulario para que "sienta" que escribiste)
                    inputField.dispatchEvent(new Event('input', { bubbles: true }));
                    inputField.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // 4. Simulamos el Enter por si acaso
                    inputField.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
                    }));
                }

                // 5. DETENEMOS EL ESCÁNER
                html5QrCode.stop().then(() => {
                    console.log("Escaneo finalizado");
                });
            },
            (errorMessage) => {
                // Esto es normal, son errores de búsqueda mientras no encuentra QR
            }
        );
    } catch (err) {
        alert("Error al acceder a la cámara. Revisa los permisos.");
    }
}

// Tabla Maestro de Sectores y Anfitriones de Cofarmen
const maestroSectores = {
    "PLANTA LOGISTICA": [
        { nombre: "MUGNECO ADRIAN", contacto: "5492615320950" }
    ],
    "CAPITAL HUMANO": [
        { nombre: "Fernández Rubén", contacto: "5492615320950" },
        { nombre: "Pablo Jacuzzi", contacto: "5492615320950" },
        { nombre: "Yacuzzi Mariana", contacto: "5492615320950" },
        { nombre: "Tizera", contacto: "5492615320950" }
    ],
    "Administracion": [
        { nombre: "Martin Marcelo", contacto: "5492615320950" },
        { nombre: "Bustos Marcos", contacto: "5492615320950" },
        { nombre: "Videla Javier", contacto: "5492615320950" },
        { nombre: "Agüero Antonio", contacto: "5492615320950" },
        { nombre: "Velez Daniel", contacto: "5492615320950" }
    ],
    "Consejo": [
        { nombre: "Ganem Victoria", contacto: "5492615320950" }
    ],
    "Operador Logistico nave 2": [
        { nombre: "Constantino Adriana", contacto: "5492615320950" },
        { nombre: "Valdez Liliana", contacto: "5492615320950" },
        
    ],
    "Consejo": [
        { nombre: "Ganem Victoria", contacto: "5492615320950" }
    ],
    "Comercial": [
        { nombre: "Molina Andres", contacto: "5492615320950" },
        { nombre: "Tescari Maria Jose", contacto: "5492615320950" },
        { nombre: "Reina Julia", contacto: "5492615320950" },
        { nombre: "Sepulveda Marcela", contacto: "5492615320950" },
        { nombre: "Sanabria Juan", contacto: "5492615320950" },
        { nombre: "Perez Agustin", contacto: "5492615320950" }
    ],
    "Administración": [
        { nombre: "Pelayes Sergio", contacto: "5492615320950" },
        { nombre: "Oropel Walter", contacto: "5492615320950" },
        { nombre: "Garay Diego", contacto: "5492615320950" },
        { nombre: "Fernandez Jose Luis", contacto: "5492615320950" },
        { nombre: "Dominguez Diego", contacto: "5492615320950" },
        { nombre: "Peroso Vanesa", contacto: "5492615320950" },


    ],
    "Recepción": [
        { nombre: "Paris Sebastian", contacto: "5492615320950" },
        { nombre: "Guerra Emanuel", contacto: "5492615320950" },
        { nombre: "Pubill Franco", contacto: "5492615320950" },
        { nombre: "Fernandez Leonardo", contacto: "5492615320950" },
        { nombre: "Marzonetto Emiliano", contacto: "5492615320950" }
    ],
    "Evento": [
        { nombre: "Evento", contacto: "5492615320950" }
    ],
    "Mostrador": [
        { nombre: "Atención Mostrador", contacto: "5492615320950" }
    ],
    "Recepcion Técnica": [
        { nombre: "Daniel Ríos", contacto: "5492615320950" },
        { nombre: "Cecilia Nadal", contacto: "5492615320950" },
        { nombre: "Karina Escudero", contacto: "5492615320950" },
        { nombre: "Natalia Bustos", contacto: "5492615320950" },
        { nombre: "Jennifer Agüero", contacto: "5492615320950" }
    ],
    "Mantenimiento": [
        { nombre: "Personal de Mantenimiento", contacto: "5492615320950" }
    ],
    "EVENTO": [
        { nombre: "EVENTO", contacto: "N/A" }
    ]
};

// Captura de Elementos del DOM
const escaneoRawInput = document.getElementById('escaneoRaw');
const datosPersonalesInput = document.getElementById('datosPersonales');
const empresaInput = document.getElementById('empresa');
const sectorSelect = document.getElementById('sector');
const anfitrionSelect = document.getElementById('anfitrion');
const modoEventoCheck = document.getElementById('modoEvento');
const groupEmpresa = document.getElementById('groupEmpresa');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnLimpiar = document.getElementById('btnLimpiar');

let timeoutAutoGuardar = null;

// CONTROL DE FOCO: No interrumpe la escritura manual
document.addEventListener('click', (evento) => {
    const camposPermitidos = ['sector', 'anfitrion', 'observaciones', 'empresa', 'modoEvento'];
    if (camposPermitidos.includes(evento.target.id) || evento.target.tagName === 'OPTION') {
        return; 
    }
    escaneoRawInput.focus();
});

// Cargar sectores dinámicamente
function cargarSectores() {
    sectorSelect.innerHTML = '<option value="">Seleccione un sector...</option>';
    Object.keys(maestroSectores).forEach(sector => {
        if(sector !== "EVENTO" || modoEventoCheck.checked) {
            let option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            sectorSelect.appendChild(option);
        }
    });
}

// Filtrar anfitriones por sector
sectorSelect.addEventListener('change', (e) => {
    const sectorSeleccionado = e.target.value;
    anfitrionSelect.innerHTML = '<option value="">Seleccione anfitrión...</option>';
    
    if (sectorSeleccionado && maestroSectores[sectorSeleccionado]) {
        maestroSectores[sectorSeleccionado].forEach(anf => {
            let option = document.createElement('option');
            option.value = anf.nombre;
            option.textContent = anf.nombre;
            option.dataset.contacto = anf.contacto; 
            anfitrionSelect.appendChild(option);
        });
        
        if(maestroSectores[sectorSeleccionado].length === 1) {
            anfitrionSelect.selectedIndex = 1; 
        }
    }
});

// Procesamiento en tiempo real del escáner
escaneoRawInput.addEventListener('input', () => {
    const rawText = escaneoRawInput.value.trim();
    if (!rawText) return;

    if (timeoutAutoGuardar) clearTimeout(timeoutAutoGuardar);

    if (rawText.includes('@')) {
        const partes = rawText.split('@');
        if (partes.length >= 5) {
            const apellido = partes[1].toUpperCase();
            const nombre = partes[2];
            const dni = partes[4];
            datosPersonalesInput.value = `${apellido}, ${nombre} - DNI: ${dni}`;
        } else {
            datosPersonalesInput.value = "Formato DNI no reconocido";
        }
        
        if (!modoEventoCheck.checked) {
            groupEmpresa.style.display = 'flex';
            empresaInput.value = '';
            empresaInput.focus();
        }
    } else {
        const partes = rawText.split(' - ');
        if (partes.length >= 3) {
            datosPersonalesInput.value = partes[0]; 
            empresaInput.value = partes[2];         
            groupEmpresa.style.display = 'none';    
        } else {
            datosPersonalesInput.value = rawText; 
        }
    }

    // Auto-guardado instantáneo si es Modo Evento Masivo
    if (modoEventoCheck.checked && datosPersonalesInput.value && !datosPersonalesInput.value.includes("no reconocido")) {
        timeoutAutoGuardar = setTimeout(() => {
            btnRegistrar.click(); 
        }, 200); 
    }
});

// Conmutador de Modo Evento
modoEventoCheck.addEventListener('change', () => {
    if (modoEventoCheck.checked) {
        document.body.style.setProperty('--accent-blue', 'var(--accent-event)');
        groupEmpresa.style.display = 'none';
        empresaInput.value = "EVENTO";
        cargarSectores();
        sectorSelect.value = "EVENTO";
        sectorSelect.dispatchEvent(new Event('change')); 
    } else {
        document.body.style.setProperty('--accent-blue', '#0052cc');
        groupEmpresa.style.display = 'flex';
        limpiarFormulario();
    }
    escaneoRawInput.focus();
});

function limpiarFormulario() {
    escaneoRawInput.value = '';
    datosPersonalesInput.value = '';
    if (!modoEventoCheck.checked) {
        empresaInput.value = '';
        sectorSelect.value = '';
        anfitrionSelect.innerHTML = '<option value="">Seleccione anfitrión...</option>';
    }
    document.getElementById('observaciones').value = '';
    escaneoRawInput.focus();
}

btnLimpiar.addEventListener('click', limpiarFormulario);

// Acción del Botón Registrar e Interconexión con Node y WhatsApp Web
btnRegistrar.addEventListener('click', () => {
    if (!datosPersonalesInput.value || !sectorSelect.value || !anfitrionSelect.value) {
        alert('Por favor, complete todos los campos obligatorios antes de registrar.');
        return;
    }

    const selectedOption = anfitrionSelect.options[anfitrionSelect.selectedIndex];
    const nroContacto = selectedOption ? selectedOption.dataset.contacto : '';
    const observacionesTexto = document.getElementById('observaciones').value || 'Sin observaciones.';
    
    const payload = {
        modoEvento: modoEventoCheck.checked ? "SÍ" : "NO",
        tipoIngreso: escaneoRawInput.value.includes('@') ? "DNI" : "QR",
        escaneoRaw: escaneoRawInput.value,
        datosPersonales: datosPersonalesInput.value,
        empresa: empresaInput.value,
        sector: sectorSelect.value,
        anfitrion: anfitrionSelect.value,
        contactoAviso: nroContacto,
        observaciones: observacionesTexto,
        fechaHora: new Date().toLocaleString("es-AR")
    };

    // 1. Enviamos el registro en segundo plano a Node.js -> Google Sheets
    async function iniciarEscaneo() {
    // 1. Iniciamos el escaneo como siempre
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                // Llenamos el campo
                const inputField = document.getElementById('datosPersonales');
                inputField.value = decodedText;
                
                // Forzamos los eventos para que el formulario tome el valor
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Detenemos la cámara
                html5QrCode.stop();

                // 2. UNA VEZ ESCANEADO, ENVIAMOS A GOOGLE
                enviarAFormulario(decodedText);
            },
            (errorMessage) => { /* ignorar */ }
        );
    } catch (err) {
        alert("Error de cámara");
    }
}

// Nueva función auxiliar para enviar los datos
async function enviarAFormulario(valorEscaneado) {
    const btnWP = document.getElementById('btnWhatsApp');
    
    const datos = {
        datosPersonales: valorEscaneado,
        empresa: document.getElementById('empresa').value,
        sector: document.getElementById('sector').value,
        anfitrion: document.getElementById('anfitrion').value,
        observaciones: document.getElementById('observaciones').value,
        modoEvento: document.getElementById('tuSwitchModo').checked
    };

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbx81QHVekrnMEKtE2O15ZKMY2HRBRPOSxTj5rNtET8A7UqvC3QQEt4gSC63g4Ol2Zk/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        alert("✅ Registro guardado.");
        
        // Activamos el botón de WhatsApp
        const mensajeWP = `Nuevo ingreso: ${valorEscaneado}`;
        btnWP.style.display = "block";
        btnWP.onclick = () => window.open(`https://wa.me/5492615320950?text=${encodeURIComponent(mensajeWP)}`, '_blank');
        
    } catch (error) {
        alert("Error al guardar en la planilla.");
    }
}
