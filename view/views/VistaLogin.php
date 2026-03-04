<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - I. Municipalidad de Yerbas Buenas</title>    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css">
</head>
<body class="d-flex align-items-center justify-content-center vh-100 bg-light">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-sm-8 col-md-6 col-lg-4">
                <div class="card shadow p-4 border-0 border-top-danger-yb">
                    <div class="text-center mb-3">
                        <i class="bi bi-building text-primary" style="font-size: 3rem;"></i>
                    </div>

                    <div id="alertaError" class="alert alert-danger d-none text-center p-2 mb-3"></div>

                    <form id="form_login">
                        <h3 class="text-center fw-bold mb-4">Iniciar Sesión</h3>
                        <div class="mb-3">
                            <label for="usuario" class="form-label fw-semibold">Usuario:</label>
                            <input type="text" id="usuario" name="usuario" class="form-control" required>
                        </div>
                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">Contraseña:</label>
                            <input type="password" id="password" name="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">Entrar</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <script src="../../model/api.js"></script>
    <script src="../../assets/js/script.js"></script>
</body>
</html>