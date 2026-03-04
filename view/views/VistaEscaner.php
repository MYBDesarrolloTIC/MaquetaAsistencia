<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reloj Control - Municipalidad de Yerbas Buenas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body class="bg-light d-flex flex-column vh-100">

    <nav class="navbar bg-white border-bottom shadow-sm px-4 py-3">
        <div class="d-flex align-items-center">
            <i class="bi bi-building text-primary fs-2 me-3"></i>
            <div>
                <h5 class="mb-0 fw-bold">I. Municipalidad de Yerbas Buenas</h5>
                <small class="text-muted">Sistema de Control de Asistencia</small>
            </div>
        </div>
        <a href="VistaLogin.php" class="btn btn-outline-danger btn-sm fw-bold">
            <i class="bi bi-box-arrow-left me-1"></i> Salir del Terminal
        </a>
    </nav>

    <main class="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
        
        <div class="text-center mb-5">
            <div id="reloj-digital" class="display-1 fw-bold text-primary" style="font-variant-numeric: tabular-nums;">
                00:00:00
            </div>
            <h4 id="fecha-actual" class="text-muted fw-semibold mt-2">Cargando fecha...</h4>
        </div>

        <div class="card border-0 shadow-lg p-4 p-md-5 mb-4 text-center" style="max-width: 600px; width: 100%; border-top: 8px solid #0d6efd !important;">
            <h4 class="text-black fw-bold mb-4">Pase su credencial por el lector</h4>
            
            <form id="form_marcar_asistencia">
                <div class="input-group input-group-lg mb-4">
                    <span class="input-group-text bg-light text-primary"><i class="bi bi-upc-scan fs-4"></i></span>
                    <input type="text" id="codigo_tarjeta" class="form-control text-center fw-bold fs-4" placeholder="Esperando lectura..." autofocus autocomplete="off">
                </div>
                
                <div class="d-flex justify-content-center gap-4 mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="tipo_marca" id="marcaEntrada" value="entrada" checked>
                        <label class="form-check-label fw-bold" for="marcaEntrada">Entrada</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="tipo_marca" id="marcaSalida" value="salida">
                        <label class="form-check-label fw-bold" for="marcaSalida">Salida</label>
                    </div>
                </div>
                <button type="submit" class="d-none">Enviar Oculto</button>
            </form>

            <div id="alertaAsistencia" style="display: none;" role="alert"></div>
        </div>
    </main>

    <script src="../../model/api.js"></script>
    <script src="../../assets/js/script.js"></script>
</body>
</html>