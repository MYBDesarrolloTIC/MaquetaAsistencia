<?php
session_start();
require_once __DIR__ . '/clases/asistencia.php';
require_once __DIR__ . '/../config/conexion.php';

// 1. Recibimos los datos de la URL
$rut = $_GET['rut'] ?? '';
$mes = $_GET['mes'] ?? date('m');
$anio = $_GET['anio'] ?? date('Y');

if (empty($rut)) {
    die("Error: No se especificó el funcionario para el reporte.");
}

// 2. Buscamos los datos del Funcionario
try {
    $pdo = Conexion::conectar();
    $sqlFunc = "SELECT f.rut, f.nombre, f.apellidoP, f.apellidoM, s.nombre as seccion, t.nombre as turno, f.tipo_contrato 
                FROM funcionarios f
                LEFT JOIN secciones s ON f.IDseccion = s.id
                LEFT JOIN turnos t ON f.IDturno = t.IDturno
                WHERE f.rut = :rut LIMIT 1";
    $stmt = $pdo->prepare($sqlFunc);
    $stmt->execute([':rut' => $rut]);
    $funcionario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$funcionario) die("Error: Funcionario no encontrado.");

} catch (Exception $e) {
    die("Error de Base de Datos: " . $e->getMessage());
}

// 3. Calculamos la asistencia usando la misma clase del calendario
$datosMes = Asistencia::obtenerAsistenciaMes($rut, $mes, $anio);

// Nombres de los meses para el título
$nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
$nombreMesStr = $nombresMeses[$mes - 1];

// Calculamos los totales
$totalMinutosMes = 0;
foreach ($datosMes as $dia => $info) {
    $totalMinutosMes += $info['minutos_totales'];
}
$totalHoras = floor($totalMinutosMes / 60);
$totalMin = $totalMinutosMes % 60;
$totalFormateado = str_pad($totalHoras, 2, '0', STR_PAD_LEFT) . ':' . str_pad($totalMin, 2, '0', STR_PAD_LEFT);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Asistencia - <?php echo $rut; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        /* Estilos específicos para que al imprimir en PDF se vea perfecto */
        body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background-color: #fff; }
        .hoja { max-width: 800px; margin: 0 auto; padding: 20px; }
        .cabecera-oficial { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .tabla-reporte th { background-color: #f8f9fa !important; font-size: 11px; text-transform: uppercase; }
        .tabla-reporte td, .tabla-reporte th { padding: 5px 8px; border: 1px solid #dee2e6; }
        .firma-box { margin-top: 50px; text-align: center; }
        .linea-firma { border-top: 1px solid #000; width: 250px; margin: 0 auto; margin-top: 60px; padding-top: 5px; font-weight: bold; }
        
        /* Oculta cosas innecesarias al imprimir */
        @media print {
            @page { margin: 1cm; }
            body { margin: 0; padding: 0; }
            .btn-imprimir { display: none !important; }
        }
    </style>
</head>
<body>

<div class="hoja">
    <div class="text-end mb-3 btn-imprimir">
        <button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> Imprimir / Guardar PDF</button>
        <button class="btn btn-secondary ms-2" onclick="window.close()">Cerrar</button>
    </div>

    <div class="cabecera-oficial d-flex justify-content-between align-items-center">
        <div>
            <h4 class="mb-0 fw-bold">MUNICIPALIDAD DE YERBAS BUENAS</h4>
            <span class="text-muted">Departamento de Recursos Humanos</span>
        </div>
        <div class="text-end">
            <h5 class="mb-0">REPORTE DE ASISTENCIA</h5>
            <span class="fw-bold">PERIODO: <?php echo strtoupper($nombreMesStr) . ' ' . $anio; ?></span>
        </div>
    </div>

    <div class="row mb-4">
        <div class="col-8">
            <strong>Nombre Completo:</strong> <?php echo $funcionario['nombre'] . ' ' . $funcionario['apellidoP'] . ' ' . $funcionario['apellidoM']; ?><br>
            <strong>RUT:</strong> <?php echo $funcionario['rut']; ?><br>
            <strong>Tipo de Contrato:</strong> <?php echo $funcionario['tipo_contrato']; ?>
        </div>
        <div class="col-4 text-end">
            <strong>Sección:</strong> <?php echo $funcionario['seccion'] ?? 'No asignada'; ?><br>
            <strong>Turno Asignado:</strong> <?php echo $funcionario['turno'] ?? 'No asignado'; ?>
        </div>
    </div>

    <table class="table table-sm tabla-reporte w-100 text-center">
        <thead>
            <tr>
                <th>Día</th>
                <th>Hora Entrada</th>
                <th>Hora Salida</th>
                <th>Hrs Trabajadas</th>
                <th>Hrs Extras</th>
                <th>Tipo Extra</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $diasDelMes = cal_days_in_month(CAL_GREGORIAN, $mes, $anio);
            for ($i = 1; $i <= $diasDelMes; $i++) {
                // Si el día existe en los datos devueltos por la clase
                if (isset($datosMes[$i])) {
                    $d = $datosMes[$i];
                    echo "<tr>
                            <td class='fw-bold'>$i</td>
                            <td>{$d['entrada']}</td>
                            <td>{$d['salida']}</td>
                            <td>{$d['trabajado']}</td>
                            <td>" . ($d['extra'] !== '00:00' ? "+{$d['extra']}" : "-") . "</td>
                            <td>{$d['tipo_extra']}</td>
                          </tr>";
                } else {
                    // Si no hay marcas, se deja en blanco
                    echo "<tr>
                            <td class='fw-bold text-muted'>$i</td>
                            <td colspan='5' class='text-muted small'><em>Sin registro de asistencia</em></td>
                          </tr>";
                }
            }
            ?>
        </tbody>
        <tfoot class="table-group-divider">
            <tr>
                <td colspan="3" class="text-end fw-bold">TOTAL HORAS MENSUALES:</td>
                <td class="fw-bold fs-6"><?php echo $totalFormateado; ?> hrs</td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
    </table>

    <div class="row mt-5 pt-5">
        <div class="col-6 firma-box">
            <div class="linea-firma">Firma del Funcionario</div>
            <small>Acepta conforme el registro de jornada</small>
        </div>
        <div class="col-6 firma-box">
            <div class="linea-firma">Jefatura / Recursos Humanos</div>
            <small>V°B° Control de Asistencia</small>
        </div>
    </div>

</div>



</body>
</html>