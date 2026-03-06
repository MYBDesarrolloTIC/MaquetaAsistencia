/* =========================================================================
   1. VARIABLES GLOBALES
   ========================================================================= */
// Turnos
let turnoABorrarId = null;
let modalFormTurnoInstance = null;
let modalBorrarTurnoInstance = null;

// Funcionarios y Asistencia
let funcionarioAborrarId = null;
let fechaActualVisualizacion = new Date(2026, 2, 1); // Marzo 2026
const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Secciones
let seccionABorrarId = null;


/* =========================================================================
   2. INICIALIZACIÓN DEL DOCUMENTO (DOM Ready Unificado)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE LOGIN ---
    const formLogin = document.getElementById("form_login");
    if (formLogin) {
        formLogin.addEventListener("submit", procesarLogin);
    }

    // --- LÓGICA DE ENROLAMIENTO ---
    const selectTurno = document.getElementById('enrolar_turno');
    const selectSeccion = document.getElementById('enrolar_seccion');
    if (selectTurno) cargarSelectTurnosEnrolar();
    if (selectSeccion) cargarSelectSeccionesEnrolar();
    
    const formEnrolar = document.getElementById('form-enrolar');
    if (formEnrolar) {
        formEnrolar.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                guardarNuevoFuncionario();
            }
        });
    }
    
    // --- LÓGICA DE USUARIOS ---
    if (document.getElementById('tabla-usuarios')) cargarListaUsuarios();
    
    // --- LÓGICA DE TURNOS ---
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
    if(contenedorTurnos) cargarTarjetasTurnos();

    const formTurno = document.getElementById('formTurno');
    if (formTurno) {
        formTurno.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                guardarTurno();        
            }
        });
    }

    // --- LÓGICA DE FUNCIONARIOS (LISTA) ---
    const contenedorFuncionarios = document.getElementById('contenedor-funcionarios');
    if(contenedorFuncionarios) cargarListaFuncionarios();

    // --- LÓGICA DE ASISTENCIA Y CALENDARIO ---
    const calendarioSimple = document.getElementById("calendario-simple-1");
    if (calendarioSimple) dibujarCalendarioSimple(1, fechaActualVisualizacion);

    // --- LÓGICA DE SECCIONES (LISTA) ---
    const contenedorSecciones = document.getElementById('contenedor-secciones');
    if(contenedorSecciones) cargarListaSecciones();

    const formSeccion = document.getElementById('formSeccion');
    if (formSeccion) {
        formSeccion.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                guardarSeccion(); 
            }
        });
    }
});


/* =========================================================================
   MÓDULO 1: LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    console.log("✅ 1. El botón Entrar reaccionó.");
    
    const userVal = document.getElementById("usuario").value.trim();
    const passVal = document.getElementById("password").value;
    console.log("✅ 2. Datos capturados - Usuario:", userVal, " | Clave:", passVal ? "***" : "vacía");

    try {
        console.log("⏳ 3. Viajando al servidor (login_controller.php)...");
        const vuser = await validUser(userVal, passVal);
        console.log("✅ 4. El servidor respondió esto:", vuser);

        if (vuser.status === 1 && vuser.data && vuser.data.status === 1) {
            const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();
            console.log("🚀 5. ¡Login Exitoso! Redirigiendo según rol:", rolUsuario);
            
            // Redirección
            if (rolUsuario === 'superadmin' || rolUsuario === 'admin') {
                window.location.href = "VistaInicio.php";
            } else {
                window.location.href = "VistaEscaner.php";
            }
        } else {
            // Mostrar error en pantalla
            const alerta = document.getElementById("alertaError");
            const mensajeFallo = vuser.data ? vuser.data.message : (vuser.message || "Error desconocido");
            console.warn("❌ 5. Falló el Login:", mensajeFallo);
            
            if (alerta) {
                alerta.classList.remove('d-none');
                alerta.innerText = mensajeFallo;
            } else {
                alert("Error: " + mensajeFallo);
            }
        }
    } catch (error) {
        console.error("🔥 ERROR CRÍTICO en JavaScript:", error);
        alert("El sistema chocó, mira la consola para más detalles.");
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
                                    <div class="icon-turno me-3">
                                        <i class="bi bi-clock-fill text-primary fs-3"></i>
                                    </div>
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
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_entrada.substring(0,5)} hrs</span>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Salida</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_salida.substring(0,5)} hrs</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                                <small class="text-muted fw-semibold"><i class="bi bi-stopwatch me-1"></i> Total:</small>
                                <span class="fw-bold text-black">${total.horas} hrs ${total.minutos} mins</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary flex-grow-1 fw-bold"
                                onclick="editarTurno(${turno.IDturno}, '${turno.nombre}', '${turno.hora_entrada}', '${turno.hora_salida}')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarTurno(${turno.IDturno})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center fw-bold shadow-sm border-0">
                    <i class="bi bi-exclamation-circle me-2"></i> No hay turnos registrados en la base de datos.
                </div>
            </div>`;
    }
}

function abrirModalTurno() {
    document.getElementById('formTurno').reset();
    document.getElementById('turno_id').value = '';
    document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-clock-history me-2"></i> Registrar Nuevo Turno';
    document.getElementById('alerta-calculo').innerHTML = '<i class="bi bi-info-circle-fill me-2 fs-5"></i><span>Complete las horas para calcular el total.</span>';
    document.getElementById('alerta-calculo').className = "alert alert-info py-2 small d-flex align-items-center mb-0";
    modalFormTurnoInstance.show();
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
        alert("Por favor completa todos los campos.");
        return;
    }

    const datos = { nombre, hora_entrada, hora_salida };
    let respuesta;

    if (id) {
        datos.id = id;
        respuesta = await apiTurnos.updateTurno(datos);
    } else {
        respuesta = await apiTurnos.createTurno(datos);
    }

    if (respuesta.status === 1) {
        modalFormTurnoInstance.hide();
        cargarTarjetasTurnos();
    } else {
        alert("Error: " + respuesta.message); 
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
            modalBorrarTurnoInstance.hide();
            cargarTarjetasTurnos();
        } else {
            alert(respuesta.message);
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

    if (fechaSalida < fechaEntrada) {
        fechaSalida.setDate(fechaSalida.getDate() + 1); 
    }

    const diferenciaMs = fechaSalida - fechaEntrada;
    return {
        horas: Math.floor(diferenciaMs / (1000 * 60 * 60)),
        minutos: Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60))
    };
}


/* =========================================================================
   MÓDULO 3: ENROLAMIENTO
   ========================================================================= */
function generarCodigoAutomatico() {
    const rutInput = document.getElementById('enrolar_rut');
    if (!rutInput) return; // Seguro de página

    const inputCodigo = document.getElementById('enrolar_codigo');
    const svgBarcode = document.getElementById('barcode');
    const placeholder = document.getElementById('barcode-placeholder');

    if (rutInput.value.trim() === '') {
        inputCodigo.value = '';
        inputCodigo.dataset.sufijo = ''; 
        svgBarcode.style.display = 'none';
        placeholder.style.display = 'block';
        return;
    }

    let rutLimpio = rutInput.value.replace(/[^0-9kK]/gi, '');
    
    if (rutLimpio.length > 2) {
        if (!inputCodigo.dataset.sufijo) {
            inputCodigo.dataset.sufijo = Math.floor(10000 + Math.random() * 90000);
        }
        
        let codigoFinal = rutLimpio + inputCodigo.dataset.sufijo;
        inputCodigo.value = codigoFinal;

        if (typeof JsBarcode !== 'undefined') {
            JsBarcode("#barcode", codigoFinal, {
                format: "CODE128",
                lineColor: "#212529", 
                width: 2,
                height: 70,
                displayValue: false, 
                margin: 0
            });
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
        alert("Por favor, completa todos los campos obligatorios antes de guardar.");
        return;
    }

    const datos = { rut, nombre: nombres, apellidoP: ap_paterno, apellidoM: ap_materno, seccion, turno, codigo };
    const respuesta = await apiFuncionarios.createFuncionario(datos);

    if (respuesta.status === 1) {
        alert(respuesta.message);
        document.getElementById('form-enrolar').reset();
        document.getElementById('enrolar_codigo').value = '';
        document.getElementById('enrolar_codigo').dataset.sufijo = ''; 
        document.getElementById('barcode-placeholder').style.display = 'block';
        document.getElementById('barcode').style.display = 'none';
    } else {
        alert("Error al enrolar: " + respuesta.message);
    }
}

async function cargarSelectTurnosEnrolar() {
    const select = document.getElementById('enrolar_turno');
    if (!select) return; 

    const respuesta = await apiTurnos.getTurnos();
    
    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        select.innerHTML = '<option value="" selected disabled>Seleccione un turno...</option>';
        respuesta.data.forEach(turno => {
            select.innerHTML += `<option value="${turno.IDturno}">${turno.nombre} (${turno.hora_entrada.substring(0,5)} a ${turno.hora_salida.substring(0,5)})</option>`;
        });
    } else {
        select.innerHTML = '<option value="" selected disabled>No hay turnos creados</option>';
    }
}

async function cargarSelectSeccionesEnrolar() {
    const select = document.getElementById('enrolar_seccion');
    if (!select) return; 

    const respuesta = await apiSecciones.getSecciones();
    
    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        select.innerHTML = '<option value="" selected disabled>Seleccione una sección...</option>';
        respuesta.data.forEach(sec => {
            select.innerHTML += `<option value="${sec.id}">${sec.nombre}</option>`;
        });
    } else {
        select.innerHTML = '<option value="" selected disabled>No hay secciones creadas</option>';
    }
}


/* =========================================================================
   MÓDULO 4: FUNCIONARIOS Y ASISTENCIA (CRUD Y CALENDARIO)
========================================================================= */

async function cargarListaFuncionarios() {
    const contenedor = document.getElementById('contenedor-funcionarios');
    if(!contenedor) return;

    const res = await apiFuncionarios.getFuncionarios();
    const resSecciones = await apiSecciones.getSecciones();
    const resTurnos = await apiTurnos.getTurnos();
    
    contenedor.innerHTML = '';

    if(res.status === 1 && res.data && res.data.length > 0) {
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
            <div class="list-group-item p-0 funcionario-item border-start-blue mb-2 shadow-sm rounded">
                <div class="d-flex align-items-center py-3 px-3 bg-white fila-visible" 
                     style="cursor: pointer; transition: 0.2s;" 
                     onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'calendario', event)"
                     onmouseover="this.style.backgroundColor='#f8f9fa'" 
                     onmouseout="this.style.backgroundColor='white'">
                     
                    <div class="col-2 fw-semibold text-muted">${f.rut}</div>
                    <div class="col-3 text-black fw-bold"><i class="bi bi-person-fill me-2 text-primary"></i>${f.nombre} ${f.apellidoP}</div>
                    <div class="col-2 text-truncate">${textoSeccion}</div>
                    <div class="col-2"><span class="badge bg-light text-dark border"><i class="bi bi-clock me-1"></i>${textoTurno}</span></div>
                    
                    <div class="col-3 text-end pe-2">
                        <button class="btn btn-sm btn-outline-primary fw-bold bg-white" title="Editar Funcionario"
                                onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'editar', event)">
                            <i class="bi bi-pencil-square me-1"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-1 bg-white" title="Eliminar Funcionario"
                                onclick="event.stopPropagation(); confirmarBorradoFuncionario('${f.rut}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div id="${colId}" class="collapse bg-white border-top">
                    <div class="d-flex justify-content-end p-2 bg-light border-bottom">
                        <button type="button" class="btn-close" aria-label="Close" title="Cerrar panel"
                                onclick="cerrarPanelFuncionario('${safeId}', event)"></button>
                    </div>
                    
                    <div class="row p-4 pt-3 m-0">
                        <div id="col-form-${safeId}" class="col-md-5 pe-4">
                            <h5 class="fw-bold mb-3 text-blue-yb"><i class="bi bi-person-vcard me-2"></i>Editar Funcionario</h5>
                            <form>
                                <div class="mb-3">
                                    <label class="form-label small fw-bold text-muted">Nombres</label>
                                    <input type="text" class="form-control" id="edit_nom_${f.rut}" value="${f.nombre}">
                                </div>
                                <div class="row mb-3">
                                    <div class="col">
                                        <label class="form-label small fw-bold text-muted">Apellido P.</label>
                                        <input type="text" class="form-control" id="edit_ap_${f.rut}" value="${f.apellidoP}">
                                    </div>
                                    <div class="col">
                                        <label class="form-label small fw-bold text-muted">Apellido M.</label>
                                        <input type="text" class="form-control" id="edit_am_${f.rut}" value="${f.apellidoM || ''}">
                                    </div>
                                </div>
                                <div class="row mb-4">
                                    <div class="col">
                                        <label class="form-label small fw-bold text-muted">Sección</label>
                                        <select class="form-select" id="edit_depto_${f.rut}">
                                            ${opcionesSecciones}
                                        </select>
                                    </div>
                                    <div class="col">
                                        <label class="form-label small fw-bold text-muted">Turno</label>
                                        <select class="form-select" id="edit_turno_${f.rut}">
                                            ${opcionesTurnos}
                                        </select>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-success fw-bold w-100 py-2 shadow-sm" onclick="guardarEdicionFuncionario('${f.rut}')">
                                    <i class="bi bi-check-circle me-1"></i> Guardar Cambios
                                </button>
                            </form>
                        </div>
                        
                        <div id="col-cal-${safeId}" class="col-md-7 ps-md-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="d-flex align-items-center">
                                    <h5 class="fw-bold mb-0 text-blue-yb"><i class="bi bi-calendar-grid-month me-2"></i>Asistencia</h5>
                                    <button class="btn btn-sm btn-outline-danger fw-bold ms-3 shadow-sm" title="Descargar Reporte del Mes" onclick="generarReporteMensual('${f.rut}')">
                                        <i class="bi bi-file-earmark-pdf-fill me-1"></i> Reporte
                                    </button>
                                </div>
                                <div class="d-flex align-items-center gap-1">
                                    <button class="btn btn-sm btn-light border fw-bold" onclick="cambiarMes(-1, '${safeId}', '${f.rut}')"><i class="bi bi-chevron-left"></i></button>
                                    <span id="mes-anio-${safeId}" class="fw-bold text-uppercase px-2 text-center" style="min-width: 130px; font-size: 0.9rem;"></span>
                                    <button class="btn btn-sm btn-light border fw-bold" onclick="cambiarMes(1, '${safeId}', '${f.rut}')"><i class="bi bi-chevron-right"></i></button>
                                </div>
                            </div>
                            <div id="calendario-simple-${safeId}"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } else {
        contenedor.innerHTML = '<div class="alert alert-warning text-center fw-bold">No hay funcionarios registrados.</div>';
    }
}

function abrirPanelFuncionario(safeId, rutReal, modo, event) {
    if (event) event.stopPropagation();
    
    const formCol = document.getElementById(`col-form-${safeId}`);
    const calCol = document.getElementById(`col-cal-${safeId}`);
    const collapseEl = document.getElementById(`edit-func-${safeId}`);

    if (modo === 'calendario') {
        formCol.style.display = 'none';
        calCol.className = 'col-12 ps-md-0';
    } else {
        formCol.style.display = 'block';
        calCol.className = 'col-md-7 ps-md-4 border-start'; 
    }

    dibujarCalendarioSimple(safeId, rutReal, fechaActualVisualizacion);
    
    const bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl, { toggle: false });
    bsCollapse.show();
}

function cerrarPanelFuncionario(safeId, event) {
    if (event) event.stopPropagation();
    const collapseEl = document.getElementById(`edit-func-${safeId}`);
    const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
    if (bsCollapse) bsCollapse.hide();
}

function cambiarMes(direccion, safeId, rutReal) {
    fechaActualVisualizacion.setMonth(fechaActualVisualizacion.getMonth() + direccion);
    dibujarCalendarioSimple(safeId, rutReal, fechaActualVisualizacion);
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
    if(res.status === 1) {
        alert("Funcionario actualizado con éxito.");
        cargarListaFuncionarios();
    } else {
        alert("Error: " + res.message);
    }
}

function confirmarBorradoFuncionario(rut) {
    funcionarioAborrarId = rut;
    seccionABorrarId = null; 
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

function cambiarMes(direccion, idFuncionario) {
    fechaActualVisualizacion.setMonth(fechaActualVisualizacion.getMonth() + direccion);
    dibujarCalendarioSimple(idFuncionario, fechaActualVisualizacion);
}

function dibujarCalendarioSimple(safeId, rutReal, fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    const mesAnioElemento = document.getElementById(`mes-anio-${safeId}`);
    if (mesAnioElemento) mesAnioElemento.innerText = `${nombresMeses[mes]} ${año}`;
    
    const contenedor = document.getElementById(`calendario-simple-${safeId}`);
    if (!contenedor) return;
    
    const totalDiasMes = new Date(año, mes + 1, 0).getDate();
    const primerDiaSemana = new Date(año, mes, 1).getDay(); 
    
    let htmlCalendario = `
        <div class="d-grid text-center text-muted fw-bold small mb-1" style="grid-template-columns: repeat(7, 1fr);">
            <div class="py-1">Do</div><div class="py-1">Lu</div><div class="py-1">Ma</div><div class="py-1">Mi</div>
            <div class="py-1">Ju</div><div class="py-1">Vi</div><div class="py-1">Sá</div>
        </div>
        <div class="d-grid bg-white shadow-sm rounded" style="grid-template-columns: repeat(7, 1fr); border-top: 1px solid #dee2e6; border-left: 1px solid #dee2e6; overflow: hidden;">
    `;
    
    for (let i = 0; i < primerDiaSemana; i++) {
        htmlCalendario += `<div class="bg-light" style="border-right: 1px solid #dee2e6; border-bottom: 1px solid #dee2e6; aspect-ratio: 1 / 1;"></div>`;
    }
    
    for (let dia = 1; dia <= totalDiasMes; dia++) {
        let diaDeLaSemana = new Date(año, mes, dia).getDay();
        
        let bgClass = 'bg-success bg-opacity-10 text-success fw-bold'; 
        
        if (diaDeLaSemana === 0 || diaDeLaSemana === 6) {
            bgClass = 'bg-light text-secondary'; 
        } else {
            if (dia === 12 || dia === 23) bgClass = 'bg-danger bg-opacity-10 text-danger fw-bold'; 
            if (dia === 8 || dia === 15) bgClass = 'bg-warning bg-opacity-10 text-dark fw-bold';   
        }

        htmlCalendario += `
            <div class="${bgClass} d-flex justify-content-center align-items-center" 
                 style="aspect-ratio: 1 / 1; border-right: 1px solid #dee2e6; border-bottom: 1px solid #dee2e6; font-size: 1rem; cursor: pointer; transition: background 0.2s;" 
                 title="Día ${dia}"
                 onmouseover="this.classList.add('shadow-inner')" 
                 onmouseout="this.classList.remove('shadow-inner')">
                ${dia}
            </div>
        `;
    }
    
    let casillasTotales = primerDiaSemana + totalDiasMes;
    let casillasSobrantes = (7 - (casillasTotales % 7)) % 7;
    for (let i = 0; i < casillasSobrantes; i++) {
        htmlCalendario += `<div class="bg-light" style="border-right: 1px solid #dee2e6; border-bottom: 1px solid #dee2e6; aspect-ratio: 1 / 1;"></div>`;
    }
    
    htmlCalendario += `</div>`; 
    contenedor.innerHTML = htmlCalendario; 
}

// =========================================================================
// MÓDULO DE REPORTES (Pendiente conectar con PHP/PDF)
// =========================================================================
function generarReporteMensual(rutFuncionario) {
    const mesActual = fechaActualVisualizacion.getMonth() + 1; // +1 porque Enero es 0
    const anioActual = fechaActualVisualizacion.getFullYear();
    const nombreMes = nombresMeses[fechaActualVisualizacion.getMonth()];

    // Por ahora mostramos una alerta confirmando los datos que enviaremos a PHP
    alert(`¡Función lista para conectar!\n\nSe generará el reporte en PDF para el RUT: ${rutFuncionario}\nPeriodo: ${nombreMes} ${anioActual}`);
    
    // En el futuro, aquí haremos un window.open() a un archivo PHP 
    // pasándole el RUT y la fecha por la URL para que imprima el PDF.
    // Ej: window.open(`../../controller/reporte_controller.php?rut=${rutFuncionario}&mes=${mesActual}&anio=${anioActual}`);
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
                            <div class="icon-depto me-3 text-primary fs-3">
                                <i class="bi bi-building"></i>
                            </div>
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
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center fw-bold shadow-sm border-0">
                    <i class="bi bi-exclamation-circle me-2"></i> No hay secciones registradas.
                </div>
            </div>`;
    }
}

async function guardarSeccion() {
    const id = document.getElementById('seccion_id').value;
    const nombre = document.getElementById('seccion_nombre').value.trim();

    if (!nombre) {
        alert("El nombre de la sección no puede estar vacío.");
        return;
    }

    let res;
    if (id) {
        res = await apiSecciones.updateSeccion(id, nombre);
    } else {
        res = await apiSecciones.createSeccion(nombre);
    }

    if (res.status === 1) {
        const modalEl = document.getElementById('modalFormSeccion');
        if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
        cargarListaSecciones();
    } else {
        alert("Error: " + res.message);
    }
}

function editarSeccion(id, nombre) {
    document.getElementById('seccion_id').value = id;
    document.getElementById('seccion_nombre').value = nombre;
    const modalEl = document.getElementById('modalFormSeccion');
    if (modalEl) new bootstrap.Modal(modalEl).show();
}

function abrirModalNuevaSeccion() {
    document.getElementById('formSeccion').reset();
    document.getElementById('seccion_id').value = '';
    const modalEl = document.getElementById('modalFormSeccion');
    if (modalEl) new bootstrap.Modal(modalEl).show();
}

function confirmarBorrarSeccion(id) {
    seccionABorrarId = id;
    funcionarioAborrarId = null; 
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}


/* =========================================================================
   MÓDULO 6: CARABINERO DE TRÁNSITO (BORRADO UNIFICADO)
   ========================================================================= */
async function ejecutarBorrado() {
    
    if (funcionarioAborrarId) {
        const res = await apiFuncionarios.deleteFuncionario(funcionarioAborrarId);
        if (res.status === 1) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalBorrar'));
            modal.hide();
            cargarListaFuncionarios();
            funcionarioAborrarId = null; 
        } else {
            alert(res.message);
        }
    } 
    
    else if (seccionABorrarId) {
        const res = await apiSecciones.deleteSeccion(seccionABorrarId);
        if (res.status === 1) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalBorrar'));
            modal.hide();
            cargarListaSecciones();
            seccionABorrarId = null; 
        } else {
            alert(res.message);
        }
    }
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

    document.addEventListener('click', function() {
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
            { fps: 10, qrbox: {width: 350, height: 150}, formatsToSupport: [ Html5QrcodeSupportedFormats.CODE_128 ] }, 
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
        if(html5QrcodeScanner && html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED){
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
        if(!codigo) return;

        alerta.style.display = 'none';
        
        const res = await apiAsistencia.registrarMarca(codigo, tipoSeleccionado);

        alerta.style.display = 'block';
        if (res.status === 1) {
            alerta.className = 'alert alert-success fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
            alerta.innerHTML = `<i class="bi bi-check-circle-fill me-2 fs-3 align-middle"></i> ${res.message}`;
        } else {
            alerta.className = 'alert alert-danger fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
            alerta.innerHTML = `<i class="bi bi-x-circle-fill me-2 fs-3 align-middle"></i> ${res.message}`;
        }

        inputCodigo.value = '';
        inputCodigo.focus();

        setTimeout(() => { alerta.style.display = 'none'; }, 4000);
    });
}


/* =========================================================================
   MÓDULO 8: GESTIÓN DE USUARIOS
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
                <td class="ps-4 py-3 fw-bold text-black">
                    <i class="bi bi-person-circle text-muted me-2 fs-5 align-middle"></i> 
                    ${u.nombre}
                </td>
                <td class="py-3">${u.login}</td>
                <td class="py-3"><span class="badge ${rolBadge} border-0 px-2 py-1">${u.rol}</span></td>
                <td class="py-3"><span class="badge ${estadoBadge} rounded-pill">${u.estado}</span></td>
                <td class="text-end pe-4 py-3">
                    <button class="btn btn-sm btn-outline-primary" style="color: var(--yb-blue); border-color: var(--yb-blue);" onclick="editarUsuario(${u.id}, '${u.nombre}', '${u.login}', '${u.rol}', '${u.estado}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger ms-1" style="color: var(--yb-red); border-color: var(--yb-red);" onclick="abrirModalBorrarUsuario(${u.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron usuarios.</td></tr>';
    }
}

function abrirModalUsuario() {
    document.getElementById('formUsuario').reset();
    document.getElementById('usuario_id').value = '';
    document.getElementById('textoTituloModal').innerText = 'Registrar Nuevo Usuario';
    document.getElementById('hint-password').style.display = 'none'; 
    document.getElementById('usuario_password').required = true;
    const modal = new bootstrap.Modal(document.getElementById('modalFormUsuario'));
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
    
    const modal = new bootstrap.Modal(document.getElementById('modalFormUsuario'));
    modal.show();
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

    if (!datos.nombre || !datos.login) {
        alert("El nombre y el login son obligatorios.");
        return;
    }

    let res;
    if (id) {
        datos.id = id;
        res = await apiUsuarios.updateUsuario(datos);
    } else {
        res = await apiUsuarios.createUsuario(datos);
    }

    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalFormUsuario')).hide();
        cargarListaUsuarios();
    } else {
        alert(res.message);
    }
}

function abrirModalBorrarUsuario(id) {
    document.getElementById('delete_usuario_id').value = id;
    const modal = new bootstrap.Modal(document.getElementById('modalBorrarUsuario'));
    modal.show();
}

async function ejecutarBorrarUsuario() {
    const id = document.getElementById('delete_usuario_id').value;
    if (!id) return;

    const res = await apiUsuarios.deleteUsuario(id);
    if (res.status === 1) {
        bootstrap.Modal.getInstance(document.getElementById('modalBorrarUsuario')).hide();
        cargarListaUsuarios();
    } else {
        alert(res.message);
    }
}