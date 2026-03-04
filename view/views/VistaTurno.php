<?php include '../includes/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
    <div>
        <h1 class="text-black fw-bold mb-0">Gestión de Turnos</h1>
        <p class="text-muted mb-0">Administra los horarios de jornada laboral del personal.</p>
    </div>
    <button class="btn btn-success fw-bold shadow-sm" onclick="abrirModalTurno()">
        <i class="bi bi-plus-circle me-2"></i> Nuevo Turno
    </button>
</div>

<div class="row g-4" id="contenedor-turnos"></div>

<div class="modal fade" id="modalFormTurno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-bottom-0">
                <h5 class="modal-title fw-bold text-primary" id="tituloModalTurno">
                    <i class="bi bi-clock-history me-2"></i> Registrar Nuevo Turno
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formTurno">
                    <input type="hidden" id="turno_id" value="">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre del Turno</label>
                        <input type="text" class="form-control" id="turno_nombre" placeholder="Ej. Diurno..." required>
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Hora Entrada</label>
                            <input type="time" class="form-control" id="turno_entrada" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Hora Salida</label>
                            <input type="time" class="form-control" id="turno_salida" required>
                        </div>
                    </div>
                    <div class="alert alert-info py-2 small d-flex align-items-center mb-0" id="alerta-calculo">
                        <i class="bi bi-info-circle-fill me-2 fs-5"></i>
                        <span>Complete las horas para calcular el total.</span>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success fw-bold px-4" onclick="guardarTurno()">
                    <i class="bi bi-check-circle me-1"></i> Guardar Turno
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalBorrarTurno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-top-danger-yb" style="border-top: 4px solid #dc3545;">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold">
                    <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Seguridad
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
                <p class="mb-0">¿Estás seguro que deseas eliminar este turno?</p>
                <p class="text-danger small fw-bold mt-2">Los funcionarios asignados a este turno quedarán sin horario.</p>
            </div>
            <div class="modal-footer border-0 bg-light justify-content-center">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" onclick="ejecutarBorrarTurno()">Sí, Eliminar</button>
            </div>
        </div>
    </div>
</div>

<script src="../../assets/js/script.js"></script>
<?php include '../includes/footer.php'; ?>