<?php
require_once __DIR__ . '/../../config/conexion.php';

class Asistencia
{
    public static function registrar($codigoCDB, $tipoMarca)
    {
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

    /* ====================================================================
       2. FUNCIÓN PARA EL CALENDARIO - Matemáticas en PHP (A prueba de balas)
       ==================================================================== */
    public static function obtenerAsistenciaMes($rut, $mes, $anio) {
        try {
            $pdo = Conexion::conectar();
            
            // 1. Obtenemos el turno del funcionario
            $sqlTurno = "SELECT t.hora_entrada, t.hora_salida 
                         FROM funcionarios f 
                         LEFT JOIN turnos t ON f.IDturno = t.IDturno 
                         WHERE f.rut = :rut LIMIT 1";
            $stmtT = $pdo->prepare($sqlTurno);
            $stmtT->bindParam(':rut', $rut);
            $stmtT->execute();
            $turno = $stmtT->fetch(PDO::FETCH_ASSOC);
            
            // Si no tiene turno asignado, asumimos de 08:00 a 17:00
            $turno_ent = ($turno && $turno['hora_entrada']) ? $turno['hora_entrada'] : '08:00:00';
            $turno_sal = ($turno && $turno['hora_salida']) ? $turno['hora_salida'] : '17:00:00';

            // 2. Buscamos todas sus marcas del mes (Sin GROUP BY para evitar bloqueos)
            $sqlMarcas = "SELECT fecha, hora, tipo_marca 
                          FROM asistencia 
                          WHERE rut_funcionario = :rut 
                            AND MONTH(fecha) = :mes 
                            AND YEAR(fecha) = :anio
                          ORDER BY fecha ASC, hora ASC";
            $stmtM = $pdo->prepare($sqlMarcas);
            $stmtM->execute([':rut' => $rut, ':mes' => $mes, ':anio' => $anio]);
            $marcas = $stmtM->fetchAll(PDO::FETCH_ASSOC);

            // 3. Agrupamos los días usando PHP
            $dias = [];
            foreach ($marcas as $m) {
                $dia = (int)date('d', strtotime($m['fecha']));
                if (!isset($dias[$dia])) {
                    $dias[$dia] = ['entrada' => null, 'salida' => null];
                }
                // Tomamos la primera entrada del día
                if ($m['tipo_marca'] === 'entrada' && !$dias[$dia]['entrada']) {
                    $dias[$dia]['entrada'] = $m['hora']; 
                }
                // Tomamos la última salida del día
                if ($m['tipo_marca'] === 'salida') {
                    $dias[$dia]['salida'] = $m['hora']; 
                }
            }

            // 4. Calculamos los tiempos exactos
            $calendario = [];
            foreach ($dias as $dia => $datos) {
                $entrada = $datos['entrada'];
                $salida = $datos['salida'];

                $estado = 'amarillo'; // Por defecto si se fue antes de tiempo
                $hrs_trabajadas = '00:00';
                $hrs_extra = '00:00';
                $tipo_extra = '';
                $minutos_totales = 0;

                if ($entrada && $salida) {
                    $t_ent = strtotime($entrada);
                    $t_sal = strtotime($salida);
                    $req_ent = strtotime($turno_ent);
                    $req_sal = strtotime($turno_sal);

                    // Si cruzó la medianoche
                    if ($req_sal < $req_ent) $req_sal += 86400; 
                    if ($t_sal < $t_ent) $t_sal += 86400;

                    $segundos_trabajados = $t_sal - $t_ent;
                    $segundos_requeridos = $req_sal - $req_ent;
                    
                    $minutos_totales = floor($segundos_trabajados / 60);
                    
                    $h_trab = floor($segundos_trabajados / 3600);
                    $m_trab = floor(($segundos_trabajados % 3600) / 60);
                    $hrs_trabajadas = str_pad($h_trab, 2, '0', STR_PAD_LEFT) . ':' . str_pad($m_trab, 2, '0', STR_PAD_LEFT);

                    // ¿Cumplió con su turno completo?
                    if ($segundos_trabajados >= $segundos_requeridos) {
                        $estado = 'verde'; // ¡Jornada completa!
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
