/* =========================================================================
   VARIABLES GLOBALES
   ========================================================================= */
let funcionarioAborrarId = null;
let fechaActualVisualizacion = new Date(2026, 2, 1); // Inicializa en Marzo 2026
const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* =========================================================================
   INICIALIZACIÓN DEL DOCUMENTO (DOM Ready)
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
        const formLogin = document.getElementById("form_login");
    if (formLogin) {
        formLogin.addEventListener("submit", procesarLogin);
    }

    const calendarioEjemplo = document.getElementById("calendario-dias-1");
    if (calendarioEjemplo) {
        dibujarCalendario(1, fechaActualVisualizacion);
    }

    const btnBorrar = document.getElementById('btn-confirmar-borrar');
    if (btnBorrar) {
        btnBorrar.addEventListener('click', ejecutarBorrado);
    }
});

/* =========================================================================
   MÓDULO 1: LÓGICA DE LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("usuario").value;
    const passVal = document.getElementById("password").value;

    // Asumimos que validUser está definido en tu archivo api.js
    const vuser = await validUser(userVal, passVal);

    if (vuser.status === API_REQUEST_SUCCESS) {
        console.log("Datos que llegaron del PHP:", vuser.data);

        const rolUsuario = String(vuser.data.rol || 'usuario').toLowerCase().trim();
        console.log("Rol limpio que usará el IF:", rolUsuario);

        if (rolUsuario === 'superadmin') {
            window.location.href = "VistaInicio.html"; 
        } else if (rolUsuario === 'admin') {
            window.location.href = "VistaInicio.html"; 
        } else {
            window.location.href = "VistaEscaner.html"; 
        }
    } else {
        const alerta = document.getElementById("alertaError");
        if (alerta) {
            alerta.classList.remove('d-none'); // Mostramos la alerta oculta de Bootstrap
            alerta.innerText = vuser.message || vuser.data.message;
        } else {
            alert(vuser.message || vuser.data.message);
        }
    }
}

/* =========================================================================
   MÓDULO 2: LÓGICA DE BORRADO (CRUD)
   ========================================================================= */
function confirmarBorrado(idFuncionario) {
    funcionarioAborrarId = idFuncionario;
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

function ejecutarBorrado() {
    if(funcionarioAborrarId) {
        // Asumimos que api.eliminarFuncionario está en tu api.js
        /* api.eliminarFuncionario(funcionarioAborrarId)
            .then(respuesta => {
                alert("Funcionario eliminado correctamente.");
                location.reload(); 
            })
            .catch(error => console.error("Error al borrar:", error)); */
            
        // Simulación para maqueta:
        alert(`Simulación: Funcionario con ID ${funcionarioAborrarId} eliminado.`);
        location.reload();
    }
}

/* =========================================================================
   MÓDULO 3: CÁLCULO DE HORAS
   ========================================================================= */
function calcularHorasTrabajadas(fechaEntrada, fechaSalida, turnoHorasEsperadas) {
    if(!fechaSalida) return { estado: 'warning', horasTrabajadas: 0, horasFaltantes: turnoHorasEsperadas };

    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const diferenciaMs = salida - entrada;
    
    const horasTrabajadas = diferenciaMs / (1000 * 60 * 60);
    const horasFaltantes = turnoHorasEsperadas - horasTrabajadas;

    let estado = 'success';
    if (horasTrabajadas < (turnoHorasEsperadas - 0.25)) { 
        estado = 'warning';
    }
    
    return {
        estado: estado,
        horasTrabajadas: horasTrabajadas.toFixed(2),
        horasFaltantes: horasFaltantes > 0 ? horasFaltantes.toFixed(2) : 0
    };
}

/* =========================================================================
   MÓDULO 4: RENDERIZADO DEL CALENDARIO TRADICIONAL
   ========================================================================= */
function cambiarMes(direccion, idFuncionario) {
    fechaActualVisualizacion.setMonth(fechaActualVisualizacion.getMonth() + direccion);
    dibujarCalendario(idFuncionario, fechaActualVisualizacion);
}

function dibujarCalendario(idFuncionario, fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    document.getElementById(`mes-anio-${idFuncionario}`).innerText = `${nombresMeses[mes]} ${año}`;
    
    const contenedor = document.getElementById(`calendario-dias-${idFuncionario}`);
    contenedor.innerHTML = '';

    let primerDiaSemana = new Date(año, mes, 1).getDay();
    primerDiaSemana = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1; 
    
    const totalDiasMes = new Date(año, mes + 1, 0).getDate();

    // 1. Rellenar espacios vacíos antes del día 1
    for (let i = 0; i < primerDiaSemana; i++) {
        contenedor.innerHTML += `<div class="calendar-cell cell-empty"></div>`;
    }

    // 2. Dibujar los días con la estructura HTML tradicional (Número arriba, icono abajo)
    for (let dia = 1; dia <= totalDiasMes; dia++) {
        let estadoClase = 'cell-success'; 
        let icono = '<i class="bi bi-circle-fill text-success cell-indicator"></i>';
        let diaDeLaSemana = new Date(año, mes, dia).getDay();
        
        if (diaDeLaSemana === 0 || diaDeLaSemana === 6) {
            estadoClase = 'cell-empty';
            icono = '';
        } else {
            if (dia === 8 || dia === 15) {
                estadoClase = 'cell-warning';
                icono = '<i class="bi bi-circle-fill text-warning cell-indicator"></i>';
            }
            if (dia === 12 || dia === 23) {
                estadoClase = 'cell-danger';
                icono = '<i class="bi bi-circle-fill text-danger cell-indicator"></i>';
            }
        }

        contenedor.innerHTML += `
            <div class="calendar-cell ${estadoClase}" title="Día ${dia}">
                <span class="day-number">${dia}</span>
                ${icono}
            </div>
        `;
    }

    // 3. Rellenar espacios vacíos al final para que la tabla siempre sea rectangular
    const celdasTotales = primerDiaSemana + totalDiasMes;
    const celdasSobrantes = celdasTotales % 7;
    if (celdasSobrantes !== 0) {
        const celdasFaltantes = 7 - celdasSobrantes;
        for (let i = 0; i < celdasFaltantes; i++) {
            contenedor.innerHTML += `<div class="calendar-cell cell-empty"></div>`;
        }
    }
}
/* =========================================================================
   MÓDULO 5: LÓGICA DE ESCÁNER DE ASISTENCIA
   ========================================================================= */
const inputEscaner = document.getElementById('input-escaner');

if (inputEscaner) {
    const relojDigital = document.getElementById('reloj-digital');
    const fechaActual = document.getElementById('fecha-actual');
    
    // 1. Reloj en vivo (AHORA EN FORMATO 24 HRS)
    function actualizarReloj() {
        const ahora = new Date();
        
        // Agregamos { hour12: false } para forzar el formato 24h (ej. 16:05:12)
        relojDigital.innerText = ahora.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        
        fechaActual.innerText = ahora.toLocaleDateString('es-CL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    setInterval(actualizarReloj, 1000);
    actualizarReloj();

    // 2. Mantener el Foco
    document.addEventListener('click', () => {
        inputEscaner.focus();
    });

    // 3. Capturar el escaneo
    inputEscaner.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const codigoEscaneado = inputEscaner.value.trim();
            inputEscaner.value = ''; 
            
            if (codigoEscaneado !== '') {
                procesarAsistencia(codigoEscaneado);
            }
        }
    });
}

function procesarAsistencia(codigo) {
    
    // Formato 24 hrs para el registro (ej. 16:05)
    const horaRegistro = new Date().toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    
    const datosFuncionario = {
        rut: codigo,
        nombre: "Juan Pérez González",
        turnoNombre: "Diurno",
        turnoHorario: "08:00 - 17:00",
        tipoRegistro: "Entrada", 
        estado: "success" 
    };
    
    const resultadoDiv = document.getElementById('resultado-escaneo');
    resultadoDiv.classList.remove('d-none');
    
    document.getElementById('res-rut').innerText = datosFuncionario.rut;
    document.getElementById('res-nombre').innerText = datosFuncionario.nombre;
    
    // Le quitamos el "AM/PM" al HTML y solo dejamos la hora + "hrs"
    document.getElementById('res-hora').innerText = horaRegistro + " hrs";
    
    document.getElementById('res-turno').innerText = datosFuncionario.turnoNombre;
    document.getElementById('res-horario').innerText = datosFuncionario.turnoHorario;
    
    const alerta = document.getElementById('alerta-registro');
    alerta.className = `alert py-2 mb-4 fs-5 border-0 shadow-sm fw-bold alert-${datosFuncionario.estado}`;
    
    if(datosFuncionario.tipoRegistro === "Entrada") {
        alerta.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i> ¡Entrada Registrada!`;
    } else {
        alerta.innerHTML = `<i class="bi bi-box-arrow-left me-2"></i> ¡Salida Registrada!`;
    }

    setTimeout(() => {
        resultadoDiv.classList.add('d-none');
    }, 4000);
}