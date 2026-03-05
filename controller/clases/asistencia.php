<?php
require_once __DIR__ . '/../../config/conexion.php';

class Asistencia {
    public static function registrar($codigoCDB, $tipoMarca) {
        try {
            $pdo = Conexion::conectar();
            
            // 1. EL BISTURÍ: Le cortamos los últimos 5 dígitos aleatorios al código
            if (strlen($codigoCDB) > 5) {
                // substr con -5 cuenta desde el final hacia atrás y elimina eso.
                $rutFuncionario = substr($codigoCDB, 0, -5); 
            } else {
                throw new Exception("Código de credencial muy corto o inválido.");
            }

            // 2. Buscamos si el RUT resultante realmente le pertenece a alguien
            $stmt = $pdo->prepare("SELECT nombre, apellidoP FROM funcionarios WHERE rut = :rut");
            $stmt->bindParam(':rut', $rutFuncionario);
            $stmt->execute();
            $funcionario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$funcionario) {
                throw new Exception("Credencial no reconocida. El funcionario no existe.");
            }

            // 3. Insertamos la asistencia usando CURDATE() y CURTIME() de MySQL
            $sql = "INSERT INTO asistencia (rut_funcionario, fecha, hora, tipo_marca) 
                    VALUES (:rut, CURDATE(), CURTIME(), :tipo)";
            
            $stmtAsistencia = $pdo->prepare($sql);
            $stmtAsistencia->bindParam(':rut', $rutFuncionario);
            $stmtAsistencia->bindParam(':tipo', $tipoMarca);
            
            if ($stmtAsistencia->execute()) {
                // Formateamos un mensaje bonito para mostrar en la pantalla
                $horaActual = date('H:i:s');
                $tipoTexto = strtoupper($tipoMarca); // Queda como "ENTRADA" o "SALIDA"
                
                return "¡$tipoTexto registrada con éxito!<br>Hola, " . $funcionario['nombre'] . " " . $funcionario['apellidoP'] . " (" . $horaActual . ")";
            } else {
                throw new Exception("Error al guardar la marca en la base de datos.");
            }

        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }
}
?>