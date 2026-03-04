/* =========================================================================
   VARIABLES GLOBALES
   ========================================================================= */
let turnoABorrarId = null;
let modalFormTurnoInstance = null;
let modalBorrarTurnoInstance = null;

/* =========================================================================
   INICIALIZACIÓN DEL DOCUMENTO (DOM Ready)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Listeners para el Login
    const formLogin = document.getElementById("form_login");
    if (formLogin) {
        formLogin.addEventListener("submit", procesarLogin);
    }

    // 2. Inicializar modales de Turnos (si existen en la vista)
    const formModalEl = document.getElementById('modalFormTurno');
    if (formModalEl) modalFormTurnoInstance = new bootstrap.Modal(formModalEl);

    const borrarModalEl = document.getElementById('modalBorrarTurno');
    if (borrarModalEl) modalBorrarTurnoInstance = new bootstrap.Modal(borrarModalEl);

    // 3. Eventos de la calculadora de horas en el formulario de Turnos
    const inputEntrada = document.getElementById('turno_entrada');
    const inputSalida = document.getElementById('turno_salida');
    if (inputEntrada && inputSalida) {
        inputEntrada.addEventListener('change', calcularTiempoJornadaFormulario);
        inputSalida.addEventListener('change', calcularTiempoJornadaFormulario);
    }

    // 4. Cargar las tarjetas apenas carga la pantalla de Turnos
    const contenedorTurnos = document.getElementById('contenedor-turnos');
    if(contenedorTurnos) {
        cargarTarjetasTurnos();
    }
});

/* =========================================================================
   MÓDULO 1: LÓGICA DE LOGIN
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
   MÓDULO 2: GESTIÓN DE TURNOS (CRUD Y RENDERIZADO)
   ========================================================================= */

async function cargarTarjetasTurnos() {
    const contenedor = document.getElementById('contenedor-turnos');
    if (!contenedor) return;
    
    // Llamada real al servidor PHP
    const respuesta = await apiTurnos.getTurnos();
    contenedor.innerHTML = ''; 

    if (respuesta.status === 1 && respuesta.data.length > 0) {
        respuesta.data.forEach(turno => {
            const total = calcularHorasUI(turno.hora_entrada, turno.hora_salida);
            // Inyectamos el ID real de la base de datos en los botones (turno.IDturno)
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

// --------------------------------------------------
// Controles de los Modales de Turnos
// --------------------------------------------------
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

    // Llamada real al servidor PHP para crear o editar
    if (id) {
        datos.id = id;
        respuesta = await apiTurnos.updateTurno(datos);
    } else {
        respuesta = await apiTurnos.createTurno(datos);
    }

    if (respuesta.status === 1) {
        modalFormTurnoInstance.hide();
        cargarTarjetasTurnos(); // Refresca las tarjetas en tiempo real
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
            cargarTarjetasTurnos(); // Refresca las tarjetas en tiempo real
        } else {
            alert(respuesta.message);
        }
    }
}

// --------------------------------------------------
// Calculadoras de Tiempo
// --------------------------------------------------
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