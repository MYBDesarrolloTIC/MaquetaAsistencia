<?php
require_once __DIR__ . '/../../config/conexion.php';

class Funcionario {
    public static function obtenerTodos() {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("SELECT * FROM funcionarios ORDER BY nombre ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error al obtener: " . $e->getMessage());
        }
    }

    // Cambiamos $idDepartamento por $idSeccion
    public static function crear($rut, $nombre, $apellidoP, $apellidoM, $idSeccion, $idTurno, $estado = 1) {
        try {
            $pdo = Conexion::conectar();
            // Actualizado a IDseccion
            $sql = "INSERT INTO funcionarios (rut, nombre, apellidoP, apellidoM, IDseccion, IDturno, estado) 
                    VALUES (:rut, :nom, :ap, :am, :seccion, :turno, :est)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ap', $apellidoP);
            $stmt->bindParam(':am', $apellidoM);
            $stmt->bindParam(':seccion', $idSeccion);
            $stmt->bindParam(':turno', $idTurno);
            $stmt->bindParam(':est', $estado);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            $errorMsg = $e->getMessage();
            
            if ($e->getCode() == 23000) {
                if (strpos($errorMsg, 'Duplicate entry') !== false) {
                    throw new Exception("Error: El RUT $rut ya está registrado en el sistema.");
                } 
                elseif (strpos($errorMsg, 'foreign key constraint fails') !== false) {
                    // Actualizado a IDseccion
                    if (strpos($errorMsg, 'IDseccion') !== false) {
                        throw new Exception("Error: La Sección seleccionada no existe en la base de datos.");
                    } elseif (strpos($errorMsg, 'IDturno') !== false) {
                        throw new Exception("Error: El Turno seleccionado no existe.");
                    } else {
                        throw new Exception("Error: Faltan datos referenciales en la base de datos.");
                    }
                }
            }
            throw new Exception("Error de base de datos: " . $errorMsg);
        }
    }

    public static function actualizar($rut, $nombre, $apellidoP, $apellidoM, $idSeccion, $idTurno) {
        try {
            $pdo = Conexion::conectar();
            // Actualizado a IDseccion
            $sql = "UPDATE funcionarios SET nombre = :nom, apellidoP = :ap, apellidoM = :am, IDseccion = :seccion, IDturno = :turno WHERE rut = :rut";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ap', $apellidoP);
            $stmt->bindParam(':am', $apellidoM);
            $stmt->bindParam(':seccion', $idSeccion);
            $stmt->bindParam(':turno', $idTurno);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function eliminar($rut) {
        try {
            $pdo = Conexion::conectar();
            $sql = "DELETE FROM funcionarios WHERE rut = :rut";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }
}
?>