<?php
require_once 'clases/asistencia.php';

header('Content-Type: application/json; charset=utf-8');

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'registrarMarca':
            $codigo = $data['codigo'] ?? '';
            $tipo = $data['tipo'] ?? '';
            $fotoBase64 = $data['foto'] ?? ''; 
            
            if(empty($codigo) || empty($tipo)) {
                echo json_encode(['status' => 0, 'message' => 'Faltan datos (Código o Tipo de Marca).']);
                break;
            }

            $resultado = Asistencia::registrarMarca($codigo, $tipo);
            
            if ($resultado['status'] == 1 && !empty($fotoBase64)) {
                $carpeta_fotos = __DIR__ . '/../assets/fotos_seguridad/';
                
                if (!file_exists($carpeta_fotos)) {
                    mkdir($carpeta_fotos, 0777, true);
                }
                $foto_parts = explode(";base64,", $fotoBase64);
                if (count($foto_parts) == 2) {
                    $foto_decoded = base64_decode($foto_parts[1]);
                    
                    $nombre_foto = date('Ymd_His') . '_' . preg_replace('/[^0-9]/', '', $codigo) . '_' . $tipo . '.jpg';
                    
                    file_put_contents($carpeta_fotos . $nombre_foto, $foto_decoded);
                }
            }

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