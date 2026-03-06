/* =========================================================================
   1. VARIABLES GLOBALES Y UTILIDADES
   ========================================================================= */
let turnoABorrarId = null;
let modalFormTurnoInstance = null;
let modalBorrarTurnoInstance = null;
let funcionarioAborrarId = null;
let seccionABorrarId = null;
let fechaActualVisualizacion = new Date(2026, 2, 1); // Marzo 2026 (Para pruebas)
const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* =========================================================================
   2. FUNCIÓN GLOBAL: MOSTRAR NOTIFICACIÓN (TOASTS ELEGANTES)
   ========================================================================= */
function mostrarNotificacion(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container-yb');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-yb';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-4';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const config = {
        success: { bg: 'bg-success', icon: 'bi-check-circle-fill', text: 'text-white', close: 'btn-close-white' },
        error:   { bg: 'bg-danger',  icon: 'bi-x-circle-fill', text: 'text-white', close: 'btn-close-white' },
        warning: { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill', text: 'text-dark', close: '' },
        info:    { bg: 'bg-primary', icon: 'bi-info-circle-fill', text: 'text-white', close: 'btn-close-white' },
        delete:  { bg: 'bg-danger',  icon: 'bi-trash-fill', text: 'text-white', close: 'btn-close-white' } 
    };

    const current = config[tipo] || config.success;

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 shadow-lg mb-3 rounded-3 ${current.bg} ${current.text}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex p-1">
            <div class="toast-body fw-bold fs-6 py-2">
                <i class="bi ${current.icon} me-2 fs-5 align-middle"></i> ${mensaje}
            </div>
            <button type="button" class="btn-close ${current.close} me-3 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    container.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/* =========================================================================
   3. INICIALIZACIÓN DEL DOCUMENTO (DOM Ready)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

    // Alerta de Login Exitoso
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        mostrarNotificacion("¡Inicio de sesión exitoso! Bienvenido.", "success");
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (document.getElementById('dash-total-func')) cargarEstadisticasDashboard();

    const formLogin = document.getElementById("form_login");
    if (formLogin) formLogin.addEventListener("submit", procesarLogin);

    const selectTurno = document.getElementById('enrolar_turno');
    const selectSeccion = document.getElementById('enrolar_seccion');
    if (selectTurno) cargarSelectTurnosEnrolar();
    if (selectSeccion) cargarSelectSeccionesEnrolar();

    const formEnrolar = document.getElementById('form-enrolar');
    if (formEnrolar) {
        formEnrolar.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') { event.preventDefault(); guardarNuevoFuncionario(); }
        });
    }

    if (document.getElementById('tabla-usuarios')) cargarListaUsuarios();

    const formModalEl = document.getElementById('modalFormTurno');
    if (formModalEl) modalFormTurnoInstance = new bootstrap.Modal(formModalEl);

    const borrarModalEl = document.getElementById('modalBorrarTurno');
    if (borrarModalEl) modalBorrarTurnoInstance = new bootstrap.Modal(borrarModalEl);

    const inputEntrada = document.getElementById('turno_entrada');
    const inputSalida = document.getElementById('turno_salida');
    if (inputEntrada && inputSalida) {
        inputEntrada.addEventListener('change', calcularTiempoJornadaFormulario);
        inputSalida.addEventListener('change', calcularTiempoJornadaFormulario);
    }

    const contenedorTurnos = document.getElementById('contenedor-turnos');
    if (contenedorTurnos) cargarTarjetasTurnos();

    const formTurno = document.getElementById('formTurno');
    if (formTurno) {
        formTurno.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') { event.preventDefault(); guardarTurno(); }
        });
    }

    const contenedorFuncionarios = document.getElementById('contenedor-funcionarios');
    if (contenedorFuncionarios) cargarListaFuncionarios();

    const contenedorSecciones = document.getElementById('contenedor-secciones');
    if (contenedorSecciones) cargarListaSecciones();

    const formSeccion = document.getElementById('formSeccion');
    if (formSeccion) {
        formSeccion.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') { event.preventDefault(); guardarSeccion(); }
        });
    }
});

/* =========================================================================
   MÓDULO 1: LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("usuario").value.trim();
    const passVal = document.getElementById("password").value;

    if (!userVal || !passVal) {
        mostrarNotificacion("Por favor, ingresa tu usuario y contraseña.", "warning");
        return;
    }

    try {
        const vuser = await validUser(userVal, passVal);
        if (vuser.status === 1 && vuser.data && vuser.data.status === 1) {
            const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();
            if (rolUsuario === 'superadmin' || rolUsuario === 'admin' || rolUsuario === 'administrador') {
                window.location.href = "VistaInicio.php?login=success";
            } else {
                window.location.href = "VistaEscaner.php?login=success";
            }
        } else {
            const mensajeFallo = vuser.data ? vuser.data.message : (vuser.message || "Credenciales incorrectas.");
            mostrarNotificacion(mensajeFallo, "error");
            document.getElementById("password").value = '';
        }
    } catch (error) {
        mostrarNotificacion("Error al conectar con el servidor.", "error");
    }
}

/* =========================================================================
   MÓDULO 2: TURNOS (CRUD)
   ========================================================================= */
async function cargarTarjetasTurnos() {
    const contenedor = document.getElementById('contenedor-turnos');
    if (!contenedor) return;

    const respuesta = await apiTurnos.getTurnos();
    contenedor.innerHTML = '';

    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        respuesta.data.forEach(turno => {
            const total = calcularHorasUI(turno.hora_entrada, turno.hora_salida);
            contenedor.innerHTML += `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card bg-white border-0 shadow-sm card-turno h-100">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="icon-turno me-3"><i class="bi bi-clock-fill text-primary fs-3"></i></div>
                                    <div>
                                        <h5 class="fw-bold text-black mb-0">${turno.nombre}</h5>
                                        <span class="badge bg-light text-dark border">ID: ${turno.IDturno}</span>
                                    </div>
                                </div>
                            </div>
                            <hr class="text-muted">
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Entrada</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_entrada.substring(0, 5)} hrs</span>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Salida</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_salida.substring(0, 5)} hrs</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                                <small class="text-muted fw-semibold"><i class="bi bi-stopwatch me-1"></i> Total:</small>
                                <span class="fw-bold text-black">${total.horas} hrs ${total.minutos} mins</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-grow-1 fw-bold" onclick="editarTurno(${turno.IDturno}, '${turno.nombre}', '${turno.hora_entrada}', '${turno.hora_salida}')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarTurno(${turno.IDturno})"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        });
    } else {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center fw-bold shadow-sm border-0"><i class="bi bi-exclamation-circle me-2"></i> No hay turnos registrados en la base de datos.</div></div>`;
    }
}

function abrirModalTurno() {
    const modalEl = document.getElementById('modalFormTurno');
    if (!modalEl) return;
    if (document.getElementById('formTurno')) document.getElementById('formTurno').reset();
    if (document.getElementById('turno_id')) document.getElementById('turno_id').value = '';
    if (document.getElementById('tituloModalTurno')) document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-clock-history me-2"></i> Registrar Nuevo Turno';
    const alerta = document.getElementById('alerta-calculo');
    if (alerta) {
        alerta.innerHTML = '<i class="bi bi-info-circle-fill me-2 fs-5"></i><span>Complete las horas.</span>';
        alerta.className = "alert alert-info py-2 small d-flex align-items-center mb-0";
    }
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function editarTurno(id, nombre, entrada, salida) {
    document.getElementById('turno_id').value = id;
    document.getElementById('turno_nombre').value = nombre;
    document.getElementById('turno_entrada').value = entrada.substring(0, 5);
    document.getElementById('turno_salida').value = salida.substring(0, 5);
    document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Turno';
    calcularTiempoJornadaFormulario();
    modalFormTurnoInstance.show();
}

async function guardarTurno() {
    const id = document.getElementById('turno_id').value;
    const nombre = document.getElementById('turno_nombre').value;
    const hora_entrada = document.getElementById('turno_entrada').value;
    const hora_salida = document.getElementById('turno_salida').value;

    if (!nombre || !hora_entrada || !hora_salida) {
        mostrarNotificacion("Por favor completa todos los campos del turno.", "warning"); return;
    }
    const datos = { nombre, hora_entrada, hora_salida };
    let respuesta;
    if (id) { datos.id = id; respuesta = await apiTurnos.updateTurno(datos); } 
    else { respuesta = await apiTurnos.createTurno(datos); }

    if (respuesta.status === 1) {
        mostrarNotificacion(id ? "Turno actualizado exitosamente." : "Turno creado exitosamente.", "success");
        modalFormTurnoInstance.hide();
        cargarTarjetasTurnos();
    } else {
        mostrarNotificacion("Error: " + respuesta.message, "error");
    }
}

function confirmarBorrarTurno(id) {
    turnoABorrarId = id;
    modalBorrarTurnoInstance.show();
}

async function ejecutarBorrarTurno() {
    if (turnoABorrarId) {
        const respuesta = await apiTurnos.deleteTurno(turnoABorrarId);
        if (respuesta.status === 1) {
            mostrarNotificacion("Turno eliminado correctamente.", "delete");
            modalBorrarTurnoInstance.hide();
            cargarTarjetasTurnos();
        } else {
            mostrarNotificacion(respuesta.message, "error");
        }
    }
}

function calcularTiempoJornadaFormulario() {
    const entradaVal = document.getElementById('turno_entrada').value;
    const salidaVal = document.getElementById('turno_salida').value;
    const alertaCalculo = document.getElementById('alerta-calculo');
    if (entradaVal && salidaVal) {
        const total = calcularHorasUI(entradaVal, salidaVal);
        alertaCalculo.innerHTML = `<strong>Total Jornada:</strong>&nbsp; ${total.horas} horas y ${total.minutos} minutos.`;
        alertaCalculo.className = "alert alert-success py-2 small d-flex align-items-center mb-0";
    }
}

function calcularHorasUI(entradaVal, salidaVal) {
    const fechaEntrada = new Date(`2000-01-01T${entradaVal}`);
    let fechaSalida = new Date(`2000-01-01T${salidaVal}`);
    if (fechaSalida < fechaEntrada) { fechaSalida.setDate(fechaSalida.getDate() + 1); }
    const diferenciaMs = fechaSalida - fechaEntrada;
    return { horas: Math.floor(diferenciaMs / (1000 * 60 * 60)), minutos: Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60)) };
}

/* =========================================================================
   MÓDULO 3: ENROLAMIENTO
   ========================================================================= */
function generarCodigoAutomatico() {
    const rutInput = document.getElementById('enrolar_rut');
    if (!rutInput) return;
    const inputCodigo = document.getElementById('enrolar_codigo');
    const svgBarcode = document.getElementById('barcode');
    const placeholder = document.getElementById('barcode-placeholder');

    if (rutInput.value.trim() === '') {
        inputCodigo.value = ''; inputCodigo.dataset.sufijo = '';
        svgBarcode.style.display = 'none'; placeholder.style.display = 'block';
        return;
    }

    let rutLimpio = rutInput.value.replace(/[^0-9kK]/gi, '');
    if (rutLimpio.length > 2) {
        if (!inputCodigo.dataset.sufijo) { inputCodigo.dataset.sufijo = Math.floor(10000 + Math.random() * 90000); }
        let codigoFinal = rutLimpio + inputCodigo.dataset.sufijo;
        inputCodigo.value = codigoFinal;
        if (typeof JsBarcode !== 'undefined') {
            JsBarcode("#barcode", codigoFinal, { format: "CODE128", lineColor: "#212529", width: 2, height: 70, displayValue: false, margin: 0 });
        }
        placeholder.style.display = 'none';
        svgBarcode.style.display = 'block';
    }
}

async function guardarNuevoFuncionario() {
    const rut = document.getElementById('enrolar_rut').value.trim();
    const nombres = document.getElementById('enrolar_nombres').value.trim();
    const ap_paterno = document.getElementById('enrolar_ap_paterno').value.trim();
    const ap_materno = document.getElementById('enrolar_ap_materno').value.trim();
    const seccion = document.getElementById('enrolar_seccion').value;
    const turno = document.getElementById('enrolar_turno').value;
    const codigo = document.getElementById('enrolar_codigo').value;

    if (!rut || !nombres || !ap_paterno || !seccion || !turno || !codigo) {
        mostrarNotificacion("Por favor, completa todos los campos obligatorios.", "warning"); return;
    }
    const datos = { rut, nombre: nombres, apellidoP: ap_paterno, apellidoM: ap_materno, seccion, turno, codigo_tarjeta: codigo };
    const respuesta = await apiFuncionarios.createFuncionario(datos);

    if (respuesta.status === 1) {
        mostrarNotificacion("¡Funcionario enrolado con éxito!", "success");
        document.getElementById('form-enrolar').reset();
        document.getElementById('enrolar_codigo').value = '';
        document.getElementById('enrolar_codigo').dataset.sufijo = '';
        document.getElementById('barcode-placeholder').style.display = 'block';
        document.getElementById('barcode').style.display = 'none';
    } else {
        mostrarNotificacion("Error al enrolar: " + respuesta.message, "error");
    }
}

async function cargarSelectTurnosEnrolar() {
    const select = document.getElementById('enrolar_turno');
    if (!select) return;
    const respuesta = await apiTurnos.getTurnos();
    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        select.innerHTML = '<option value="" selected disabled>Seleccione un turno...</option>';
        respuesta.data.forEach(turno => {
            select.innerHTML += `<option value="${turno.IDturno}">${turno.nombre} (${turno.hora_entrada.substring(0, 5)} a ${turno.hora_salida.substring(0, 5)})</option>`;
        });
    } else { select.innerHTML = '<option value="" selected disabled>No hay turnos creados</option>'; }
}

async function cargarSelectSeccionesEnrolar() {
    const select = document.getElementById('enrolar_seccion');
    if (!select) return;
    const respuesta = await apiSecciones.getSecciones();
    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        select.innerHTML = '<option value="" selected disabled>Seleccione una sección...</option>';
        respuesta.data.forEach(sec => { select.innerHTML += `<option value="${sec.id}">${sec.nombre}</option>`; });
    } else { select.innerHTML = '<option value="" selected disabled>No hay secciones creadas</option>'; }
}

/* =========================================================================
   MÓDULO 4: FUNCIONARIOS Y ASISTENCIA (RESPONSIVE Y ESTÉTICO)
   ========================================================================= */
async function cargarListaFuncionarios() {
    const contenedor = document.getElementById('contenedor-funcionarios');
    if (!contenedor) return;

    try {
        const res = await apiFuncionarios.getFuncionarios();
        const resSecciones = await apiSecciones.getSecciones();
        const resTurnos = await apiTurnos.getTurnos();
        contenedor.innerHTML = '';

        if (res.status === 1 && res.data && res.data.length > 0) {
            res.data.forEach(f => {
                const safeId = f.rut.replace(/[^a-zA-Z0-9]/g, '');
                const colId = `edit-func-${safeId}`;

                const textoSeccion = f.nombre_seccion || 'Sin Sección';
                const textoTurno = f.nombre_turno || 'Sin Turno';

                let opcionesSecciones = `<option value="">Seleccione...</option>`;
                if (resSecciones.status === 1) {
                    resSecciones.data.forEach(s => {
                        const sel = (s.id == f.IDseccion) ? 'selected' : '';
                        opcionesSecciones += `<option value="${s.id}" ${sel}>${s.nombre}</option>`;
                    });
                }

                let opcionesTurnos = `<option value="">Seleccione...</option>`;
                if (resTurnos.status === 1) {
                    resTurnos.data.forEach(t => {
                        const sel = (t.IDturno == f.IDturno) ? 'selected' : '';
                        opcionesTurnos += `<option value="${t.IDturno}" ${sel}>${t.nombre}</option>`;
                    });
                }

                contenedor.innerHTML += `
                <div class="list-group-item p-0 funcionario-item border-start-danger shadow-sm mb-2 rounded">
                    <div class="row m-0 align-items-center py-3 px-3 bg-white fila-visible cursor-pointer" onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'calendario', event)">
                        <div class="col-12 col-lg-2 ps-lg-3 mb-2 mb-lg-0 fw-semibold text-muted font-monospace">${f.rut}</div>
                        <div class="col-12 col-lg-3 mb-2 mb-lg-0 text-black fw-bold text-truncate"><i class="bi bi-person-circle me-2 text-secondary"></i>${f.nombre} ${f.apellidoP}</div>
                        <div class="col-6 col-lg-3 text-truncate text-muted d-none d-md-block">${textoSeccion}</div>
                        <div class="col-6 col-lg-2 d-none d-md-block"><span class="badge bg-light text-dark border px-2 py-1"><i class="bi bi-clock me-1"></i>${textoTurno}</span></div>
                        <div class="col-12 col-lg-2 text-end mt-3 mt-lg-0 pe-lg-3">
                            <button class="btn btn-sm btn-outline-primary shadow-sm py-1 px-2 me-2 fw-bold" title="Editar" onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'editar', event)">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger shadow-sm py-1 px-2" title="Eliminar" onclick="event.stopPropagation(); confirmarBorradoFuncionario('${f.rut}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="${colId}" class="collapse panel-desplegado border-top border-bottom border-2 border-danger" data-bs-parent="#contenedor-funcionarios">
                        <div class="p-3 p-md-4 p-xl-5">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h4 class="fw-bold text-black mb-0 fs-5 fs-md-4"><i class="bi bi-person-vcard me-2 text-danger-yb"></i> Panel del Funcionario</h4>
                                <button type="button" class="btn-close" aria-label="Close" onclick="cerrarPanelFuncionario('${safeId}', event)"></button>
                            </div>
                            <div class="row g-4 align-items-stretch">
                                <div id="col-form-${safeId}" class="col-12 col-xl-4">
                                    <div class="card border-0 shadow-sm rounded-4 h-100">
                                        <div class="card-body p-4 d-flex flex-column h-100">
                                            <h5 class="fw-bold mb-4 text-blue-yb border-bottom pb-3"><i class="bi bi-pencil-square me-2"></i> Editar Información</h5>
                                            <form class="d-flex flex-column flex-grow-1">
                                                <div class="mb-3">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">Nombres</label>
                                                    <input type="text" class="form-control" id="edit_nom_${f.rut}" value="${f.nombre}">
                                                </div>
                                                <div class="row mb-3 g-2">
                                                    <div class="col-6">
                                                        <label class="form-label small fw-bold text-muted text-uppercase">Ap. Paterno</label>
                                                        <input type="text" class="form-control" id="edit_ap_${f.rut}" value="${f.apellidoP}">
                                                    </div>
                                                    <div class="col-6">
                                                        <label class="form-label small fw-bold text-muted text-uppercase">Ap. Materno</label>
                                                        <input type="text" class="form-control" id="edit_am_${f.rut}" value="${f.apellidoM || ''}">
                                                    </div>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">Sección</label>
                                                    <select class="form-select" id="edit_depto_${f.rut}">${opcionesSecciones}</select>
                                                </div>
                                                <div class="mb-4">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">Turno</label>
                                                    <select class="form-select" id="edit_turno_${f.rut}">${opcionesTurnos}</select>
                                                </div>
                                                <div class="mt-auto pt-3">
                                                    <button type="button" class="btn btn-primary fw-bold w-100 py-3 shadow-sm" style="background-color: var(--yb-blue); border-color: var(--yb-blue);" onclick="guardarEdicionFuncionario('${f.rut}')">
                                                        <i class="bi bi-save me-2"></i> Guardar Cambios
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div id="col-cal-${safeId}" class="col-12 col-xl-8">
                                    <div class="card border-0 shadow-sm rounded-4 h-100">
                                        <div class="card-body p-4 d-flex flex-column h-100">
                                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
                                                <h5 class="fw-bold mb-0 text-blue-yb"><i class="bi bi-calendar-check me-2"></i> Registro de Asistencia</h5>
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-light rounded p-1 d-flex align-items-center border">
                                                        <button class="btn btn-sm btn-white border-0 fw-bold" onclick="cambiarMes(-1, '${safeId}', '${f.rut}')"><i class="bi bi-chevron-left"></i></button>
                                                        <span id="mes-anio-${safeId}" class="fw-bold text-uppercase px-3 text-center" style="min-width: 140px;"></span>
                                                        <button class="btn btn-sm btn-white border-0 fw-bold" onclick="cambiarMes(1, '${safeId}', '${f.rut}')"><i class="bi bi-chevron-right"></i></button>
                                                    </div>
                                                    <button class="btn btn-outline-danger fw-bold shadow-sm px-3 py-1" style="height: 36px;" title="Descargar Reporte" onclick="generarReporteMensual('${f.rut}')">
                                                        <i class="bi bi-file-pdf-fill fs-5"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div id="calendario-simple-${safeId}" class="flex-grow-1 d-flex flex-column justify-content-center"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            contenedor.innerHTML = '<div class="alert alert-warning text-center fw-bold shadow-sm p-4 m-3 fs-5">No hay funcionarios registrados.</div>';
        }
    } catch (error) { console.error("Error cargando lista:", error); }
}

async function abrirPanelFuncionario(safeId, rutReal, modo, event) {
    if (event) event.stopPropagation();
    const collapseEl = document.getElementById(`edit-func-${safeId}`);
    const formCol = document.getElementById(`col-form-${safeId}`);
    const calCol = document.getElementById(`col-cal-${safeId}`);
    if(!formCol || !calCol) return; 

    if (modo === 'calendario') {
        formCol.style.display = 'none'; calCol.className = 'col-12';
    } else {
        formCol.style.display = 'block'; calCol.className = 'col-12 col-xl-8';
    }

    await cargarDatosYDibujarCalendario(safeId, rutReal, fechaActualVisualizacion);
    const bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl, { toggle: false });
    const modoActual = collapseEl.getAttribute('data-modo-actual');
    
    if (collapseEl.classList.contains('show') && modoActual === modo) {
        bsCollapse.hide(); collapseEl.removeAttribute('data-modo-actual');
    } else {
        bsCollapse.show(); collapseEl.setAttribute('data-modo-actual', modo);
    }
}

function cerrarPanelFuncionario(safeId, event) {
    if (event) event.stopPropagation();
    const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById(`edit-func-${safeId}`));
    if (bsCollapse) {
        bsCollapse.hide();
        document.getElementById(`edit-func-${safeId}`).removeAttribute('data-modo-actual');
    }
}

async function cambiarMes(direccion, safeId, rutReal) {
    fechaActualVisualizacion.setMonth(fechaActualVisualizacion.getMonth() + direccion);
    await cargarDatosYDibujarCalendario(safeId, rutReal, fechaActualVisualizacion);
}

async function cargarDatosYDibujarCalendario(safeId, rutReal, fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1; 
    const contenedor = document.getElementById(`calendario-simple-${safeId}`);
    if (contenedor) contenedor.innerHTML = '<div class="text-center py-5 my-5"><div class="spinner-border text-danger-yb" role="status"></div><p class="mt-2 text-muted fw-bold">Consultando asistencia...</p></div>';

    try {
        const req = await fetch(`../../controller/asistencia_controller.php?action=getAsistencia&rut=${rutReal}&mes=${mes}&anio=${año}`);
        const res = await req.json();
        const datosMes = res.status === 1 ? res.data : {};
        dibujarCalendarioSimple(safeId, rutReal, fecha, datosMes);
    } catch(e) {
        console.error("Error al cargar Calendario:", e);
        dibujarCalendarioSimple(safeId, rutReal, fecha, {}); 
    }
}

function dibujarCalendarioSimple(safeId, rutReal, fecha, datosMes) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const mesAnioElemento = document.getElementById(`mes-anio-${safeId}`);
    if (mesAnioElemento) mesAnioElemento.innerText = `${nombresMeses[mes]} ${año}`;
    const contenedor = document.getElementById(`calendario-simple-${safeId}`);
    if (!contenedor) return;

    const totalDiasMes = new Date(año, mes + 1, 0).getDate();
    const primerDiaSemana = new Date(año, mes, 1).getDay();
    let totalMinutosMes = 0;

    let htmlCalendario = `
        <div class="d-grid mb-1 text-center small" style="grid-template-columns: repeat(7, 1fr); gap: 6px;">
            <div class="fw-bolder text-danger">Do</div><div class="fw-bolder text-secondary">Lu</div>
            <div class="fw-bolder text-secondary">Ma</div><div class="fw-bolder text-secondary">Mi</div>
            <div class="fw-bolder text-secondary">Ju</div><div class="fw-bolder text-secondary">Vi</div>
            <div class="fw-bolder text-danger">Sá</div>
        </div>
        <div class="d-grid" style="grid-template-columns: repeat(7, 1fr); gap: 6px;">
    `;

    for (let i = 0; i < primerDiaSemana; i++) {
        htmlCalendario += `<div class="cal-day-box border-0" style="background: transparent; cursor: default;"></div>`;
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        const infoDia = datosMes[dia]; 
        let bgClass = 'cal-day-empty'; 
        let contenidoCelda = `<div class="fw-bold text-center w-100 h-100 d-flex justify-content-center align-items-center numero-calendario">${dia}</div>`;

        if (infoDia) {
            bgClass = infoDia.estado === 'verde' ? 'cal-day-success' : 'cal-day-warning';
            totalMinutosMes += infoDia.minutos_totales || 0;
            let badgeExtra = '';
            if (infoDia.extra !== '00:00') {
                let colorExtra = infoDia.tipo_extra === 'Nocturna' ? 'bg-dark' : 'bg-primary';
                badgeExtra = `<div class="mt-1"><span class="badge ${colorExtra} w-100" style="font-size:0.6rem;">+${infoDia.extra}</span></div>`;
            }
            contenidoCelda = `
                <div class="p-1 p-md-2 w-100 d-flex flex-column h-100 text-start texto-calendario" style="font-size: 0.75rem;">
                    <div class="fw-bold text-end mb-1 numero-calendario fs-6">${dia}</div>
                    <div class="d-flex justify-content-between text-muted fw-semibold"><span>E:</span> <span class="text-dark">${infoDia.entrada}</span></div>
                    <div class="d-flex justify-content-between text-muted fw-semibold mb-1"><span>S:</span> <span class="text-dark">${infoDia.salida}</span></div>
                    ${badgeExtra}
                </div>
            `;
        }
        htmlCalendario += `<div class="cal-day-box rounded-3 ${bgClass}" style="min-height: 85px;" title="Día ${dia}">${contenidoCelda}</div>`;
    }
    htmlCalendario += `</div>`;

    let totalHrs = Math.floor(totalMinutosMes / 60);
    let totalMins = totalMinutosMes % 60;
    htmlCalendario += `
        <div class="alert alert-secondary mt-auto mb-0 py-2 d-flex flex-column flex-md-row justify-content-between align-items-md-center fw-bold shadow-sm border-0 mt-4">
            <span class="mb-2 mb-md-0"><i class="bi bi-clock-history me-2"></i>Total Horas ${nombresMeses[mes]}:</span>
            <span class="text-danger-yb fs-5 bg-white px-3 py-1 rounded shadow-sm">${totalHrs}h ${totalMins}m</span>
        </div>
    `;
    contenedor.innerHTML = htmlCalendario;
}

async function guardarEdicionFuncionario(rut) {
    const datos = {
        rut: rut,
        nombre: document.getElementById(`edit_nom_${rut}`).value,
        apellidoP: document.getElementById(`edit_ap_${rut}`).value,
        apellidoM: document.getElementById(`edit_am_${rut}`).value,
        departamento: document.getElementById(`edit_depto_${rut}`).value,
        turno: document.getElementById(`edit_turno_${rut}`).value
    };
    const res = await apiFuncionarios.updateFuncionario(datos);
    if (res.status === 1) {
        mostrarNotificacion("Funcionario actualizado con éxito", "success");
        cargarListaFuncionarios();
    } else {
        mostrarNotificacion("Error: " + res.message, "error");
    }
}

function confirmarBorradoFuncionario(rut) {
    funcionarioAborrarId = rut;
    seccionABorrarId = null;
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

function generarReporteMensual(rutFuncionario) {
    const mesActual = fechaActualVisualizacion.getMonth() + 1; 
    const anioActual = fechaActualVisualizacion.getFullYear();
    const url = `../../controller/reporte_controller.php?rut=${rutFuncionario}&mes=${mesActual}&anio=${anioActual}`;
    window.open(url, '_blank');
}

/* =========================================================================
   MÓDULO 5: SECCIONES (CRUD)
   ========================================================================= */
async function cargarListaSecciones() {
    const contenedor = document.getElementById('contenedor-secciones');
    if (!contenedor) return;

    const res = await apiSecciones.getSecciones();
    contenedor.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(sec => {
            contenedor.innerHTML += `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="card bg-white border-0 shadow-sm card-depto h-100">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="icon-depto me-3 text-primary fs-3"><i class="bi bi-building"></i></div>
                            <div>
                                <h5 class="fw-bold text-black mb-0">${sec.nombre}</h5>
                                <small class="text-muted">ID: ${sec.id}</small>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                        <button class="btn btn-sm btn-outline-dark flex-grow-1 fw-bold" onclick="editarSeccion(${sec.id}, '${sec.nombre}')">
                            <i class="bi bi-pencil-square me-1"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarSeccion(${sec.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });
    } else {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center fw-bold shadow-sm border-0"><i class="bi bi-exclamation-circle me-2"></i> No hay secciones registradas.</div></div>`;
    }
}

function abrirModalNuevaSeccion() {
    const modalEl = document.getElementById('modalFormSeccion');
    if (!modalEl) return;
    if (document.getElementById('formSeccion')) document.getElementById('formSeccion').reset();
    if (document.getElementById('seccion_id')) document.getElementById('seccion_id').value = '';
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

async function guardarSeccion() {
    const id = document.getElementById('seccion_id').value;
    const nombre = document.getElementById('seccion_nombre').value.trim();

    if (!nombre) { mostrarNotificacion("El nombre de la sección no puede estar vacío.", "warning"); return; }
    let res;
    if (id) { res = await apiSecciones.updateSeccion(id, nombre); } 
    else { res = await apiSecciones.createSeccion(nombre); }

    if (res.status === 1) {
        mostrarNotificacion(id ? "Sección actualizada." : "Sección creada exitosamente.", "success");
        const modalEl = document.getElementById('modalFormSeccion');
        if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
        cargarListaSecciones();
    } else {
        mostrarNotificacion("Error: " + res.message, "error");
    }
}

function editarSeccion(id, nombre) {
    document.getElementById('seccion_id').value = id;
    document.getElementById('seccion_nombre').value = nombre;
    const modalEl = document.getElementById('modalFormSeccion');
    if (modalEl) new bootstrap.Modal(modalEl).show();
}

function confirmarBorrarSeccion(id) {
    seccionABorrarId = id; funcionarioAborrarId = null;
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

/* =========================================================================
   MÓDULO 7: TERMINAL DE ESCÁNER (RELOJ Y LECTURA)
   ========================================================================= */
function actualizarRelojYFecha() {
    const reloj = document.getElementById('reloj-digital');
    const fechaDiv = document.getElementById('fecha-actual');

    if (!reloj || !fechaDiv) return;

    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    reloj.textContent = `${horas}:${minutos}:${segundos}`;

    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let fechaFormateada = ahora.toLocaleDateString('es-ES', opcionesFecha);
    fechaDiv.textContent = fechaFormateada;
}

if (document.getElementById('reloj-digital')) {
    actualizarRelojYFecha();
    setInterval(actualizarRelojYFecha, 1000);

    document.addEventListener('click', function () {
        const inputScanner = document.getElementById('codigo_tarjeta');
        if (inputScanner) inputScanner.focus();
    });
}

let html5QrcodeScanner = null;

function toggleCamaraEscaner() {
    const container = document.getElementById('reader-container');
    const btn = document.getElementById('btnToggleCamara');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.innerHTML = '<i class="bi bi-camera-video-off me-2"></i> Apagar Cámara';
        btn.classList.replace('btn-outline-secondary', 'btn-outline-danger');

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 350, height: 150 }, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128] },
            false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } else {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                container.style.display = 'none';
                btn.innerHTML = '<i class="bi bi-camera-video me-2"></i> Usar Cámara del PC';
                btn.classList.replace('btn-outline-danger', 'btn-outline-secondary');
            });
        }
    }
}

function onScanSuccess(decodedText, decodedResult) {
    const inputCodigo = document.getElementById('codigo_tarjeta');
    inputCodigo.value = decodedText;

    const formEscaner = document.getElementById('form_marcar_asistencia');
    formEscaner.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    html5QrcodeScanner.pause();
    setTimeout(() => {
        if (html5QrcodeScanner && html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED) {
            html5QrcodeScanner.resume();
        }
    }, 3000);
}

function onScanFailure(error) {
    // Ignoramos los errores de frame vacío
}

const formEscaner = document.getElementById('form_marcar_asistencia');
if (formEscaner) {
    formEscaner.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const inputCodigo = document.getElementById('codigo_tarjeta');
        const tipoSeleccionado = document.querySelector('input[name="tipo_marca"]:checked').value;
        const alerta = document.getElementById('alertaAsistencia');

        const codigo = inputCodigo.value.trim();
        
        if (!codigo) {
            alert("Por favor, ingrese o escanee un código de credencial válido.");
            return;
        }
        if (codigo.length < 8) {
            alert("El código es muy corto o inválido. Verifique su credencial.");
            inputCodigo.value = ''; 
            return;
        }

        alerta.style.display = 'none';
        
        try {
            const req = await fetch('../../controller/asistencia_controller.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'registrarMarca', codigo: codigo, tipo: tipoSeleccionado })
            });
            const res = await req.json();

            alerta.style.display = 'block';
            if (res.status === 1) {
                alerta.className = 'alert alert-success fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
                alerta.innerHTML = `<i class="bi bi-check-circle-fill me-2 fs-3 align-middle"></i> ${res.message}`;
            } else {
                alerta.className = 'alert alert-danger fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
                alerta.innerHTML = `<i class="bi bi-x-circle-fill me-2 fs-3 align-middle"></i> ${res.message}`;
            }
        } catch(error) {
            console.error("Error al registrar:", error);
            alerta.style.display = 'block';
            alerta.className = 'alert alert-danger fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
            alerta.innerHTML = `<i class="bi bi-x-circle-fill me-2 fs-3 align-middle"></i> Error de conexión con el servidor.`;
        }

        inputCodigo.value = '';
        inputCodigo.focus();
        setTimeout(() => { alerta.style.display = 'none'; }, 4000);
    });
}


/* =========================================================================
   MÓDULO 7: GESTIÓN DE USUARIOS
   ========================================================================= */
async function cargarListaUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-danger" role="status"></div></td></tr>`;
    const res = await apiUsuarios.getUsuarios();
    tbody.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(u => {
            let rolBadge = u.rol === 'superadmin' ? 'bg-danger-yb-light text-danger-yb' : 'bg-blue-yb-light text-blue-yb';
            let estadoBadge = u.estado === 'Activo' ? 'bg-success text-white' : 'bg-secondary text-white';

            tbody.innerHTML += `
            <tr>
                <td class="ps-4 py-3 fw-bold text-black"><i class="bi bi-person-circle text-muted me-2 fs-5 align-middle"></i> ${u.nombre}</td>
                <td class="py-3">${u.login}</td>
                <td class="py-3"><span class="badge ${rolBadge} border-0 px-2 py-1">${u.rol}</span></td>
                <td class="py-3"><span class="badge ${estadoBadge} rounded-pill">${u.estado}</span></td>
                <td class="text-end pe-4 py-3">
                    <button class="btn btn-sm btn-outline-primary" style="color: var(--yb-blue); border-color: var(--yb-blue);" onclick="editarUsuario(${u.id}, '${u.nombre}', '${u.login}', '${u.rol}', '${u.estado}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger ms-1" style="color: var(--yb-red); border-color: var(--yb-red);" onclick="abrirModalBorrarUsuario(${u.id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        });
    } else { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron usuarios.</td></tr>'; }
}

function abrirModalUsuario() {
    const modalEl = document.getElementById('modalFormUsuario');
    if (!modalEl) return;
    if (document.getElementById('formUsuario')) document.getElementById('formUsuario').reset();
    if (document.getElementById('usuario_id')) document.getElementById('usuario_id').value = '';
    if (document.getElementById('textoTituloModal')) document.getElementById('textoTituloModal').innerText = 'Registrar Nuevo Usuario';
    if (document.getElementById('hint-password')) document.getElementById('hint-password').style.display = 'none';
    if (document.getElementById('usuario_password')) document.getElementById('usuario_password').required = true;
    
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function editarUsuario(id, nombre, login, rol, estado) {
    document.getElementById('usuario_id').value = id;
    document.getElementById('usuario_nombre').value = nombre;
    document.getElementById('usuario_login').value = login;
    document.getElementById('usuario_rol').value = rol;
    document.getElementById('usuario_estado').value = estado;
    document.getElementById('usuario_password').value = '';
    document.getElementById('usuario_password').required = false;

    document.getElementById('textoTituloModal').innerText = 'Editar Usuario';
    document.getElementById('hint-password').style.display = 'inline';
    new bootstrap.Modal(document.getElementById('modalFormUsuario')).show();
}

async function guardarUsuario() {
    const id = document.getElementById('usuario_id').value;
    const datos = {
        nombre: document.getElementById('usuario_nombre').value.trim(),
        login: document.getElementById('usuario_login').value.trim(),
        password: document.getElementById('usuario_password').value,
        rol: document.getElementById('usuario_rol').value,
        estado: document.getElementById('usuario_estado').value
    };

    if (!datos.nombre || !datos.login) { mostrarNotificacion("El nombre y el login son obligatorios.", "warning"); return; }
    let res;
    if (id) { datos.id = id; res = await apiUsuarios.updateUsuario(datos); } 
    else { res = await apiUsuarios.createUsuario(datos); }

    if (res.status === 1) {
        mostrarNotificacion("Usuario guardado exitosamente.", "success");
        bootstrap.Modal.getInstance(document.getElementById('modalFormUsuario')).hide();
        cargarListaUsuarios();
    } else { mostrarNotificacion("Error: " + res.message, "error"); }
}

function abrirModalBorrarUsuario(id) {
    document.getElementById('delete_usuario_id').value = id;
    new bootstrap.Modal(document.getElementById('modalBorrarUsuario')).show();
}

async function ejecutarBorrarUsuario() {
    const id = document.getElementById('delete_usuario_id').value;
    if (!id) return;
    const res = await apiUsuarios.deleteUsuario(id);
    if (res.status === 1) {
        mostrarNotificacion("Usuario eliminado con éxito.", "delete");
        bootstrap.Modal.getInstance(document.getElementById('modalBorrarUsuario')).hide();
        cargarListaUsuarios();
    } else { mostrarNotificacion("Error al eliminar: " + res.message, "error"); }
}

/* =========================================================================
   MÓDULO 8: DASHBOARD INICIO
   ========================================================================= */
async function cargarEstadisticasDashboard() {
    try {
        const req = await fetch('../../controller/dashboard_controller.php?action=getStats');
        const res = await req.json();
        if (res.status === 1) {
            document.getElementById('dash-total-func').innerHTML = res.data.total_funcionarios;
            document.getElementById('dash-presentes').innerHTML = res.data.presentes_hoy;
            document.getElementById('dash-atrasos').innerHTML = res.data.atrasos_hoy;
            document.getElementById('dash-licencias').innerHTML = res.data.licencias_activas;
        } else {
            mostrarCerosDashboard(); mostrarNotificacion("Error al cargar estadísticas: " + res.message, "warning");
        }
    } catch (error) {
        mostrarCerosDashboard(); mostrarNotificacion("Error crítico al conectar con el servidor.", "error");
    }
}
function mostrarCerosDashboard() {
    document.getElementById('dash-total-func').innerHTML = '0';
    document.getElementById('dash-presentes').innerHTML = '0';
    document.getElementById('dash-atrasos').innerHTML = '0';
    document.getElementById('dash-licencias').innerHTML = '0';
}

/* =========================================================================
   MÓDULO 9: FUNCIÓN GLOBAL DE BORRADO EN MODALES UNIFICADOS
   ========================================================================= */
async function ejecutarBorrado() {
    const modalEl = document.getElementById('modalBorrar');
    if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
    }

    if (typeof funcionarioAborrarId !== 'undefined' && funcionarioAborrarId !== null) {
        try {
            const res = await apiFuncionarios.deleteFuncionario(funcionarioAborrarId);
            if (res.status === 1) {
                mostrarNotificacion("Funcionario eliminado correctamente.", "delete");
                cargarListaFuncionarios();
            } else { mostrarNotificacion("No se pudo eliminar: " + res.message, "error"); }
        } catch (error) { mostrarNotificacion("Error de conexión al eliminar.", "error"); }
        funcionarioAborrarId = null; 
    } 
    else if (typeof seccionABorrarId !== 'undefined' && seccionABorrarId !== null) {
        try {
            const res = await apiSecciones.deleteSeccion(seccionABorrarId);
            if (res.status === 1) {
                mostrarNotificacion("Sección eliminada correctamente.", "delete");
                if (typeof cargarListaSecciones === "function") cargarListaSecciones();
            } else { mostrarNotificacion("Error al eliminar la sección: " + res.message, "error"); }
        } catch (error) { mostrarNotificacion("Error de conexión al eliminar.", "error"); }
        seccionABorrarId = null;
    }
}