<?php include '../includes/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
    <div>
        <h1 class="text-black fw-bold mb-0">Enrolamiento de Funcionario</h1>
        <p class="text-muted mb-0">Registra un nuevo trabajador y asigna su credencial de acceso.</p>
    </div>
    <a href="VistaAsistencia.php" class="btn btn-outline-secondary fw-bold shadow-sm">
        <i class="bi bi-arrow-left me-2"></i> Volver a la Lista
    </a>
</div>

<div class="row g-4">
    <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm h-100 border-top-danger-yb">
            <div class="card-body p-4 p-md-5">
                <h4 class="fw-bold text-blue-yb mb-4"><i class="bi bi-person-lines-fill me-2"></i>Datos del Funcionario</h4>
                <form id="form-enrolar">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">RUT</label>
                            <input type="text" class="form-control" id="enrolar_rut" placeholder="Ej. 12345678-9" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Nombres</label>
                            <input type="text" class="form-control" id="enrolar_nombres" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Apellido Paterno</label>
                            <input type="text" class="form-control" id="enrolar_ap_paterno" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Apellido Materno</label>
                            <input type="text" class="form-control" id="enrolar_ap_materno">
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Departamento</label>
                            <select class="form-select" id="enrolar_departamento" required>
                                <option value="" selected disabled>Seleccione un departamento...</option>
                                <option value="1">Alcaldía</option>
                                <option value="2">Finanzas</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Turno Asignado</label>
                            <select class="form-select" id="enrolar_turno" required>
                                <option value="" selected disabled>Seleccione un turno...</option>
                            </select>
                        </div>
                    </div>
                    <hr class="mb-4 text-muted">
                    <div class="d-grid">
                        <button type="button" class="btn btn-primary btn-lg fw-bold shadow-sm" onclick="guardarNuevoFuncionario()">
                            <i class="bi bi-save me-2"></i> Guardar Funcionario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4 p-md-5 text-center d-flex flex-column justify-content-center">
                <h4 class="fw-bold text-black mb-2">Asignar Credencial</h4>
                <p class="text-muted small mb-4">Pase la nueva tarjeta o código por el lector láser.</p>

                <div class="scan-zone rounded-4 p-5 mb-4 mx-auto bg-light" id="zona-escaner-enrolar" style="max-width: 300px; cursor: pointer;" onclick="document.getElementById('enrolar_codigo').focus()">
                    <i class="bi bi-upc-scan text-primary" style="font-size: 5rem;"></i>
                    <h5 class="fw-bold mt-3 text-muted" id="texto-espera">Esperando lectura...</h5>
                </div>

                <div class="input-group mb-3">
                    <span class="input-group-text bg-light text-muted"><i class="bi bi-credit-card-2-front"></i></span>
                    <input type="text" class="form-control fw-bold text-center fs-5" id="enrolar_codigo" placeholder="Código de la credencial" readonly>
                    <button class="btn btn-outline-danger" type="button" onclick="limpiarCodigo()" title="Limpiar código"><i class="bi bi-x-circle"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>