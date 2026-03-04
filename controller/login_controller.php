<?php
session_start();
require_once 'clases/usuario.php';

// =========================================================================
// 1. CERRAR SESIÓN (Si recibe ?action=logout por la URL)
// =========================================================================
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION = array();
    session_destroy();
    header("Location: ../view/views/VistaLogin.php");
    exit();
}

// =========================================================================
// 2. INICIAR SESIÓN (Si recibe datos por POST desde tu JS)
// =========================================================================
header('Content-Type: application/json'); 

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if ($_SERVER["REQUEST_METHOD"] == "POST" && $data) {
    
    $nombre_usuario = trim($data['username'] ?? '');
    $contra = trim($data['password'] ?? '');

    if (empty($nombre_usuario) || empty($contra)) {
        echo json_encode(['status' => 0, 'message' => 'Campos vacíos']);
        exit();
    }

    $usuarioValido = Usuario::verificarLogin($nombre_usuario, $contra);

    if ($usuarioValido) {
        $_SESSION['IDusuario'] = $usuarioValido['IDusuario'];
        $_SESSION['nombre_usuario'] = $usuarioValido['nombre_usuario']; 
        $_SESSION['rol'] = $usuarioValido['Rol']; 
        
        echo json_encode([
            'status' => 1, 
            'message' => 'Login exitoso', 
            'rol' => $usuarioValido['Rol'] 
        ]);
        exit();
    } else {
        echo json_encode(['status' => 0, 'message' => 'Usuario o contraseña incorrectos']);
        exit();
    }
} else {
    echo json_encode(['status' => 0, 'message' => 'Método no permitido']);
    exit();
}
?>