<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal de Asistencia - Municipalidad de Yerbas Buenas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css">
    <script src="https://unpkg.com/html5-qrcode"></script>
</head>
<body class="bg-light d-flex flex-column vh-100">

    <nav class="navbar bg-white px-4 py-3 shadow-sm" style="border-bottom: 3px solid var(--yb-red) !important;">
        <div class="container-fluid d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <i class="bi bi-building fs-2 me-3" style="color: var(--yb-red);"></i>
                <div>
                    <h5 class="mb-0 fw-bold text-black">I. Municipalidad de Yerbas Buenas</h5>
                    <small class="text-muted">Sistema de Control de Asistencia</small>
                </div>
            </div>
        </div>
    </nav>

    <main class="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
        
        <div class="text-center mb-4">
            <div id="reloj-digital" class="display-1 fw-bold" style="color: var(--yb-red); font-variant-numeric: tabular-nums; letter-spacing: -2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.05);">
                00:00:00
            </div>
            <h4 id="fecha-actual" class="text-muted fw-semibold mt-2 text-capitalize">Cargando fecha...</h4>
        </div>

        <div class="card border-0 shadow-lg p-4 p-md-5 mb-4 text-center" style="max-width: 600px; width: 100%; border-top: 6px solid var(--yb-red) !important;">
            <h4 class="text-black fw-bold mb-4">Pase su credencial por el lector</h4>
            
            <button type="button" class="btn btn-outline-secondary fw-bold mb-3 w-100" id="btnToggleCamara" onclick="toggleCamaraEscaner()">
                <i class="bi bi-camera-video me-2"></i> Usar Cámara del PC
            </button>
            <div id="reader-container" class="mb-3" style="display: none;">
                <div id="reader" width="100%"></div>
            </div>

            <form id="form_marcar_asistencia">
                <div class="input-group input-group-lg mb-4 shadow-sm">
                    <span class="input-group-text bg-light border-end-0" style="color: var(--yb-red);">
                        <i class="bi bi-upc-scan fs-4"></i>
                    </span>
                    <input type="text" id="codigo_tarjeta" class="form-control text-center fw-bold fs-4 border-start-0" placeholder="Esperando lectura..." autofocus autocomplete="off" style="caret-color: transparent;">
                </div>
                
                <div class="btn-group w-100 mb-2 shadow-sm" role="group" aria-label="Tipo de asistencia">
                    <input type="radio" class="btn-check" name="tipo_marca" id="marcaEntrada" value="entrada" autocomplete="off" checked>
                    <label class="btn btn-outline-success fw-bold py-3 fs-5" for="marcaEntrada">
                        <i class="bi bi-box-arrow-in-right d-block mb-1 fs-3"></i> Entrada
                    </label>
                    
                    <input type="radio" class="btn-check" name="tipo_marca" id="marcaSalida" value="salida" autocomplete="off">
                    <label class="btn btn-outline-primary fw-bold py-3 fs-5" for="marcaSalida" style="--bs-btn-color: var(--yb-blue); --bs-btn-border-color: var(--yb-blue); --bs-btn-hover-bg: var(--yb-blue); --bs-btn-active-bg: var(--yb-blue);">
                        <i class="bi bi-box-arrow-left d-block mb-1 fs-3"></i> Salida
                    </label>
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