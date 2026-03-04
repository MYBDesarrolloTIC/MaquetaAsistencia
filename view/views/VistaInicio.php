<?php include '../includes/header.php'; ?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3 header-seccion">
        <div>
            <h1 class="text-black fw-bold mb-0">Panel de Inicio</h1>
            <p class="text-muted mb-0">Resumen general del Sistema de Control de Asistencia.</p>
        </div>
        <div class="text-end text-black fw-semibold">
            <i class="bi bi-calendar3 me-2 text-danger-yb"></i> Panel Activo
        </div>
    </div>

    <div class="row g-4 mb-5">
        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card card-dashboard h-100 border-0 shadow-sm border-start-blue">
                <div class="card-body d-flex align-items-center">
                    <div class="icon-shape bg-blue-yb-light text-blue-yb me-3">
                        <i class="bi bi-people-fill"></i>
                    </div>
                    <div><h6 class="text-muted mb-1 fw-semibold">Total Funcionarios</h6></div>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card card-dashboard h-100 border-0 shadow-sm border-start-success">
                <div class="card-body d-flex align-items-center">
                    <div class="icon-shape bg-success-light text-success me-3">
                        <i class="bi bi-person-check-fill"></i>
                    </div>
                    <div><h6 class="text-muted mb-1 fw-semibold">Presentes Hoy</h6></div>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card card-dashboard h-100 border-0 shadow-sm border-start-danger">
                <div class="card-body d-flex align-items-center">
                    <div class="icon-shape bg-danger-yb-light text-danger-yb me-3">
                        <i class="bi bi-person-x-fill"></i>
                    </div>
                    <div><h6 class="text-muted mb-1 fw-semibold">Atrasos Hoy</h6></div>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card card-dashboard h-100 border-0 shadow-sm border-start-warning">
                <div class="card-body d-flex align-items-center">
                    <div class="icon-shape bg-warning-light text-warning-dark me-3">
                        <i class="bi bi-file-earmark-medical-fill"></i>
                    </div>
                    <div><h6 class="text-muted mb-1 fw-semibold">Licencias Activas</h6></div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-12">
            <div class="card border-0 shadow-sm p-4 h-100 border-top-danger-yb">
                <h4 class="text-black fw-bold mb-4">Avisos del Sistema</h4>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-2">
                        <i class="bi bi-info-circle-fill text-danger-yb me-3 mt-1 fs-5"></i>
                        <div class="ms-2 me-auto">
                            <div class="fw-bold">Cierre de mes pendiente</div>
                            <span class="text-muted">Recuerde que el cálculo de horas mensuales debe realizarse antes del día 5.</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>