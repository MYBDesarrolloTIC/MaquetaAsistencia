<?php
require_once 'clases/asistencia.php';

header('Content-Type: application/json; charset=utf-8');

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'registrarMarca':
            $codigo = $data['codigo'] ?? $data['codigo_tarjeta'] ?? $data['rut'] ?? '';
            $tipo = $data['tipo'] ?? $data['tipo_marca'] ?? '';
            
            if(empty($codigo)) {
                echo json_encode(['status' => 0, 'message' => 'El código llegó vacío al servidor.']);
                break;
            }

            $resultado = Asistencia::registrarMarca($codigo, $tipo);
            echo json_encode($resultado);
            break;
            
        case 'getAsistencia':
            $rut = $_GET['rut'] ?? '';
            $mes = $_GET['mes'] ?? date('m');
            $anio = $_GET['anio'] ?? date('Y');
            
            $datosMes = Asistencia::obtenerAsistenciaMes($rut, $mes, $anio);
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