<?php
require_once 'clases/asistencia.php';

header('Content-Type: application/json; charset=utf-8');

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'registrarMarca':
            // Validamos que la pistola haya enviado algo y que haya un botón seleccionado
            if (empty($data['codigo']) || empty($data['tipo'])) {
                throw new Exception("Error: Código o tipo de marca ausente.");
            }
            
            // Le pasamos la tarea sucia a la Clase Asistencia
            $mensajeExito = Asistencia::registrar($data['codigo'], $data['tipo']);
            
            // Si todo sale bien, devolvemos el mensaje de saludo
            echo json_encode(['status' => 1, 'message' => $mensajeExito]);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>