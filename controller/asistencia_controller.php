<?php
require_once 'clases/asistencia.php';

header('Content-Type: application/json; charset=utf-8');

// Capturamos los datos que viajan desde JavaScript
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        
        // 1. Escucha a la Pistola Láser
        case 'registrarMarca':
            $resultado = Asistencia::registrar($data['codigo'], $data['tipo']);
            echo json_encode($resultado);
            break;

        // 2. Escucha al Calendario
        case 'getAsistencia':
            $rut = $_GET['rut'] ?? '';
            $mes = $_GET['mes'] ?? date('m');
            $anio = $_GET['anio'] ?? date('Y');
            
            $datosMes = Asistencia::obtenerAsistenciaMes($rut, $mes, $anio);
            // Devuelve los datos listos para pintar
            echo json_encode(['status' => 1, 'data' => $datosMes]);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'No reconozco la acción: ' . $action]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>