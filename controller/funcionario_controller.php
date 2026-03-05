<?php
session_start();
require_once 'clases/funcionario.php'; 

header('Content-Type: application/json; charset=utf-8');

$rol = $_SESSION['rol'] ?? '';
if ($rol !== 'admin' && $rol !== 'superadmin') {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado.']);
    exit();
}

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'getFuncionarios':
            echo json_encode(['status' => 1, 'data' => Funcionario::obtenerTodos()]);
            break;

        case 'createFuncionario':
            // Ahora recibe 'seccion' en lugar de 'departamento'
            Funcionario::crear($data['rut'], $data['nombre'], $data['apellidoP'], $data['apellidoM'], $data['seccion'], $data['turno']);
            echo json_encode(['status' => 1, 'message' => 'Funcionario enrolado con éxito.']);
            break;

        case 'updateFuncionario':
            Funcionario::actualizar($data['rut'], $data['nombre'], $data['apellidoP'], $data['apellidoM'], $data['seccion'], $data['turno']);
            echo json_encode(['status' => 1, 'message' => 'Datos actualizados correctamente.']);
            break;

        case 'deleteFuncionario':
            Funcionario::eliminar($data['rut']);
            echo json_encode(['status' => 1, 'message' => 'Funcionario eliminado.']);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>