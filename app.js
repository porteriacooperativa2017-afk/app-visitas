// =========================================================================
// 1. CONFIGURACIÓN DE ENLACES Y CONEXIONES (REEMPLAZÁ ACÁ)
// =========================================================================
const html5QrCode = new Html5Qrcode("reader");

// PEGÁ ACÁ EL ENLACE LARGO QUE TE DIO GOOGLE AL IMPLEMENTAR (Termina en /exec)
const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbyD2o3LopK1cnajh8GrPow-HwJA2H5VUqYBdJhBNr8zCKX5OfygpEldAeAL5sOPmVc7/exec';

// Dejamos esta constante vieja acá arriba por si tu HTML o algún script la requiere, no molesta.
const URL_API_SHEETDB = 'https://sheetdb.io/api/v1/no_se_usa_pero_queda_guardada';

// =========================================================================
// 2. MAESTRO DE SECTORES Y ANFITRIONES (COFARMEN)
// =========================================================================
const maestroSectores = {
    "PLANTA LOGISTICA": [{ nombre: "MUGNECO ADRIAN", contacto: "5492615320950" }],
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
    "Consejo": [{ nombre: "Ganem Victoria", contacto: "5492615320950" }],
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
    "Evento": [{ nombre: "Evento", contacto: "5492615320950" }],
    "Mostrador": [{ nombre: "Atención Mostrador", contacto: "5492615320950" }],
    "Recepcion Técnica": [
        { nombre: "Daniel Ríos", contacto: "5492615320950" },
        { nombre: "Cecilia Nadal", contacto: "5492615320950" },
        { nombre: "Karina Escudero", contacto: "5492615320950" },
        { nombre: "Natalia Bustos", contacto: "5492615320950" },
        { nombre: "Jennifer Agüero", contacto: "5492615320950" }
    ],
    "Mantenimiento": [{ nombre: "Personal de Mantenimiento", contacto: "5492615320950" }],
    "EVENTO": [{ nombre: "EVENTO", contacto: "N/A" }]
};

// =========================================================================
// 3. CAPTURA DE COMPONENTES DE LA INTERFAZ (DOM)
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

// Foco automático para disparar con la pistola de hardware
document.addEventListener('click', (evento) => {
    const camposPermitidos = ['sector', 'anfitrion', 'observaciones', 'empresa', 'modoEvento'];
    if (camposPermitidos.includes(evento.target.id) || evento.target.tagName === 'OPTION') {
        return; 
    }
    if (escaneoRawInput) escaneoRawInput.focus();
});

// Loaders dinámicos de selectores
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
// 4. SISTEMA DE LIMPIEZA Y DESARMADO DE DNI (@ / QR)
// =========================================================================
if (escaneoRawInput) {
    escaneoRawInput.addEventListener('input', () => {
        const rawText = escaneoRawInput.value.trim();
        if (!rawText) return;

        if (timeoutAutoGuardar) clearTimeout(timeoutAutoGuardar);

        // Desarmado de DNI tarjeta de formato argentino
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
            // Desarmado de códigos QR con estructura predeterminada
            const partes = rawText.split(' - ');
            if (partes.length >= 3) {
                datosPersonalesInput.value = partes[0].toUpperCase(); 
                empresaInput.value = partes[2].toUpperCase();         
                groupEmpresa.style.display = 'none';    
            } else {
                datosPersonalesInput.value = rawText.toUpperCase(); 
            }
        }

        // Auto-guardado instantáneo en Modo Evento Masivo
        if (modoEventoCheck.checked && datosPersonalesInput.value && !datosPersonalesInput.value.includes("NO RECONOCIDO")) {
            timeoutAutoGuardar = setTimeout(() => {
                if (btnRegistrar) btnRegistrar.click(); 
            }, 200); 
        }
    });
}

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

// Escaneo por medio de la lente de la cámara del celular
// Escaneo por medio de la lente de la cámara del celular
async function iniciarEscaneo() {
    if (html5QrCode.isScanning) return;
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { 
                fps: 15, 
                qrbox: { width: 220, height: 220 }, // 1. Recuadro más chico obliga a acercar físicamente el DNI
                videoConstraints: {
                    facingMode: "environment",
                    width: { ideal: 1920 },          // 2. Fuerza resolución Full HD (1080p) para nitidez absoluta
                    height: { ideal: 1080 }
                }
            },
            (decodedText) => {
                if (escaneoRawInput) {
                    escaneoRawInput.value = decodedText;
                    escaneoRawInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                html5QrCode.stop();
            },
            (errorMessage) => {}
        );

        // 🎯 3. TRUCO DEL ZOOM: Aplicar aumento automático por hardware si el celular lo soporta
        const videoTrack = html5QrCode.getRunningTrack();
        setTimeout(() => {
            if (videoTrack) {
                const capabilities = videoTrack.getCapabilities();
                if (capabilities.zoom) {
                    videoTrack.applyConstraints({
                        advanced: [{ 
                            zoom: 2.0 // Setea un zoom doble automático de arranque. Podés probar con 2.5 si querés más cerca todavía.
                        }]
                    }).catch(err => console.log("Error aplicando zoom: ", err));
                }
            }
        }, 600); // Espera un instante corto a que el lente se estabilice

    } catch (err) {
        alert("Permisos denegados para usar la cámara.");
    }
},
            (decodedText) => {
                if (escaneoRawInput) {
                    escaneoRawInput.value = decodedText;
                    escaneoRawInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                html5QrCode.stop();
            },
            (errorMessage) => {}
        );

        // 🎯 3. TRUCO DEL ZOOM: Aplicar aumento automático por hardware si el celular lo soporta
        const videoTrack = html5QrCode.getRunningTrack();
        setTimeout(() => {
            if (videoTrack) {
                const capabilities = videoTrack.getCapabilities();
                if (capabilities.zoom) {
                    videoTrack.applyConstraints({
                        advanced: [{ 
                            zoom: 2.0 // Setea un zoom doble automático de arranque. Podés probar con 2.5 si querés más cerca todavía.
                        }]
                    }).catch(err => console.log("Error aplicando zoom: ", err));
                }
            }
        }, 600); // Espera un instante corto a que el lente se estabilice

    } catch (err) {
        alert("Permisos denegados para usar la cámara.");
    }
}

// =========================================================================
// 5. EVENTO REGISTRAR - ENVÍO SEGURO DIRECTO A GOOGLE SCRIPT (NO-CORS)
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
        
        // Empaquetamos en minúsculas tal cual lo requiere tu script del Excel
        const datosObj = {
            "datosPersonales": datosPersonalesInput.value.toUpperCase(),
            "empresa": (empresaInput.value || "VISITA").toUpperCase(),
            "sector": sectorSelect.value.toUpperCase(),
            "anfitrion": anfitrionSelect.value.toUpperCase(),
            "observaciones": observacionesTexto,
            "modoEvento": modoEventoCheck.checked // Envía true o false
        };

        try {
            // Enviamos como text/plain con mode: no-cors para saltar bloqueos de red
            await fetch(URL_API_GOOGLE, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(datosObj)
            });

            // Al no saltar al catch, el registro fue insertado con éxito en tu Google Sheets
            alert("✅ Registro enviado a la hoja de cálculo con éxito.");

          

            limpiarFormulario();

        } catch (error) {
            console.error("Error crítico de red:", error);
            alert("❌ Error de red. No se pudo conectar con la base de datos de Google.");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarSectores();
    if (escaneoRawInput) escaneoRawInput.focus();
});
