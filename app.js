
// =========================================================================
// 1. CONFIGURACIÓN INICIAL Y CONEXIÓN A LA API
// =========================================================================
?sheet=MOVIMIENTOS
const html5QrCode = new Html5Qrcode("reader");
// REEMPLAZA ESTA URL por la que te dé SheetDB al vincular tu planilla de visitas
const URL_API_SHEETDB = 'https://sheetdb.io/api/v1/tu_codigo_api_aqui';

// =========================================================================
// 2. MAESTRO DE SECTORES Y ANFITRIONES (COFARMEN)
// =========================================================================
const maestroSectores = {
    "PLANTA LOGISTICA": [
        { nombre: "MUGNECO ADRIAN", contacto: "5492615320950" }
    ],
    "CAPITAL HUMANO": [
        { nombre: "Fernández Rubén", contacto: "5492615320950" },
        { nombre: "Pablo Jacuzzi", contacto: "5492615320950" },
        { nombre: "Tissera Mariana", contacto: "5492615320950" },
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
        { nombre: "Valdez Liliana", contacto: "5492615320950" }
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
        { nombre: "Peroso Vanesa", contacto: "5492615320950" }
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

// =========================================================================
// 3. CAPTURA DE ELEMENTOS DEL DOM (INTERFAZ HTML)
// =========================================================================
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

// =========================================================================
// 4. CONTROL DE FOCO AUTOMÁTICO PARA LA PISTOLA DE ESCANEO
// =========================================================================
document.addEventListener('click', (evento) => {
    const camposPermitidos = ['sector', 'anfitrion', 'observaciones', 'empresa', 'modoEvento'];
    if (camposPermitidos.includes(evento.target.id) || evento.target.tagName === 'OPTION') {
        return; 
    }
    if (escaneoRawInput) escaneoRawInput.focus();
});

// =========================================================================
// 5. LÓGICA DINÁMICA DE SECTORES Y ANFITRIONES
// =========================================================================
function cargarSectores() {
    if (!sectorSelect) return;
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

if (sectorSelect) {
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
}

// =========================================================================
// 6. PROCESAMIENTO Y LIMPIEZA DE DATOS (DNI CON @ / QR)
// =========================================================================
if (escaneoRawInput) {
    escaneoRawInput.addEventListener('input', () => {
        const rawText = escaneoRawInput.value.trim();
        if (!rawText) return;

        if (timeoutAutoGuardar) clearTimeout(timeoutAutoGuardar);

        // Si detecta arroba, procesa el formato de tarjeta de DNI Argentino
        if (rawText.includes('@')) {
            const partes = rawText.split('@');
            if (partes.length >= 5) {
                const apellido = partes[1].toUpperCase();
                const nombre = partes[2].toUpperCase();
                const dni = partes[4];
                datosPersonalesInput.value = `${apellido}, ${nombre} - DNI: ${dni}`;
            } else {
                datosPersonalesInput.value = "FORMATO DNI NO RECONOCIDO";
            }
            
            if (!modoEventoCheck.checked) {
                groupEmpresa.style.display = 'flex';
                empresaInput.value = '';
                empresaInput.focus();
            }
        } else {
            // Procesamiento de QR tradicionales separados por guiones
            const partes = rawText.split(' - ');
            if (partes.length >= 3) {
                datosPersonalesInput.value = partes[0].toUpperCase(); 
                empresaInput.value = partes[2].toUpperCase();         
                groupEmpresa.style.display = 'none';    
            } else {
                datosPersonalesInput.value = rawText.toUpperCase(); 
            }
        }

        // Sistema de auto-guardado automático si está el Modo Evento encendido
        if (modoEventoCheck.checked && datosPersonalesInput.value && !datosPersonalesInput.value.includes("NO RECONOCIDO")) {
            timeoutAutoGuardar = setTimeout(() => {
                if (btnRegistrar) btnRegistrar.click(); 
            }, 200); 
        }
    });
}

// =========================================================================
// 7. CONMUTADOR DE MODO EVENTO MASIVO
// =========================================================================
if (modoEventoCheck) {
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
        if (escaneoRawInput) escaneoRawInput.focus();
    });
}

// =========================================================================
// 8. FUNCIONES DE LIMPIEZA
// =========================================================================
function limpiarFormulario() {
    if (escaneoRawInput) escaneoRawInput.value = '';
    if (datosPersonalesInput) datosPersonalesInput.value = '';
    if (!modoEventoCheck.checked) {
        if (empresaInput) empresaInput.value = '';
        if (sectorSelect) sectorSelect.value = '';
        if (anfitrionSelect) anfitrionSelect.innerHTML = '<option value="">Seleccione anfitrión...</option>';
    }
    const obsField = document.getElementById('observaciones');
    if (obsField) obsField.value = '';
    if (escaneoRawInput) escaneoRawInput.focus();
}

if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFormulario);

// =========================================================================
// 9. CONTROL DE ESCANEO DESDE LA CÁMARA (LIBRERÍA QR)
// =========================================================================
async function iniciarEscaneo() {
    if (html5QrCode.isScanning) {
        return;
    }
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                if (escaneoRawInput) {
                    // Cargamos el texto crudo en la caja de control e iniciamos la limpieza nativa
                    escaneoRawInput.value = decodedText;
                    escaneoRawInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                html5QrCode.stop().then(() => {
                    console.log("Cámara detenida de forma limpia.");
                });
            },
            (errorMessage) => { /* Escaneo en ejecución... */ }
        );
    } catch (err) {
        alert("No se pudo iniciar la cámara. Verifica los permisos de la aplicación.");
    }
}

// =========================================================================
// 10. ENVÍO DE DATOS A GOOGLE SHEETS (VÍA SHEETDB - ORDEN ESTRICTO A-G)
// =========================================================================
if (btnRegistrar) {
    btnRegistrar.addEventListener('click', async () => {
        if (!datosPersonalesInput.value || !sectorSelect.value || !anfitrionSelect.value) {
            alert('Por favor, complete los campos obligatorios antes de registrar.');
            return;
        }

        const selectedOption = anfitrionSelect.options[anfitrionSelect.selectedIndex];
        const nroContacto = selectedOption ? selectedOption.dataset.contacto : '5492615320950';
        const obsElement = document.getElementById('observaciones');
        const observacionesTexto = obsElement && obsElement.value ? obsElement.value.toUpperCase() : 'SIN OBSERVACIONES';
        
        // ESTRUCTURA EXACTA DE TU EXCEL: MAYÚSCULAS PURAS Y ORDEN DE COLUMNAS DE LA A A LA G
        const payload = {
            "data": [
                {
                    "FECHA Y HORA": new Date().toLocaleString("es-AR"),              // Columna A
                    "DATOS PERSONALES": datosPersonalesInput.value.toUpperCase(),       // Columna B
                    "EMPRESA O FARMACIA": (empresaInput.value || "VISITA").toUpperCase(), // Columna C
                    "SECTOR A VISITAR": sectorSelect.value.toUpperCase(),             // Columna D
                    "ANFITRION": anfitrionSelect.value.toUpperCase(),                 // Columna E
                    "OBSERVACIONES": observacionesTexto,                             // Columna F
                    "TIPO DE VISITA": modoEventoCheck.checked ? "SÍ" : "NO"           // Columna G
                }
            ]
        };

        try {
            // El fetch directo a la API de SheetDB (Soporte CORS nativo para APK)
            const response = await fetch(URL_API_SHEETDB, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("✅ Sincronizado en la hoja de cálculo con éxito.");

                // --- DISPARO AUTOMÁTICO DE WHATSAPP ---
                const mensajeWP = `Nuevo ingreso Visita: ${datosPersonalesInput.value} | Empresa: ${empresaInput.value || "VISITA"} | Sector: ${sectorSelect.value} -> Anfitrión: ${anfitrionSelect.value}`;
                window.open(`https://wa.me/${nroContacto}?text=${encodeURIComponent(mensajeWP)}`, '_blank');

                limpiarFormulario();
            } else {
                alert("❌ SheetDB rechazó los datos. Verifica que la FILA 1 de tu Excel tenga las columnas en MAYÚSCULAS.");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            alert("❌ Error de red. No se pudo conectar con la base de datos.");
        }
    });
}

// Inicialización de la carga al renderizar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarSectores();
    if (escaneoRawInput) escaneoRawInput.focus();
});
