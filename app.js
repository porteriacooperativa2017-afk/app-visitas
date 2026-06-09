const html5QrCode = new Html5Qrcode("reader");

function iniciarEscaneo() {
    html5QrCode.start(
        { facingMode: "environment" }, // Cámara trasera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            // Esto se ejecuta cuando lee un QR
            document.getElementById('escaneoRaw').value = decodedText;
            alert("QR Detectado: " + decodedText);
            
            // Cerrar cámara después de leer
            html5QrCode.stop().then(() => {
                console.log("Cámara apagada");
            });
        },
        (errorMessage) => {
            // Esto ignora los errores de escaneo mientras busca
        }
    ).catch(err => {
        alert("Error al abrir cámara: " + err);
    });
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
    fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Guardado en base de datos:", data);
        
        // 2. DISPARO DE WHATSAPP GRATUITO (Solo en Modo Normal)
        if (!modoEventoCheck.checked && nroContacto && nroContacto !== "N/A") {
            // Estructuramos el texto con negritas para WhatsApp
            const textoMensaje = `📢 *Aviso de Ingreso - QR-U*\n\nHola *${payload.anfitrion}*,\nte informamos que se encuentra en guardia:\n\n👤 *Visita:* ${payload.datosPersonales}\n🏢 *Empresa:* ${payload.empresa}\n📍 *Sector:* ${payload.sector}\n📝 *Obs:* ${payload.observaciones}\n🕒 *Hora:* ${payload.fechaHora}`;
            
            // Creamos el enlace oficial codificado para que no falle por espacios o caracteres
            const urlWhatsApp = `https://api.whatsapp.com/send?phone=${nroContacto}&text=${encodeURIComponent(textoMensaje)}`;
            
            // Abre WhatsApp Web en una pestaña nueva listo para presionar Enter
            window.open(urlWhatsApp, '_blank');
        }
        
        limpiarFormulario();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("🚨 Error de comunicación con el servidor local.");
    });
});

cargarSectores();