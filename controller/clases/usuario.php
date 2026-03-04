<?php
require_once __DIR__ . '/../../config/conexion.php';
class Usuario {
    public static function verificarLogin($nombre_usuario, $password_ingresada) {
        try {
            $pdo = Conexion::conectar();
            $stmt = $pdo->prepare("SELECT IDusuario, nombre_usuario, password_hash, Rol FROM usuarios WHERE nombre_usuario = :nombre_usuario");
            $stmt->bindParam(":nombre_usuario", $nombre_usuario, PDO::PARAM_STR);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && $password_ingresada === $user['password_hash']) {
                return $user; 
            }
            return false; 
            
        } catch (PDOException $e) {
            die(json_encode(['status' => 0, 'message' => "Error BD: " . $e->getMessage()]));
        }
    }
}
?>