<?php
require_once __DIR__ . '/../../config/conexion.php';

class Dashboard {
    public static function obtenerEstadisticas() {
        try {
            $pdo = Conexion::conectar();
            $stats = [
                'total_funcionarios' => 0,
                'presentes_hoy' => 0,
                'atrasos_hoy' => 0,
                'licencias_activas' => 0
            ];

            // 1. TOTAL FUNCIONARIOS (Correcto)
            $stmt = $pdo->query("SELECT COUNT(*) FROM funcionarios");
            $stats['total_funcionarios'] = $stmt->fetchColumn();

            // 2. PRESENTES HOY (Corregido con los nombres de tu BD)
            // Usamos 'fecha', 'rut_funcionario' y 'tipo_marca'
            $stmt = $pdo->query("SELECT COUNT(DISTINCT rut_funcionario) FROM asistencia WHERE fecha = CURDATE() AND LOWER(tipo_marca) = 'entrada'");
            $stats['presentes_hoy'] = $stmt->fetchColumn();

            // 3. ATRASOS HOY (Corregido con los nombres de tu BD)
            // Comparamos directamente con la columna 'hora'
            $stmt = $pdo->query("SELECT COUNT(DISTINCT rut_funcionario) FROM asistencia WHERE fecha = CURDATE() AND LOWER(tipo_marca) = 'entrada' AND hora > '08:30:00'");
            $stats['atrasos_hoy'] = $stmt->fetchColumn();

            // 4. LICENCIAS ACTIVAS
            $stats['licencias_activas'] = 0; 

            return $stats;
        } catch (PDOException $e) {
            throw new Exception("Error BD (Dashboard): " . $e->getMessage());
        }
    }
}
?>