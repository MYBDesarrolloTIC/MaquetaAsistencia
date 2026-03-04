<?php
session_start();
require_once 'clases/turno.php';

header('Content-Type: application/json; charset=utf-8');

$rol = $_SESSION['rol'] ?? '';
if ($rol !== 'admin' && $rol !== 'superadmin') {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. No tienes permisos para gestionar turnos.']);
    exit();
}

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'getTurnos':
            echo json_encode(['status' => 1, 'data' => Turno::obtenerTodos()]);
            break;

        case 'createTurno':
            Turno::crearTurno($data['nombre'], $data['hora_entrada'], $data['hora_salida']);
            echo json_encode(['status' => 1, 'message' => 'Turno creado con éxito.']);
            break;

        case 'updateTurno':
            Turno::actualizarTurno($data['id'], $data['nombre'], $data['hora_entrada'], $data['hora_salida']);
            echo json_encode(['status' => 1, 'message' => 'Turno actualizado correctamente.']);
            break;

        case 'deleteTurno':
            Turno::eliminarTurno($data['id']);
            echo json_encode(['status' => 1, 'message' => 'Turno eliminado.']);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>