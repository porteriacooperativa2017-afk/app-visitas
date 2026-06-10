// --- CONFIGURACIÓN INICIAL Y CONEXIÓN ---
const html5QrCode = new Html5Qrcode("reader");
// REEMPLAZA ESTA URL por la que te dé SheetDB al vincular tu nueva planilla de visitas
const URL_API_SHEETDB = 'https://sheetdb.io/api/v1/0r37mye22zrgm';

// --- MAESTRO DE SECTORES Y ANFITRIONES DE COFARMEN ---
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

// --- CAPTURA DE ELEMENTOS DEL DOM ---
const escaneoRawInput = document.getElementById('escaneoRaw');
const datosPersonalesInput = document.getElementById('datosPersonales');
const empresaInput = document.getElementById('empresa');
const sectorSelect = document.getElementById('sector');
const anfitrionSelect = document.getElementById('anfitrion');
const modoEventoCheck = document.getElementById('modoEvento');
const groupEmpresa = document.getElementById('groupEmpresa');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnLimpiar = document.getElementById('btnLimpiar');
const btnWhatsApp = document.getElementById('btnWhatsApp');

let timeoutAutoGuardar = null;

// --- CONTROL DE FOCO AUTOMÁTICO ---
document.addEventListener('click', (evento) => {
    const camposPermitidos = ['sector', 'anfitrion', 'observaciones', 'empresa', 'modoEvento'];
    if (camposPermitidos.includes(evento.target.id) || evento.target.tagName === 'OPTION') {
        return; 
    }
    if (escaneoRawInput) escaneoRawInput.focus();
});

// --- CARGAR SECTORES DINÁMICAMENTE ---
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

// --- FILTRAR ANFITRIONES POR SECTOR ---
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

// --- PROCESAMIENTO EN TIEMPO REAL DEL ESCÁNER MANUAL / PISTOLA ---
if (escaneoRawInput) {
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

        // Auto-guardado instantáneo en Modo Evento Masivo
        if (modoEventoCheck.checked && datosPersonalesInput.value && !datosPersonalesInput.value.includes("no reconocido")) {
            timeoutAutoGuardar = setTimeout(() => {
                btnRegistrar.click(); 
            }, 200); 
        }
    });
}

// --- CONMUTADOR DE MODO EVENTO ---
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
        escaneoRawInput.focus();
    });
}

// --- FUNCIÓN DE LIMPIEZA DE FORMULARIO ---
function limpiarFormulario() {
    if (escaneoRawInput) escaneoRawInput.value = '';
    if (datosPersonalesInput) datosPersonalesInput.value = '';
    if (!modoEventoCheck.checked) {
        if (empresaInput) empresaInput.value = '';
        if (sectorSelect) sectorSelect.value = '';
        if (anfitrionSelect) anfitrionSelect.innerHTML = '<option value="">Seleccione anfitrión...</option>';
    }
    document.getElementById('observaciones').value = '';
    if (escaneoRawInput) escaneoRawInput.focus();
}

if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFormulario);

// --- FUNCIÓN DE ESCANEO DESDE LA CÁMARA (Librería QR) ---
async function iniciarEscaneo() {
    if (html5QrCode.isScanning) {
        return;
    }
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
                if (datosPersonalesInput) {
                    datosPersonalesInput.value = decodedText;
                    // Forzamos los eventos para que se procese como una entrada
                    datosPersonalesInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                html5QrCode.stop().then(() => {
                    console.log("Escaneo de cámara finalizado");
                });
            },
            (errorMessage) => { /* Silenciar logs de búsqueda continua */ }
        );
    } catch (err) {
        alert("Error al acceder a la cámara. Revisa los permisos.");
    }
}

// --- ACCIÓN DEL BOTÓN REGISTRAR (CONEXIÓN DIRECTA CON SHEETDB) ---
if (btnRegistrar) {
    btnRegistrar.addEventListener('click', async () => {
        if (!datosPersonalesInput.value || !sectorSelect.value || !anfitrionSelect.value) {
            alert('Por favor, complete todos los campos obligatorios antes de registrar.');
            return;
        }

        const selectedOption = anfitrionSelect.options[anfitrionSelect.selectedIndex];
        const nroContacto = selectedOption ? selectedOption.dataset.contacto : '5492615320950';
        const observacionesTexto = document.getElementById('observaciones').value || 'Sin observaciones.';
        
        // Estructura limpia compatible con SheetDB. 
        // IMPORTANTE: Asegúrate de que la Fila 1 de tu Excel use exactamente estos mismos nombres de columna.
        const payload = {
            "data": [
                {
                    "Modo Evento": modoEventoCheck.checked ? "SÍ" : "NO",
                    "Tipo Ingreso": escaneoRawInput.value.includes('@') ? "DNI" : "QR",
                    "Escaneo Raw": escaneoRawInput.value || "CÁMARA",
                    "Datos Personales": datosPersonalesInput.value,
                    "Empresa": empresaInput.value || "VISITA",
                    "Sector": sectorSelect.value,
                    "Anfitrion": anfitrionSelect.value,
                    "Contacto Aviso": nroContacto,
                    "Observaciones": observacionesTexto,
                    "Fecha Hora": new Date().toLocaleString("es-AR")
                }
            ]
        };

        try {
            // Sincronización nativa con SheetDB (Evita problemas de CORS en el APK y en GitHub Pages)
            const response = await fetch(URL_API_SHEETDB, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("✅ Registro sincronizado en la hoja de cálculo con éxito.");

                // --- MENSAJE AUTOMÁTICO DE WHATSAPP ---
                const mensajeWP = `Nuevo ingreso Visita: ${datosPersonalesInput.value} | Empresa: ${empresaInput.value || "VISITA"} | Destino: ${sectorSelect.value} - Anfitrión: ${anfitrionSelect.value}`;
                
                // Dispara automáticamente el mensaje al número asociado al anfitrión en el maestro
                window.open(`https://wa.me/${nroContacto}?text=${encodeURIComponent(mensajeWP)}`, '_blank');

                limpiarFormulario();
            } else {
                alert("❌ El servidor de SheetDB rechazó los datos. Verifica los nombres de tus columnas.");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("❌ Error de comunicación. La aplicación no pudo enviar el registro.");
        }
    });
}

// Inicializar componentes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarSectores();
    if (escaneoRawInput) escaneoRawInput.focus();
});
cargarSectores();
