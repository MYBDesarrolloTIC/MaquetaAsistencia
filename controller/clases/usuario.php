<?php
require_once __DIR__ . '/../../config/conexion.php';

class Usuario {
    public static function validarLogin($login, $password) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("SELECT IDusuario, nombre_usuario, login, password_hash, rol, estado FROM usuarios WHERE login = :log");
            $stmt->bindParam(':log', $login);
            $stmt->execute();
            
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && $usuario['estado'] === 'Activo') {
                
                if (password_verify($password, $usuario['password']) || $password === $usuario['password']) {
                    
                    unset($usuario['password']);
                    return $usuario; 
                }
            }
            return false; 
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function obtenerTodos() {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("SELECT id, nombre, login, rol, estado FROM usuarios ORDER BY nombre ASC");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error al obtener usuarios: " . $e->getMessage());
        }
    }

    public static function crear($nombre, $login, $password, $rol, $estado) {
        try {
            $pdo = Conexion::conectar();
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO usuarios (nombre, login, password, rol, estado) VALUES (:nom, :log, :pass, :rol, :est)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':log', $login);
            $stmt->bindParam(':pass', $hash);
            $stmt->bindParam(':rol', $rol);
            $stmt->bindParam(':est', $estado);
            return $stmt->execute();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) throw new Exception("El nombre de usuario (login) ya existe.");
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function actualizar($id, $nombre, $login, $password, $rol, $estado) {
        try {
            $pdo = Conexion::conectar();
            
            if (empty($password)) {
                $sql = "UPDATE usuarios SET nombre = :nom, login = :log, rol = :rol, estado = :est WHERE id = :id";
                $stmt = $pdo->prepare($sql);
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $sql = "UPDATE usuarios SET nombre = :nom, login = :log, password = :pass, rol = :rol, estado = :est WHERE id = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':pass', $hash);
            }
            
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':nom', $nombre);
            $stmt->bindParam(':log', $login);
            $stmt->bindParam(':rol', $rol);
            $stmt->bindParam(':est', $estado);
            return $stmt->execute();
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) throw new Exception("El nombre de usuario (login) ya está en uso por otra persona.");
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }

    public static function eliminar($id) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = :id");
            $stmt->bindParam(':id', $id);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error BD: " . $e->getMessage());
        }
    }
}
?>