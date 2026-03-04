<?php include '../includes/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 header-seccion">
    <div>
        <h1 class="text-black fw-bold mb-0">Control de Asistencia</h1>
        <p class="text-muted mb-0">Gestión de personal y revisión de jornadas.</p>
    </div>
</div>

<div class="card border-0 shadow-sm" id="lista-funcionarios-container">
    <div class="card-header bg-white border-bottom fw-bold d-flex text-muted py-3">
        <div class="col-2">RUT</div>
        <div class="col-3">Nombre Completo</div>
        <div class="col-2">Departamento</div>
        <div class="col-2">Turno</div>
        <div class="col-3 text-center">Acciones</div>
    </div>
    
    <div class="list-group list-group-flush" id="contenedor-funcionarios">
        <div class="list-group-item p-0 funcionario-item">
            <div class="d-flex align-items-center py-3 px-3 bg-white fila-visible">
                <div class="col-2 fw-semibold">12345678-9</div>
                <div class="col-3">Juan Pérez González</div>
                <div class="col-2">Informática</div>
                <div class="col-2"><span class="badge bg-dark text-white">Noche</span></div>
                <div class="col-3 text-center">
                    <button class="btn btn-sm btn-outline-primary me-2" data-bs-toggle="collapse" data-bs-target="#edit-func-1">
                        <i class="bi bi-pencil-square"></i> Ver / Editar
                    </button>
                </div>
            </div>
            <div id="edit-func-1" class="collapse bg-light border-top border-bottom">
                <div class="p-4 text-center text-muted">Aquí irá el calendario de asistencia del funcionario.</div>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>