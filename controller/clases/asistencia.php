<?php
require_once __DIR__ . '/../../config/conexion.php';

class Asistencia {
    
    public static function registrarMarca($codigo_escaner, $tipo_marca) {
        try {
            $pdo = Conexion::conectar();

            $codigo_limpio = trim($codigo_escaner);

            if (strlen($codigo_limpio) > 9) { 
                $rut_extraido = substr($codigo_limpio, 0, -5);
            } else {
                $rut_extraido = $codigo_limpio;
            }

            $rut_final = str_replace(['.', '-'], '', $rut_extraido);

            $sqlBusqueda = "SELECT rut, nombre, apellidoP FROM funcionarios 
                            WHERE REPLACE(REPLACE(rut, '.', ''), '-', '') = :rut LIMIT 1";
            
            $stmt = $pdo->prepare($sqlBusqueda);
            $stmt->bindParam(':rut', $rut_final);
            $stmt->execute();
            
            $funcionario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$funcionario) {
                return ['status' => 0, 'message' => "No se encontró el RUT ({$rut_extraido}) en el sistema."];
            }

            $rut = $funcionario['rut'];
            $fecha_actual = date('Y-m-d');
            $hora_actual = date('H:i:s');

            $sqlInsert = "INSERT INTO asistencia (rut_funcionario, fecha, hora, tipo_marca) 
                          VALUES (:rut, :fecha, :hora, :tipo)";
            $stmtMarca = $pdo->prepare($sqlInsert);
            $stmtMarca->bindParam(':rut', $rut);
            $stmtMarca->bindParam(':fecha', $fecha_actual);
            $stmtMarca->bindParam(':hora', $hora_actual);
            $stmtMarca->bindParam(':tipo', $tipo_marca);
            
            if ($stmtMarca->execute()) {
                $accion = ($tipo_marca === 'entrada') ? 'Entrada' : 'Salida';
                return [
                    'status' => 1, 
                    'message' => "{$accion} exitosa: {$funcionario['nombre']} {$funcionario['apellidoP']} a las {$hora_actual} hrs."
                ];
            }

            return ['status' => 0, 'message' => 'Error interno al guardar la marca.'];

        } catch (PDOException $e) {
            return ['status' => 0, 'message' => 'Error BD: ' . $e->getMessage()];
        }
    }

    public static function obtenerAsistenciaMes($rut, $mes, $anio) {
        try {
            $pdo = Conexion::conectar();
            
            $sqlTurno = "SELECT t.hora_entrada, t.hora_salida 
                         FROM funcionarios f 
                         LEFT JOIN turnos t ON f.IDturno = t.IDturno 
                         WHERE f.rut = :rut LIMIT 1";
            $stmtT = $pdo->prepare($sqlTurno);
            $stmtT->bindParam(':rut', $rut);
            $stmtT->execute();
            $turno = $stmtT->fetch(PDO::FETCH_ASSOC);
            
            $turno_ent = ($turno && $turno['hora_entrada']) ? $turno['hora_entrada'] : '08:00:00';
            $turno_sal = ($turno && $turno['hora_salida']) ? $turno['hora_salida'] : '17:00:00';

            $sqlMarcas = "SELECT fecha, hora, tipo_marca 
                          FROM asistencia 
                          WHERE rut_funcionario = :rut 
                            AND MONTH(fecha) = :mes 
                            AND YEAR(fecha) = :anio
                          ORDER BY fecha ASC, hora ASC";
            $stmtM = $pdo->prepare($sqlMarcas);
            $stmtM->execute([':rut' => $rut, ':mes' => $mes, ':anio' => $anio]);
            $marcas = $stmtM->fetchAll(PDO::FETCH_ASSOC);

            $dias = [];
            foreach ($marcas as $m) {
                $dia = (int)date('d', strtotime($m['fecha']));
                if (!isset($dias[$dia])) {
                    $dias[$dia] = ['entrada' => null, 'salida' => null];
                }
                if ($m['tipo_marca'] === 'entrada' && !$dias[$dia]['entrada']) {
                    $dias[$dia]['entrada'] = $m['hora']; 
                }
                if ($m['tipo_marca'] === 'salida') {
                    $dias[$dia]['salida'] = $m['hora']; 
                }
            }

            $calendario = [];
            foreach ($dias as $dia => $datos) {
                $entrada = $datos['entrada'];
                $salida = $datos['salida'];

                $estado = 'amarillo'; 
                $hrs_trabajadas = '00:00';
                $hrs_extra = '00:00';
                $tipo_extra = '';
                $minutos_totales = 0;

                if ($entrada && $salida) {
                    $t_ent = strtotime($entrada);
                    $t_sal = strtotime($salida);
                    $req_ent = strtotime($turno_ent);
                    $req_sal = strtotime($turno_sal);

                    if ($req_sal < $req_ent) $req_sal += 86400; 
                    if ($t_sal < $t_ent) $t_sal += 86400;

                    $segundos_trabajados = $t_sal - $t_ent;
                    $segundos_requeridos = $req_sal - $req_ent;
                    
                    $minutos_totales = floor($segundos_trabajados / 60);
                    
                    $h_trab = floor($segundos_trabajados / 3600);
                    $m_trab = floor(($segundos_trabajados % 3600) / 60);
                    $hrs_trabajadas = str_pad($h_trab, 2, '0', STR_PAD_LEFT) . ':' . str_pad($m_trab, 2, '0', STR_PAD_LEFT);

                    if ($segundos_trabajados >= $segundos_requeridos) {
                        $estado = 'verde'; 
                        $segundos_extra = $segundos_trabajados - $segundos_requeridos;
                        
                        if ($segundos_extra > 60) {
                            $h_ext = floor($segundos_extra / 3600);
                            $m_ext = floor(($segundos_extra % 3600) / 60);
                            $hrs_extra = str_pad($h_ext, 2, '0', STR_PAD_LEFT) . ':' . str_pad($m_ext, 2, '0', STR_PAD_LEFT);
                            
                            $hora_salida_real = (int)date('H', $t_sal);
                            $tipo_extra = ($hora_salida_real >= 21 || $hora_salida_real <= 7) ? 'Nocturna' : 'Diurna';
                        }
                    }
                }

                $calendario[$dia] = [
                    'entrada' => $entrada ? substr($entrada, 0, 5) : '--:--',
                    'salida' => $salida ? substr($salida, 0, 5) : '--:--',
                    'estado' => $estado,
                    'trabajado' => $hrs_trabajadas,
                    'minutos_totales' => $minutos_totales,
                    'extra' => $hrs_extra,
                    'tipo_extra' => $tipo_extra
                ];
            }

            return $calendario;
        } catch (PDOException $e) {
            return ['error_bd' => "Error de BD: " . $e->getMessage()];
        }
    }
}
?>