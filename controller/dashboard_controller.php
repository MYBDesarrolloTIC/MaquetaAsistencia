
<?php
session_start();
require_once 'clases/dashboard.php';

header('Content-Type: application/json; charset=utf-8');

// Opcional: Bloqueo para que solo usuarios logueados lo vean
if (!isset($_SESSION['IDusuario'])) {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado.']);
    exit();
}

$action = $_GET['action'] ?? '';

try {
    if ($action === 'getStats') {
        $estadisticas = Dashboard::obtenerEstadisticas();
        echo json_encode(['status' => 1, 'data' => $estadisticas]);
    } else {
        echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>
