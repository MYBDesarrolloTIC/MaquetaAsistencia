<?php
session_start();
require_once '../model/usuario.php'; 

header('Content-Type: application/json'); 

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if ($_SERVER["REQUEST_METHOD"] == "POST" && $data) {
    $nombre_usuario = trim($data['username']);
    $contra = trim($data['password']);

    if (empty($nombre_usuario) || empty($contra)) {
        echo json_encode(['status' => 0, 'message' => 'Campos vacíos']);
        exit();
    }

    $usuarioValido = Usuario::verificarLogin($nombre_usuario, $contra);

    if ($usuarioValido) {
        $_SESSION['IDusuario'] = $usuarioValido['IDusuario'];
        $_SESSION['nombre_usuario'] = $usuarioValido['nombre_usuario']; 
        $_SESSION['rol'] = $usuarioValido['Rol']; 
        
        // AQUÍ ESTÁ EL CAMBIO: Enviamos el rol dentro del JSON
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