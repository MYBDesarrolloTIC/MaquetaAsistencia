<?php
require_once __DIR__ .'/../../config/conexion.php';

class Turno {
    public static function obtenerTodos() {
        try {
            $pdo = Conexion::conectar();
            
            $stmt = $pdo->prepare("SELECT 
                                    IDTurno AS IDturno, 
                                    nombreTurno AS nombre, 
                                    turnoEntrada AS hora_entrada, 
                                    turnoSalida AS hora_salida 
                                   FROM turno 
                                   ORDER BY turnoEntrada ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error al obtener turno: " . $e->getMessage());
        }
    }

    public static function crearTurno($nombre, $entrada, $salida) {
        try {
            $pdo = Conexion::conectar();
            // Nombres de columnas reales de tu BD
            $stmt = $pdo->prepare("INSERT INTO turno (nombreTurno, turnoEntrada, turnoSalida) VALUES (:nom, :ent, :sal)");
            $stmt->bindParam(":nom", $nombre);
            $stmt->bindParam(":ent", $entrada);
            $stmt->bindParam(":sal", $salida);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error al crear turno: " . $e->getMessage());
        }
    }

    public static function actualizarTurno($id, $nombre, $entrada, $salida) {
        try {
            $pdo = Conexion::conectar();
            // Nombres de columnas reales de tu BD
            $stmt = $pdo->prepare("UPDATE turno SET nombreTurno = :nom, turnoEntrada = :ent, turnoSalida = :sal WHERE IDTurno = :id");
            $stmt->bindParam(":nom", $nombre);
            $stmt->bindParam(":ent", $entrada);
            $stmt->bindParam(":sal", $salida);
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error al actualizar turno: " . $e->getMessage());
        }
    }

    public static function eliminarTurno($id) {
        try {
            $pdo = Conexion::conectar();
            // Nombres de columnas reales de tu BD
            $stmt = $pdo->prepare("DELETE FROM turno WHERE IDTurno = :id");
            $stmt->bindParam(":id", $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error al eliminar turno: " . $e->getMessage());
        }
    }
}
?>