<?php include '../includes/header.php'; ?>

<div class="header-seccion">
    <div>
        <h1>Gestión de Turnos</h1>
        <p>Administra los distintos turnos laborales del sistema.</p>
    </div>
    <div>
        <button class="btn btn-light shadow-sm fs-5 px-4" onclick="abrirModalTurno()">
            <i class="bi bi-plus-circle me-2"></i> Nuevo Turno
        </button>
    </div>
</div>

<div class="row g-4" id="contenedor-turnos">
    </div>

<div class="modal fade" id="modalFormTurno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-bottom-0">
                <h5 class="modal-title fw-bold text-black" id="tituloModalTurno">
                    <i class="bi bi-clock-history me-2 text-danger-yb"></i> Registrar Nuevo Turno
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formTurno">
                    <input type="hidden" id="turno_id" value="">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre del Turno</label>
                        <input type="text" class="form-control" id="turno_nombre" placeholder="Ej. Mañana, Tarde..." required>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Hora de Entrada</label>
                            <input type="time" class="form-control" id="turno_entrada" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Hora de Salida</label>
                            <input type="time" class="form-control" id="turno_salida" required>
                        </div>
                    </div>
                    <div id="alerta-calculo" class="alert alert-info py-2 small d-flex align-items-center mb-0">
                        <i class="bi bi-info-circle-fill me-2 fs-5"></i><span>Complete las horas para calcular.</span>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn text-white fw-bold px-4" style="background-color: var(--yb-blue);" onclick="guardarTurno()">
                    <i class="bi bi-check-circle me-1"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalBorrarTurno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-exclamation-triangle-fill text-danger-yb me-2"></i>Atención</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body text-center py-4">
                <p class="mb-0 fs-5">¿Deseas eliminar este turno?</p>
                <p class="text-danger-yb small fw-bold mt-2">Esta acción es irreversible.</p>
            </div>
            <div class="modal-footer border-0 bg-light justify-content-center">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger fw-bold" style="background-color: var(--yb-red); border-color: var(--yb-red);" onclick="ejecutarBorrarTurno()">Sí, Eliminar</button>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>