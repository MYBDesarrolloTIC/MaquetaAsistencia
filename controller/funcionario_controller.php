<?php
session_start();
require_once __DIR__ . '/clases/funcionario.php';

header('Content-Type: application/json; charset=utf-8');

// Capturamos los datos que viajan desde JavaScript
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'getFuncionarios':
            echo json_encode(['status' => 1, 'data' => Funcionario::obtenerTodos()]);
            break;

        case 'createFuncionario':
            // 1. Atrapamos el código de la credencial que envía JavaScript
            $codigoCredencial = isset($data['codigo_tarjeta']) ? $data['codigo_tarjeta'] : $data['rut'] . rand(10000, 99999);

            // 2. Pasamos los 7 argumentos EXACTOS que espera la clase
            Funcionario::crear(
                $data['rut'], 
                $data['nombre'], 
                $data['apellidoP'], 
                $data['apellidoM'] ?? '', 
                $data['seccion'], 
                $data['turno'],
                $codigoCredencial // <--- ¡AQUÍ ESTÁ EL SÉPTIMO DATO FALTANTE!
            );
            echo json_encode(['status' => 1, 'message' => 'Funcionario enrolado con éxito.']);
            break;

        case 'updateFuncionario':
            Funcionario::actualizar(
                $data['rut'], 
                $data['nombre'], 
                $data['apellidoP'], 
                $data['apellidoM'], 
                $data['departamento'], 
                $data['turno']
            );
            echo json_encode(['status' => 1, 'message' => 'Funcionario actualizado con éxito.']);
            break;

        case 'deleteFuncionario':
            Funcionario::eliminar($data['rut']);
            echo json_encode(['status' => 1, 'message' => 'Funcionario eliminado del sistema.']);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>