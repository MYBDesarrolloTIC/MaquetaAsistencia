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


/* =========================================================================
   2. INICIALIZACIÓN DEL DOCUMENTO (DOM Ready)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE ENROLAMIENTO ---
    const selectTurno = document.getElementById('enrolar_turno');
    if (selectTurno) {
        cargarSelectTurnosEnrolar();
    }
    
    // --- LÓGICA DE LOGIN ---
    const formLogin = document.getElementById("form_login");
    if (formLogin) {
        formLogin.addEventListener("submit", procesarLogin);
    }

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
    if(contenedorTurnos) {
        cargarTarjetasTurnos();
    }

    // --- LÓGICA DE FUNCIONARIOS (LISTA) ---
    const contenedorFuncionarios = document.getElementById('contenedor-funcionarios');
    if(contenedorFuncionarios) {
        cargarListaFuncionarios();
    }

    // --- LÓGICA DE ASISTENCIA Y CALENDARIO ---
    const calendarioSimple = document.getElementById("calendario-simple-1");
    if (calendarioSimple) {
        dibujarCalendarioSimple(1, fechaActualVisualizacion);
    }
});


/* =========================================================================
   MÓDULO 1: LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("usuario").value;
    const passVal = document.getElementById("password").value;

    const vuser = await validUser(userVal, passVal);

    if (vuser.status === API_REQUEST_SUCCESS && vuser.data.status === 1) {
        const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();

        if (rolUsuario === 'superadmin' || rolUsuario === 'admin') {
            window.location.href = "VistaInicio.php";
        } else {
            window.location.href = "VistaEscaner.php";
        }
    } else {
        const alerta = document.getElementById("alertaError");
        const mensajeFallo = vuser.data ? vuser.data.message : vuser.message;

        if (alerta) {
            alerta.classList.remove('d-none');
            alerta.innerText = mensajeFallo;
        } else {
            alert(mensajeFallo);
        }
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
   MÓDULO 3: ENROLAMIENTO (NUEVOS FUNCIONARIOS)
   ========================================================================= */
function generarSufijo(length) {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}

function generarCodigoAutomatico() {
    const rutInput = document.getElementById('enrolar_rut');
    if (!rutInput) return; // Seguro por si no estamos en la vista de enrolar

    const barcodeSvg = document.getElementById('barcode');
    const placeholder = document.getElementById('barcode-placeholder');
    const displayInput = document.getElementById('enrolar_codigo');

    let rutLimpio = rutInput.value.replace(/[^0-9kK]/g, '');

    if (rutLimpio.length >= 7) {
        if(!displayInput.dataset.sufijo) {
            displayInput.dataset.sufijo = generarSufijo(5);
        }
        
        const codigoFinal = rutLimpio + displayInput.dataset.sufijo;
        displayInput.value = codigoFinal;
        placeholder.style.display = 'none';
        barcodeSvg.style.display = 'block';

        if (typeof JsBarcode !== 'undefined') {
            JsBarcode("#barcode", codigoFinal, {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 80,
                displayValue: true
            });
        }
    } else {
        displayInput.value = "";
        displayInput.dataset.sufijo = "";
        barcodeSvg.style.display = 'none';
        placeholder.style.display = 'block';
    }
}

async function guardarNuevoFuncionario() {
    const rut = document.getElementById('enrolar_rut').value.trim();
    const nombres = document.getElementById('enrolar_nombres').value.trim();
    const ap_paterno = document.getElementById('enrolar_ap_paterno').value.trim();
    const ap_materno = document.getElementById('enrolar_ap_materno').value.trim();
    const departamento = document.getElementById('enrolar_departamento').value;
    const turno = document.getElementById('enrolar_turno').value;
    const codigo = document.getElementById('enrolar_codigo').value;

    if (!rut || !nombres || !ap_paterno || !departamento || !turno || !codigo) {
        alert("Por favor, completa todos los campos obligatorios antes de guardar.");
        return;
    }

    const datos = { rut, nombre: nombres, apellidoP: ap_paterno, apellidoM: ap_materno, departamento, turno, codigo };
    const respuesta = await apiFuncionarios.createFuncionario(datos);

    if (respuesta.status === 1) {
        alert(respuesta.message);
        document.getElementById('form-enrolar').reset();
        document.getElementById('enrolar_codigo').value = '';
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


/* =========================================================================
   MÓDULO 4: FUNCIONARIOS Y ASISTENCIA (CRUD Y CALENDARIO)
   ========================================================================= */
async function cargarListaFuncionarios() {
    const contenedor = document.getElementById('contenedor-funcionarios');
    if(!contenedor) return;

    const res = await apiFuncionarios.getFuncionarios();
    contenedor.innerHTML = '';

    if(res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(f => {
            const colId = `edit-func-${f.rut.replace(/[^a-zA-Z0-9]/g, '')}`;
            
            contenedor.innerHTML += `
            <div class="list-group-item p-0 funcionario-item border-start-blue mb-2 shadow-sm">
                <div class="d-flex align-items-center py-3 px-3 bg-white fila-visible">
                    <div class="col-2 fw-semibold">${f.rut}</div>
                    <div class="col-3 text-black fw-bold">${f.nombre} ${f.apellidoP}</div>
                    <div class="col-2">${f.IDdepartamento}</div>
                    <div class="col-2"><span class="badge bg-dark text-white border">ID Turno: ${f.IDturno}</span></div>
                    <div class="col-3 text-center">
                        <button class="btn btn-sm btn-outline-primary me-2 fw-bold" data-bs-toggle="collapse" data-bs-target="#${colId}" onclick="dibujarCalendarioSimple('${f.rut}', fechaActualVisualizacion)">
                            <i class="bi bi-calendar3"></i> Asistencia / Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmarBorradoFuncionario('${f.rut}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div id="${colId}" class="collapse bg-light border-top border-bottom">
                    <div class="p-4 row g-4">
                        <div class="col-md-5 border-end pe-4">
                            <h5 class="fw-bold mb-3 text-blue-yb"><i class="bi bi-person-lines-fill me-2"></i>Editar Funcionario</h5>
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
                                        <label class="form-label small fw-bold text-muted">ID Depto</label>
                                        <input type="number" class="form-control" id="edit_depto_${f.rut}" value="${f.IDdepartamento}">
                                    </div>
                                    <div class="col">
                                        <label class="form-label small fw-bold text-muted">ID Turno</label>
                                        <input type="number" class="form-control" id="edit_turno_${f.rut}" value="${f.IDturno}">
                                    </div>
                                </div>
                                <button type="button" class="btn btn-success fw-bold w-100 py-2 shadow-sm" onclick="guardarEdicionFuncionario('${f.rut}')">
                                    <i class="bi bi-check-circle me-1"></i> Guardar Cambios
                                </button>
                            </form>
                        </div>
                        <div class="col-md-7 ps-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="fw-bold mb-0 text-blue-yb"><i class="bi bi-calendar-check me-2"></i>Registro</h5>
                            </div>
                            <div class="d-flex flex-wrap gap-2 justify-content-start mb-4" id="calendario-simple-${f.rut}"></div>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    } else {
        contenedor.innerHTML = '<div class="alert alert-warning text-center fw-bold">No hay funcionarios registrados.</div>';
    }
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
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

async function ejecutarBorrado() {
    if (funcionarioAborrarId) {
        const res = await apiFuncionarios.deleteFuncionario(funcionarioAborrarId);
        if(res.status === 1) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalBorrar'));
            modal.hide();
            cargarListaFuncionarios();
        } else {
            alert(res.message);
        }
    }
}

function cambiarMes(direccion, idFuncionario) {
    fechaActualVisualizacion.setMonth(fechaActualVisualizacion.getMonth() + direccion);
    dibujarCalendarioSimple(idFuncionario, fechaActualVisualizacion);
}

function dibujarCalendarioSimple(idFuncionario, fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    const mesAnioElemento = document.getElementById(`mes-anio-${idFuncionario}`);
    if (mesAnioElemento) mesAnioElemento.innerText = `${nombresMeses[mes]} ${año}`;
    
    const contenedor = document.getElementById(`calendario-simple-${idFuncionario}`);
    if (!contenedor) return;
    
    contenedor.innerHTML = ''; 
    
    const totalDiasMes = new Date(año, mes + 1, 0).getDate();
    
    for (let dia = 1; dia <= totalDiasMes; dia++) {
        let bgClass = 'bg-success'; 
        
        let diaDeLaSemana = new Date(año, mes, dia).getDay();
        if (diaDeLaSemana === 0 || diaDeLaSemana === 6) {
            bgClass = 'bg-secondary bg-opacity-50'; 
        } else {
            if (dia === 8 || dia === 15) bgClass = 'bg-warning text-dark'; 
            if (dia === 12 || dia === 23) bgClass = 'bg-danger'; 
        }

        contenedor.innerHTML += `
            <div class="${bgClass} text-white rounded d-flex justify-content-center align-items-center shadow-sm" 
                 style="width: 32px; height: 32px; font-size: 0.85rem; font-weight: bold; cursor: default;" 
                 title="Día ${dia}">
                ${dia}
            </div>
        `;
    }
}