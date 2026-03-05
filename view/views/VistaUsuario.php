<?php include '../includes/header.php'; ?>

<main class="main-content flex-grow-1 p-4 p-md-5 overflow-auto">
    
    <div class="header-seccion d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="fs-3 fw-bold mb-1">Gestión de Usuarios</h1>
            <p class="mb-0 fs-6">Administra las cuentas y niveles de acceso al sistema.</p>
        </div>
        <div>
            <button class="btn btn-light shadow-sm text-dark fw-bold" onclick="abrirModalUsuario()">
                <i class="bi bi-person-plus-fill me-2"></i> Nuevo Usuario
            </button>
        </div>
    </div>

    <div class="card border-0 shadow-sm border-top-danger-yb">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light text-muted small">
                        <tr>
                            <th class="ps-4 py-3">Nombre Completo</th>
                            <th class="py-3">Usuario (Login)</th>
                            <th class="py-3">Rol</th>
                            <th class="py-3">Estado</th>
                            <th class="text-end pe-4 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-usuarios">
                        <tr>
                            <td colspan="5" class="text-center py-5 text-muted">
                                <div class="spinner-border spinner-border-sm text-danger-yb me-2" role="status"></div>
                                Cargando usuarios...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<div class="modal fade" id="modalFormUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-bottom-0">
                <h5 class="modal-title fw-bold text-black" id="tituloModalUsuario">
                    <i class="bi bi-person-badge me-2 text-danger-yb"></i> <span id="textoTituloModal">Registrar Usuario</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formUsuario">
                    <input type="hidden" id="usuario_id" value="">
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre Completo</label>
                        <input type="text" class="form-control" id="usuario_nombre" placeholder="Ej. Juan Pérez" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre de Usuario</label>
                        <input type="text" class="form-control" id="usuario_login" placeholder="Ej. jperez o RUT" required>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Contraseña <span id="hint-password" class="fw-normal fst-italic text-secondary" style="display:none;">(Dejar en blanco para no cambiar)</span></label>
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted"><i class="bi bi-key"></i></span>
                            <input type="password" class="form-control" id="usuario_password" placeholder="******">
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Rol en el Sistema</label>
                            <select class="form-select" id="usuario_rol" required>
                                <option value="Administrador">Administrador</option>
                                <option value="Operador">Operador (Solo lectura/Terminal)</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Estado</label>
                            <select class="form-select" id="usuario_estado" required>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn text-white fw-bold px-4" style="background-color: var(--yb-blue);" onclick="guardarUsuario()">
                    <i class="bi bi-check-circle me-1"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalBorrarUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-body text-center py-4">
                <i class="bi bi-exclamation-circle text-danger-yb display-4 d-block mb-3"></i>
                <h5 class="fw-bold text-black mb-2">¿Eliminar Usuario?</h5>
                <p class="text-muted small mb-4">Esta acción no se puede deshacer y el usuario perderá su acceso al sistema.</p>
                <input type="hidden" id="delete_usuario_id">
                <div class="d-flex justify-content-center gap-2">
                    <button type="button" class="btn btn-light fw-bold px-4" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn fw-bold px-4 text-white" style="background-color: var(--yb-red);" onclick="ejecutarBorrarUsuario()">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>