<?php include '../includes/header.php'; ?>

<div class="d-flex h-100 vh-100">
    <main class="main-content flex-grow-1 p-4 p-md-5 overflow-auto">
        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 header-seccion">
            <div>
                <h1 class="text-black fw-bold mb-0">Control de Asistencia</h1>
                <p class="text-muted mb-0">Gestión de personal y revisión de jornadas laborales.</p>
            </div>
        </div>

        <div class="card border-0 shadow-sm card-dashboard" id="lista-funcionarios-container">
            <div class="card-header bg-white border-bottom fw-bold d-flex text-muted py-3">
                <div class="col-2">RUT</div>
                <div class="col-3">Nombre Completo</div>
                <div class="col-2">Seccion</div>
                <div class="col-2">Turno</div>
                <div class="col-3 text-center">Acciones</div>
            </div>
            
            <div class="list-group list-group-flush" id="contenedor-funcionarios"></div>
        </div>
    </main>
</div>

<div class="modal fade" id="modalBorrar" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Seguridad</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
                <p class="mb-0 fs-5">¿Estás seguro que deseas eliminar a este funcionario?</p>
            </div>
            <div class="modal-footer border-0 bg-light justify-content-center">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger fw-bold px-4" id="btn-confirmar-borrar">Sí, Eliminar</button>
            </div>
        </div>
    </div>
</div>
<?php include '../includes/footer.php'; ?>