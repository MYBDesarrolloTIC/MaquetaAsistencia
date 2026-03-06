<?php
require_once __DIR__ . '/../../config/conexion.php';

class Dashboard {
    public static function obtenerEstadisticas() {
        try {
            $pdo = Conexion::conectar();
            $fecha_hoy = date('Y-m-d');

            $stmtTotal = $pdo->query("SELECT COUNT(*) as total FROM funcionarios WHERE estado = 1");
            $totalFuncionarios = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

            $stmtPresentes = $pdo->prepare("SELECT COUNT(DISTINCT rut_funcionario) as presentes FROM asistencia WHERE fecha = :hoy AND tipo_marca = 'entrada'");
            $stmtPresentes->execute([':hoy' => $fecha_hoy]);
            $presentesHoy = $stmtPresentes->fetch(PDO::FETCH_ASSOC)['presentes'];

            $sqlAtrasos = "SELECT COUNT(DISTINCT a.rut_funcionario) as atrasos
                           FROM asistencia a
                           INNER JOIN funcionarios f ON a.rut_funcionario = f.rut
                           INNER JOIN turnos t ON f.IDturno = t.IDturno
                           WHERE a.fecha = :hoy
                             AND a.tipo_marca = 'entrada'
                             AND a.hora > t.hora_entrada"; 
            $stmtAtrasos = $pdo->prepare($sqlAtrasos);
            $stmtAtrasos->execute([':hoy' => $fecha_hoy]);
            $atrasosHoy = $stmtAtrasos->fetch(PDO::FETCH_ASSOC)['atrasos'];

            $sqlLicencias = "SELECT COUNT(DISTINCT rut_funcionario) as licencias
                             FROM ausencia_permiso
                             WHERE :hoy BETWEEN DATE(fechaInicio) AND DATE(fechaFIN)";
            $stmtLicencias = $pdo->prepare($sqlLicencias);
            $stmtLicencias->execute([':hoy' => $fecha_hoy]);
            $licenciasActivas = $stmtLicencias->fetch(PDO::FETCH_ASSOC)['licencias'];

            return [
                'status' => 1,
                'data' => [
                    'total_funcionarios' => $totalFuncionarios,
                    'presentes_hoy' => $presentesHoy,
                    'atrasos_hoy' => $atrasosHoy,
                    'licencias_activas' => $licenciasActivas
                ]
            ];
            
        } catch (PDOException $e) {
            return ['status' => 0, 'message' => 'Error BD: ' . $e->getMessage()];
        }
    }
}
?>