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

    public static function crear($rut, $nombre, $apellidoP, $apellidoM, $idDepartamento, $idTurno, $estado = 1) {
        try {
            $pdo = Conexion::conectar();
            $sql = "INSERT INTO funcionarios (rut, nombre, apellidoP, apellidoM, IDdepartamento, IDturno, estado) 
                    VALUES (:rut, :nom, :ap, :am, :depto, :turno, :est)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ap', $apellidoP);
            $stmt->bindParam(':am', $apellidoM);
            $stmt->bindParam(':depto', $idDepartamento);
            $stmt->bindParam(':turno', $idTurno);
            $stmt->bindParam(':est', $estado);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            $errorMsg = $e->getMessage();
            
            // Si es un error de integridad (Código 23000)
            if ($e->getCode() == 23000) {
                
                // 1. Verificamos si es por RUT duplicado
                if (strpos($errorMsg, 'Duplicate entry') !== false) {
                    throw new Exception("Error: El RUT $rut ya está registrado en el sistema.");
                } 
                
                // 2. Verificamos si es por culpa de una Llave Foránea (Departamento o Turno)
                elseif (strpos($errorMsg, 'foreign key constraint fails') !== false) {
                    
                    if (strpos($errorMsg, 'IDdepartamento') !== false) {
                        throw new Exception("Error: El Departamento seleccionado no existe. Por favor, crea uno en el sistema primero.");
                    } elseif (strpos($errorMsg, 'IDturno') !== false) {
                        throw new Exception("Error: El Turno seleccionado no existe. Por favor, ve a la pestaña Turnos y crea uno primero.");
                    } else {
                        throw new Exception("Error: Faltan datos referenciales en la base de datos.");
                    }
                }
            }
            
            // Si es cualquier otro error raro de base de datos
            throw new Exception("Error de base de datos: " . $errorMsg);
        }
    }

    public static function actualizar($rut, $nombre, $apellidoP, $apellidoM, $idDepartamento, $idTurno) {
        try {
            $pdo = Conexion::conectar();
            $sql = "UPDATE funcionarios SET nombre = :nom, apellidoP = :ap, apellidoM = :am, IDdepartamento = :depto, IDturno = :turno WHERE rut = :rut";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':ap', $apellidoP);
            $stmt->bindParam(':am', $apellidoM);
            $stmt->bindParam(':depto', $idDepartamento);
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