const html5QrCode = new Html5Qrcode("reader");

const URL_API_GOOGLE = 'https://script.google.com/macros/s/AKfycbyZOweDCad2gQ_pzn0rDuMg4EWbxow1x8RZos8M1JiaJt2Xe_hXVOnO5N07QyVn6NMZ/exec';

const maestroSectores = {
    "Mostrador": [{ nombre: "Retiro de vales", contacto: "N/A" }],
    "PLANTA LOGISTICA": [
        { nombre: "Mugneco Adrian", contacto: "5492615320950" },
        { nombre: "Carbajo Rodrigo", contacto: "5492615320950" },
        { nombre: "Di Lorenzo Diego", contacto: "5492615320950" }
    ],
    "CAPITAL HUMANO": [
        { nombre: "Fernández Rubén", contacto: "5492615320950" },
        { nombre: "Pablo Iacobucci", contacto: "5492614168508" },
        { nombre: "Tissera Mariana", contacto: "5492615320950" }
    ],
    "Administracion": [
        { nombre: "Martin Marcelo", contacto: "5492615320950" },
        { nombre: "Bustos Marcos", contacto: "5492615320950" },
        { nombre: "Videla Javier", contacto: "5492615320950" },
        { nombre: "Agüero Antonio", contacto: "5492615320950" },
        { nombre: "Velez Daniel", contacto: "N/A" }
    ],
    "Gerencia": [
        { nombre: "Funes Cristian", contacto: "5492615320950" },
        { nombre: "Pablo Iacobucci", contacto: "5492614168508" },
        { nombre: "Ganem Victoria", contacto: "54261551344" },
        { nombre: "Martin Marcelo", contacto: "5492615320950" }
    ],
    "Consejo": [{ nombre: "Ganem Victoria", contacto: "542615513444" }],
    "Funsad": [{ nombre: "Ganem Victoria", contacto: "54261551344" }],
    "Lobby": [
        { nombre: "Sanchez Alejandro", contacto: "5492615158389" },
        { nombre: "Ganem Victoria", contacto: "54261551344" },
        { nombre: "Escudero Carina", contacto: "5492615320950" }
    ],
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
        { nombre: "Perez Agustin", contacto: "5492615320950" }
    ],
    "Cajas": [
        { nombre: "Arce José", contacto: "5492615320950" },
        { nombre: "Ponce Matias", contacto: "5492615320950" }
    ],
    "Administración osep": [
        { nombre: "Pelayes Sergio", contacto: "5492615320950" },
        { nombre: "Oropel Walter", contacto: "5492615320950" },
        { nombre: "Garay Diego", contacto: "5492615320950" },
        { nombre: "Fernandez Jose Luis", contacto: "5492615320950" },
        { nombre: "Dominguez Diego", contacto: "5492615320950" },
        { nombre: "Peroso Vanesa", contacto: "5492615320950" }
    ],
    "Recepción Nave 1": [
        { nombre: "operario del sector", contacto: "N/A" }
    ],
    "Recepción Nave 2": [
        { nombre: "operario del sector", contacto: "N/A" }
    ],
    "Créditos": [
        { nombre: "Rovatti Dario", contacto: "5492615320950" },
        { nombre: "Agüero Rocio", contacto: "N/A" },
        { nombre: "Andreoni Anabela", contacto: "N/A" }
    ],
    "Sistemas": [
        { nombre: "Lujan Omar", contacto: "5492615320950" },
        { nombre: "Puebla Adrian", contacto: "5492615320950" },
        { nombre: "Placci Martin", contacto: "5492615320950" }
    ],
    "Devolución a Proveedor y/o donaciones": [
        { nombre: "Alvarez Cecilia", contacto: "5492615320950" }
    ],
    "Dirección Técnica": [
        { nombre: "Daniel Ríos", contacto: "5492615320950" },
        { nombre: "Cecilia Nadal", contacto: "5492615320950" },
        { nombre: "Carina Escudero", contacto: "5492615320950" },
        { nombre: "Natalia Bustos", contacto: "5492612128450" },
        { nombre: "Jennifer Agüero", contacto: "5492615320950" }
    ],
    "Mantenimiento": [
        { nombre: "Marsollier Ivan", contacto: "5492615320950" },
        { nombre: "Brizuela Tomas", contacto: "5492615320950" }
    ],
    "Guardia": [{ nombre: "Puesto 1", contacto: "5492615320950" }],
    "EVENTO": [{ nombre: "EVENTO", contacto: "N/A" }]
};

const escaneoRawInput = document.getElementById('escaneoRaw');
const datosPersonalesInput = document.getElementById('datosPersonales');
const empresaInput = document.getElementById('empresa');
const sectorSelect = document.getElementById('sector');
const anfitrionSelect = document.getElementById('anfitrion');
const selectModo = document.getElementById('selectModo');
const groupEmpresa = document.getElementById('groupEmpresa');
const groupBultos = document.getElementById('groupBultos');
const bultosInput = document.getElementById('bultos');
const groupAnfitrion = document.getElementById('groupAnfitrion');
const labelAnfitrion = document.getElementById('labelAnfitrion');
const btnRegistrar = document.getElementById('btnRegistrar');
const loadingOverlay = document.getElementById('loadingOverlay');
const scannerStatus = document.getElementById('scannerStatus');

let timeoutAutoGuardar = null;
let ultimoEscaneoEvento = '';
let momentoUltimoEscaneoEvento = 0;
const cacheEventoKey = 'qrU_evento_personas_registradas';
const personasEventoRegistradas = new Set(JSON.parse(sessionStorage.getItem(cacheEventoKey) || '[]'));
const cacheLoteEventoKey = 'qrU_evento_lote_pendiente';
const loteEventoPendiente = JSON.parse(sessionStorage.getItem(cacheLoteEventoKey) || '[]');

function obtenerClavePersona() {
    const datos = datosPersonalesInput.value.trim().toUpperCase();
    const dni = datos.match(/DNI\s*:\s*([0-9]+)/i);
    return dni ? `DNI:${dni[1]}` : `DATOS:${datos}`;
}

function guardarCacheEvento() {
    sessionStorage.setItem(cacheEventoKey, JSON.stringify([...personasEventoRegistradas]));
}

function informarDuplicadoEvento() {
    if (scannerStatus) scannerStatus.textContent = 'Persona ya registrada en este lote';
    limpiarFormulario();
}

function guardarLoteEvento() {
    sessionStorage.setItem(cacheLoteEventoKey, JSON.stringify(loteEventoPendiente));
    if (scannerStatus) scannerStatus.textContent = `${loteEventoPendiente.length} persona(s) en el lote pendiente`;
}

function agregarAlLoteEvento() {
    if (!datosPersonalesInput.value || datosPersonalesInput.value.includes('NO RECONOCIDO')) return;

    const clavePersona = obtenerClavePersona();
    if (personasEventoRegistradas.has(clavePersona)) {
        informarDuplicadoEvento();
        return;
    }

    const persona = {
        datosPersonales: datosPersonalesInput.value.toUpperCase(),
        empresa: 'EVENTO',
        sector: 'EVENTO',
        anfitrion: 'EVENTO',
        observaciones: 'SIN OBSERVACIONES',
        bultos: '',
        modo: 'evento',
        clavePersona
    };
    loteEventoPendiente.push(persona);
    personasEventoRegistradas.add(clavePersona);
    guardarCacheEvento();
    guardarLoteEvento();
    limpiarFormulario();
}

function mostrarCargando(mostrar) {
    if (loadingOverlay) {
        loadingOverlay.style.display = mostrar ? 'flex' : 'none';
    }
}

document.addEventListener('click', (evento) => {
    const camposPermitidos = ['sector', 'anfitrion', 'observaciones', 'empresa', 'selectModo', 'bultos'];
    if (camposPermitidos.includes(evento.target.id) || evento.target.tagName === 'OPTION') {
        return; 
    }
    if (escaneoRawInput) escaneoRawInput.focus();
});

function cargarSectores() {
    if (!sectorSelect) return;
    const modo = selectModo.value;
    sectorSelect.innerHTML = '<option value="">Seleccione un sector...</option>';
    
    if (modo === 'mercadolibre') {
        sectorSelect.innerHTML = '<option value="Guardia" selected>Guardia</option>';
        sectorSelect.dispatchEvent(new Event('change'));
        return;
    }

    Object.keys(maestroSectores).forEach(sector => {
        if (sector !== "EVENTO" || modo === 'evento') {
            let option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            sectorSelect.appendChild(option);
        }
    });
}

sectorSelect.addEventListener('change', (e) => {
    const sectorSeleccionado = e.target.value;
    const modo = selectModo.value;
    
    const sectoresSinAnfitrion = ["Mostrador", "Recepción Nave 1", "Recepción Nave 2"];
    if (modo === 'normal' && sectoresSinAnfitrion.includes(sectorSeleccionado)) {
        groupAnfitrion.style.display = 'none';
        anfitrionSelect.removeAttribute('required');
        anfitrionSelect.innerHTML = '<option value="N/A">N/A</option>';
        return;
    } else {
        groupAnfitrion.style.display = 'flex';
        anfitrionSelect.setAttribute('required', 'true');
    }

    anfitrionSelect.innerHTML = '<option value="">Seleccione anfitrión...</option>';
    if (sectorSeleccionado && maestroSectores[sectorSeleccionado]) {
        maestroSectores[sectorSeleccionado].forEach(anf => {
            let option = document.createElement('option');
            option.value = anf.nombre;
            option.textContent = anf.nombre;
            option.dataset.contacto = anf.contacto; 
            anfitrionSelect.appendChild(option);
        });
        if (maestroSectores[sectorSeleccionado].length === 1) {
            anfitrionSelect.selectedIndex = 1; 
        }
    }
});

selectModo.addEventListener('change', () => {
    const modo = selectModo.value;
    document.body.className = `modo-${modo}`;
    
    if (modo === 'mercadolibre') {
        groupBultos.style.display = 'flex';
        groupEmpresa.style.display = 'flex';
        labelAnfitrion.innerHTML = '<i class="fa-solid fa-user-tie"></i> Propietario';
        cargarSectores();
    } else if (modo === 'evento') {
        groupBultos.style.display = 'none';
        groupEmpresa.style.display = 'none';
        empresaInput.value = "EVENTO";
        cargarSectores();
        sectorSelect.value = "EVENTO";
        sectorSelect.dispatchEvent(new Event('change'));
        anfitrionSelect.value = "EVENTO";
        iniciarEscaneo();
    } else {
        groupBultos.style.display = 'none';
        groupEmpresa.style.display = 'flex';
        labelAnfitrion.innerHTML = '<i class="fa-solid fa-user-tie"></i> Anfitrión / Quien Recibe';
        limpiarFormulario();
        cargarSectores();
    }
    if (escaneoRawInput) escaneoRawInput.focus();
});

escaneoRawInput.addEventListener('input', () => {
    const rawText = escaneoRawInput.value.trim();
    if (!rawText) return;

    if (timeoutAutoGuardar) clearTimeout(timeoutAutoGuardar);

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
        if (selectModo.value !== 'evento' && selectModo.value !== 'mercadolibre') {
            groupEmpresa.style.display = 'flex';
            empresaInput.value = '';
            empresaInput.focus();
        }
    } else {
        const partes = rawText.split(' - ');
        if (partes.length >= 3) {
            datosPersonalesInput.value = partes[0].toUpperCase(); 
            if (selectModo.value !== 'evento' && selectModo.value !== 'mercadolibre') {
                empresaInput.value = partes[2].toUpperCase();         
                groupEmpresa.style.display = 'flex';
            }
        } else {
            datosPersonalesInput.value = rawText.toUpperCase(); 
        }
    }

    if (selectModo.value === 'evento' && datosPersonalesInput.value && !datosPersonalesInput.value.includes("NO RECONOCIDO")) {
        // Espera a que el lector termine y guarda la persona en el lote.
        timeoutAutoGuardar = setTimeout(() => {
            agregarAlLoteEvento();
        }, 700); 
    }
});

function limpiarFormulario() {
    if (escaneoRawInput) escaneoRawInput.value = '';
    if (datosPersonalesInput) datosPersonalesInput.value = '';
    const modo = selectModo.value;
    if (modo !== 'mercadolibre' && modo !== 'evento') {
        if (empresaInput) empresaInput.value = '';
        if (sectorSelect) sectorSelect.value = '';
        if (anfitrionSelect) anfitrionSelect.innerHTML = '<option value="">Seleccione anfitrión...</option>';
    } else if (modo === 'mercadolibre') {
        if (empresaInput) empresaInput.value = '';
        if (sectorSelect) sectorSelect.value = 'Guardia';
        if (anfitrionSelect) anfitrionSelect.innerHTML = '<option value="">Seleccione propietario...</option>';
    } else {
        if (empresaInput) empresaInput.value = 'EVENTO';
        if (sectorSelect) sectorSelect.value = 'EVENTO';
        if (anfitrionSelect) anfitrionSelect.innerHTML = '<option value="EVENTO">EVENTO</option>';
    }
    if (bultosInput) bultosInput.value = '1';
    const obsField = document.getElementById('observaciones');
    if (obsField) obsField.value = '';
    if (escaneoRawInput) escaneoRawInput.focus();
}

async function iniciarEscaneo() {
    if (html5QrCode.isScanning) return;
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { 
                fps: 20, 
                qrbox: { width: 240, height: 240 }, 
                videoConstraints: {
                    facingMode: "environment",
                    width: { min: 640, ideal: 1280 },
                    height: { min: 480, ideal: 720 }
                }
            },
            (decodedText) => {
                if (selectModo.value === 'evento') {
                    const ahora = Date.now();
                    if (decodedText === ultimoEscaneoEvento && ahora - momentoUltimoEscaneoEvento < 2000) return;
                    ultimoEscaneoEvento = decodedText;
                    momentoUltimoEscaneoEvento = ahora;
                }
                if (escaneoRawInput) {
                    escaneoRawInput.value = decodedText;
                    escaneoRawInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (selectModo.value !== 'evento') html5QrCode.stop();
            },
            (errorMessage) => {}
        );
    } catch (err) {
        console.log("Aviso de inicio de cámara: ", err);
    }
}

btnRegistrar.addEventListener('click', async () => {
    const modo = selectModo.value;

    if (modo === 'evento') {
        if (!loteEventoPendiente.length) {
            alert('Todavía no hay personas pendientes en el lote.');
            return;
        }

        mostrarCargando(true);
        try {
            await Promise.all(loteEventoPendiente.map(datosObj => fetch(URL_API_GOOGLE, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(datosObj)
            })));
            loteEventoPendiente.length = 0;
            guardarLoteEvento();
            mostrarCargando(false);
            alert('✅ Lote enviado a la hoja de cálculo con éxito.');
            limpiarFormulario();
        } catch (error) {
            mostrarCargando(false);
            alert('❌ Error de red. El lote sigue pendiente para reintentar.');
            console.error('Error al enviar el lote de evento:', error);
        }
        return;
    }

    const requiereAnfitrion = groupAnfitrion.style.display !== 'none';

    if (!datosPersonalesInput.value || !sectorSelect.value || (requiereAnfitrion && !anfitrionSelect.value)) {
        alert('Por favor, complete los campos obligatorios antes de registrar.');
        return;
    }

    mostrarCargando(true);

    const selectedOption = anfitrionSelect.options[anfitrionSelect.selectedIndex];
    const nroContacto = selectedOption ? selectedOption.dataset.contacto : '5492615320950';
    const empresaVal = modo === 'evento' ? 'EVENTO' : (modo === 'mercadolibre' ? (empresaInput.value || 'MERCADO LIBRE') : (empresaInput.value || 'VISITA'));
    const obsElement = document.getElementById('observaciones');
    const observacionesTexto = obsElement && obsElement.value ? obsElement.value.toUpperCase() : 'SIN OBSERVACIONES';
    const cantidadBultos = modo === 'mercadolibre' ? (bultosInput.value || '1') : '';
    
    const datosObj = {
        "datosPersonales": datosPersonalesInput.value.toUpperCase(),
        "empresa": empresaVal.toUpperCase(),
        "sector": sectorSelect.value.toUpperCase(),
        "anfitrion": anfitrionSelect.value.toUpperCase(),
        "observaciones": observacionesTexto,
        "bultos": cantidadBultos,
        "modo": modo
    };

    try {
        await Promise.all([
            fetch(URL_API_GOOGLE, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(datosObj)
            }),
            new Promise(resolve => setTimeout(resolve, 900))
        ]);

        mostrarCargando(false);
        alert("✅ Registro enviado a la hoja de cálculo con éxito.");

        let mensajeWhatsApp = "";
        const nombreAnfitrion = anfitrionSelect.value;
        const nombreVisita = datosPersonalesInput.value;

        if (modo === 'normal') {
            mensajeWhatsApp = `👋 *Estimado/a ${nombreAnfitrion}:*\n\n🔔 Se anunció una nueva visita para usted.\n\n👤 *Visitante:* ${nombreVisita}\n🏢 *Empresa:* ${empresaVal}\n\n🛂 La persona se encuentra en la guardia, aguardando su autorización para ingresar.\n\n✅ Cuando pueda, por favor confirme cómo proceder.\n\n_Atentamente,_\n_*Control de Accesos COFARMEN*_`;
        } else if (modo === 'mercadolibre') {
            mensajeWhatsApp = `📦 *Señor/a ${nombreAnfitrion}:*\n\n🔔 Tiene un envío de la empresa *${empresaVal}* para ser retirado en la guardia.\n\n📦 *Cantidad de bultos:* ${cantidadBultos}\n📍 *Lugar de retiro:* Guardia\n\n✅ Cuando pueda, por favor acérquese a retirarlo.\n\n_Atentamente,_\n_*Control de Accesos COFARMEN*_`;
        }

        if (mensajeWhatsApp && nroContacto && nroContacto !== 'N/A') {
            const urlWa = `https://api.whatsapp.com/send?phone=${nroContacto}&text=${encodeURIComponent(mensajeWhatsApp)}`;
            window.open(urlWa, '_blank');
        }

        limpiarFormulario();

    } catch (error) {
        mostrarCargando(false);
        console.error("Error crítico de red:", error);
        alert("❌ Error de red. No se pudo conectar con la base de datos de Google.");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    cargarSectores();
    if (escaneoRawInput) escaneoRawInput.focus();
});
