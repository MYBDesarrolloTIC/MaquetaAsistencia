<?php
session_start();
require_once __DIR__ . '/../config/conexion.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

try {
    $pdo = Conexion::conectar();

    if ($action === 'exportar') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="Respaldo_Asistencia_' . date('Ymd_His') . '.csv"');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['RUT', 'Fecha', 'Hora', 'Tipo Marca']);
        $stmt = $pdo->query("SELECT rut_funcionario, fecha, hora, tipo_marca FROM asistencia ORDER BY fecha DESC");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) { fputcsv($output, $row); }
        fclose($output);
        exit;
    }

    if ($action === 'importar') {
        if (!isset($_FILES['archivo_csv'])) {
            die(json_encode(['status' => 0, 'message' => 'No se subió el archivo.']));
        }

        $lineas = file($_FILES['archivo_csv']['tmp_name']);
        if (empty($lineas)) {
            die(json_encode(['status' => 0, 'message' => 'El archivo está vacío.']));
        }

        $primeraLinea = $lineas[0];
        $delimitador = (substr_count($primeraLinea, ';') > substr_count($primeraLinea, ',')) ? ';' : ',';
        
        $agrupacion = [];

        foreach ($lineas as $num => $texto) {
            $col = str_getcsv(trim($texto), $delimitador);
            if ($num === 0 || count($col) < 3) continue;

            $rut = strtoupper(preg_replace('/[^0-9Kk]/', '', $col[0]));
            $fecha = date('Y-m-d', strtotime(str_replace('/', '-', $col[1])));
            $hora = date('H:i:s', strtotime($col[2]));

            if ($rut && $fecha != '1970-01-01') {
                $agrupacion[$rut][$fecha][] = $hora;
            }
        }

        /**
         * Actualmente se crea una tabla extra para poder añadir esta exportacion pero provoca conflictos
         * en la tabla asistencia, por ende se debe solo utilizar la tabla funcionario y modificar la base de 
         * datos para que esta permita campos nulos poniendo datos por defecto, los datos base que debe tener la tabla
         * funcionario son el rut del funcionario y el codigo de barras de la tarjeta, para lograr esto se debe crear 
         * una funcion en el backend que permita lograr lo mismo que el frontend para crear ese codigo con los 5 numeros extra
         * esto es viable porque basicamente tenemos lo necesario en el documento csv para poder lograrlo.
         * 
         * Pasos, primero se debe eliminar la tabla funcionarios_enrolar, luego se debe modificar la tabla funcionarios para que
         * acepte los datos nulos, poniendo datos por defecto en su lugar, despues se debe en base al rut generar el serial de la tarjeta,
         * y por ultimo se debe probar.
         * 
         * NOTA: Ya se modifico parte de la base de datos pero aun asi se debe revisar bien este tema. 
         */
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM funcionarios WHERE rut = ?");
        $stmtAutoEnrolar = $pdo->prepare("INSERT INTO funcionarios_enrolar (rut) VALUES (?)");
        $stmtInsert = $pdo->prepare("INSERT INTO asistencia (rut_funcionario, fecha, hora, tipo_marca) VALUES (?, ?, ?, ?)");
        
        $creados = 0;
        $nuevos = 0;

        foreach ($agrupacion as $rut => $fechas) {
            $stmtCheck->execute([$rut]);
            if ($stmtCheck->fetchColumn() == 0) {
                $stmtAutoEnrolar->execute([$rut]);
                $nuevos++;
            }

            foreach ($fechas as $fecha => $horas) {                
                if ($stmtInsert->execute([$rut, $fecha, $horas[0], 'entrada'])) $creados++;
                
                if (count($horas) > 1) {
                    if ($stmtInsert->execute([$rut, $fecha, end($horas), 'salida'])) $creados++;
                }
            }
        }

        http_response_code(200);
        echo json_encode([
            'status' => 1, 
            'message' => "Éxito: Se crearon $creados marcas y auto-enrolamos a $nuevos funcionarios genéricos."
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
    exit;
}