<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Asistencia - Municipalidad de Yerbas Buenas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body>
    <div class="d-flex h-100 vh-100">

        <nav class="sidebar bg-white border-end d-flex flex-column">

            <div class="text-center p-4 border-bottom">
                <i class="bi bi-person-circle user-icon-menu fs-1 text-primary"></i>
                <h5 class="mt-3 text-black fw-bold mb-0">Administrador</h5>
                <small class="text-muted">Mun. Yerbas Buenas</small>
            </div>
            <div class="list-group list-group-flush flex-grow-1 mt-2">
                <a href="VistaAsistencia.php" class="list-group-item list-group-item-action">
                    <i class="bi bi-clock-history me-2"></i> Control Asistencia
                </a>
                <a href="VistaSecciones.php" class="list-group-item list-group-item-action">
                    <i class="bi bi-building me-2"></i> Secciones
                </a>
                <a href="VistaTurno.php" class="list-group-item list-group-item-action">
                    <i class="bi bi-calendar-check me-2"></i> Turnos
                </a>
                <a href="VistaEnrolar.php" class="list-group-item list-group-item-action">
                    <i class="bi bi-person-plus-fill me-2"></i> Enrolar
                </a>
                </a>
                <?php if (isset($_SESSION['rol']) && $_SESSION['rol'] === 'superadmin'): ?>
                    <a href="VistaUsuario.php" class="nav-link">
                        <i class="bi bi-people"></i> Usuarios
                    </a>
                <?php endif; ?>
                <a href="VistaEscaner.php" class="list-group-item list-group-item-action">
                    <i class="bi bi-building me-2"></i> Escaner
                </a>
            </div>
            <div class="p-3 border-top">
                <a href="../../controller/login_controller.php?action=logout" class="btn btn-outline-danger w-100 fw-bold">
                <i class="bi bi-box-arrow-left me-2"></i> Cerrar Sesión
                </a>
            </div>
        </nav>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>