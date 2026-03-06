<?php include '../includes/header.php'; ?>

<div class="header-seccion">
    <div>
        <h1>Gestión de Secciones</h1>
        <p>Administra las distintas direcciones y áreas municipales.</p>
    </div>
    <div>
        <button class="btn btn-light shadow-sm fs-5 px-4" onclick="abrirModalNuevaSeccion()">
            <i class="bi bi-plus-circle me-2"></i> Nueva Sección
        </button>
    </div>
</div>

<div class="row g-4" id="contenedor-secciones"></div>

<div class="modal fade" id="modalFormSeccion" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-bottom-0">
                <h5 class="modal-title fw-bold text-black" id="tituloModalSeccion">
                    <i class="bi bi-building-add me-2 text-danger-yb"></i> Formulario de Sección
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formSeccion">
                    <input type="hidden" id="seccion_id" value="">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre de la Sección</label>
                        <input type="text" class="form-control" id="seccion_nombre" placeholder="Ej. DIDECO, Tránsito, Salud..." required>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn text-white fw-bold px-4" style="background-color: var(--yb-blue);" onclick="guardarSeccion()">
                    <i class="bi bi-check-circle me-1"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalBorrar" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-exclamation-triangle-fill text-danger-yb me-2"></i>Atención</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
                <p class="mb-0 fs-5">¿Estás seguro que deseas eliminar este registro?</p>
                <p class="text-danger-yb small fw-bold mt-2">Esta acción es irreversible.</p>
            </div>
            <div class="modal-footer border-0 bg-light justify-content-center">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger fw-bold" style="background-color: var(--yb-red); border-color: var(--yb-red);" onclick="ejecutarBorrado()">Sí, Eliminar</button>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>