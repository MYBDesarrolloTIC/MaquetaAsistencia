<?php include '../includes/header.php'; ?>

<main class="main-content flex-grow-1 p-4 p-md-5 overflow-auto">
            
            <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h1 class="text-black fw-bold mb-0">Gestión de Departamentos</h1>
                    <p class="text-muted mb-0">Administra las distintas direcciones y áreas municipales.</p>
                </div>
                <!-- Botón Oscuro para mantener la estética -->
                <button class="btn btn-dark fw-bold shadow-sm" onclick="abrirModalDepto()">
                    <i class="bi bi-plus-circle me-2"></i> Nuevo Departamento
                </button>
            </div>

            <!-- Grilla de Tarjetas de Departamentos -->
            <div class="row g-4" id="contenedor-deptos">
                
                <!-- TARJETA 1 -->
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card bg-white border-0 shadow-sm card-depto h-100">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="icon-depto me-3">
                                    <i class="bi bi-building"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold text-black mb-0">Alcaldía</h5>
                                    <small class="text-muted">Administración Central</small>
                                </div>
                            </div>
                            <div class="bg-light p-3 rounded mb-0 d-flex justify-content-between align-items-center border">
                                <span class="text-muted fw-bold small">Personal Asignado</span>
                                <span class="badge bg-dark fs-6">15 <i class="bi bi-people-fill ms-1"></i></span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button class="btn btn-sm btn-outline-dark flex-grow-1 fw-bold" onclick="editarDepto(1, 'Alcaldía')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarDepto(1)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TARJETA 2 -->
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card bg-white border-0 shadow-sm card-depto h-100">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="icon-depto me-3">
                                    <i class="bi bi-cash-coin"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold text-black mb-0">Finanzas</h5>
                                    <small class="text-muted">Dir. de Adm. y Finanzas</small>
                                </div>
                            </div>
                            <div class="bg-light p-3 rounded mb-0 d-flex justify-content-between align-items-center border">
                                <span class="text-muted fw-bold small">Personal Asignado</span>
                                <span class="badge bg-dark fs-6">8 <i class="bi bi-people-fill ms-1"></i></span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button class="btn btn-sm btn-outline-dark flex-grow-1 fw-bold" onclick="editarDepto(2, 'Finanzas')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarDepto(2)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- TARJETA 3 -->
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card bg-white border-0 shadow-sm card-depto h-100">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="icon-depto me-3">
                                    <i class="bi bi-cone-striped"></i>
                                </div>
                                <div>
                                    <h5 class="fw-bold text-black mb-0">Obras Municipales</h5>
                                    <small class="text-muted">Dirección de Obras (DOM)</small>
                                </div>
                            </div>
                            <div class="bg-light p-3 rounded mb-0 d-flex justify-content-between align-items-center border">
                                <span class="text-muted fw-bold small">Personal Asignado</span>
                                <span class="badge bg-dark fs-6">22 <i class="bi bi-people-fill ms-1"></i></span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button class="btn btn-sm btn-outline-dark flex-grow-1 fw-bold" onclick="editarDepto(3, 'Obras Municipales')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarDepto(3)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    </div>

    <!-- ==========================================
         MODAL CREAR / EDITAR DEPARTAMENTO
         ========================================== -->
    <div class="modal fade" id="modalFormDepto" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-light border-bottom-0">
                    <h5 class="modal-title fw-bold text-black" id="tituloModalDepto">
                        <i class="bi bi-building-add me-2 text-danger-yb"></i> Registrar Nuevo Departamento
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <form id="formDepto">
                        <input type="hidden" id="depto_id" value="">
                        <div class="mb-3">
                            <label class="form-label fw-bold small text-muted">Nombre del Departamento</label>
                            <input type="text" class="form-control" id="depto_nombre" placeholder="Ej. DIDECO, Tránsito, Salud..." required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                    <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-dark fw-bold px-4" onclick="guardarDepto()">
                        <i class="bi bi-check-circle me-1"></i> Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- ==========================================
         MODAL BORRAR DEPARTAMENTO
         ========================================== -->
    <div class="modal fade" id="modalBorrarDepto" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-top-danger-yb">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title text-black fw-bold"><i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Atención</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center py-4">
                    <p class="mb-0 fs-5">¿Estás seguro que deseas eliminar este departamento?</p>
                    <p class="text-danger small fw-bold mt-2">Asegúrate de reasignar a los funcionarios a otra área antes de proceder.</p>
                </div>
                <div class="modal-footer border-0 bg-light justify-content-center">
                    <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger fw-bold" onclick="ejecutarBorrarDepto()">Sí, Eliminar</button>
                </div>
            </div>
        </div>
    </div>

    <?php include '../includes/footer.php'; ?>