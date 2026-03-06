<?php
session_start();
require_once 'clases/dashboard.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';

try {
    if ($action === 'getStats') {
        echo json_encode(Dashboard::obtenerEstadisticas());
    } else {
        echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>