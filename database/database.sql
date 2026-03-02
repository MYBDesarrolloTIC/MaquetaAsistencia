/* TABLA: departamentos
Propósito: Almacena el registro de las diferentes áreas, secciones o departamentos de la empresa. 
Permite organizar a los trabajadores según su área funcional.
*/
CREATE TABLE departamentos (
    IDdepartamento INT AUTO_INCREMENT PRIMARY KEY,
    nombreDepartamento VARCHAR(50)
);

/* TABLA: turno
Propósito: Define los diferentes horarios de trabajo disponibles en la empresa. 
Establece a qué hora debe entrar y salir un trabajador asignado a dicho turno.
*/
CREATE TABLE turno (
    IDTurno INT AUTO_INCREMENT PRIMARY KEY,
    nombreTurno VARCHAR(25),
    turnoEntrada TIME,
    turnoSalida TIME
);

/* TABLA: usuarios
Propósito: Almacena las credenciales de las personas que administrarán el sistema (ej. Recursos Humanos, Jefaturas). 
Maneja de forma segura las contraseñas y define qué nivel de acceso (Rol) tiene cada uno.
*/
CREATE TABLE usuarios (
    IDusuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(20),
    password_hash VARCHAR(255),
    Rol VARCHAR(15)
);

/* TABLA: funcionarios
Propósito: Es la tabla central del sistema. Almacena la información personal y laboral de cada empleado. 
Se conecta (mediante claves foráneas) con las tablas 'departamentos' y 'turno' para saber dónde y en qué horario trabaja.
*/
CREATE TABLE funcionarios (
    rut INT PRIMARY KEY, 
    nombre VARCHAR(50),
    apellidoP VARCHAR(50),
    apellidoM VARCHAR(50),
    IDdepartamento INT,
    IDturno INT,
    FOREIGN KEY (IDdepartamento) REFERENCES departamentos(IDdepartamento),
    FOREIGN KEY (IDturno) REFERENCES turno(IDTurno)
);

/* TABLA: asistencia
Propósito: Registra el control de reloj control diario. 
Guarda el momento exacto (fecha y hora) en que un funcionario inicia y finaliza su jornada laboral.
*/
CREATE TABLE asistencia (
    idasistencia INT AUTO_INCREMENT PRIMARY KEY,
    Horaentrada DATETIME,
    Horasalida DATETIME,
    rutFuncionario INT, 
    FOREIGN KEY (rutFuncionario) REFERENCES funcionarios(rut)
);

/* TABLA: ausencia_permiso
Propósito: Lleva el historial de los días que un funcionario no asiste a trabajar de manera justificada o injustificada. 
Incluye licencias médicas, vacaciones o permisos especiales, definiendo cuándo empiezan y cuándo terminan.
*/
CREATE TABLE ausencia_permiso (
    idAusencia INT AUTO_INCREMENT PRIMARY KEY,
    RUTFuncionario INT,
    tipo VARCHAR(50),
    fechaInicio DATETIME,
    fechaFIN DATETIME,
    FOREIGN KEY (RUTFuncionario) REFERENCES funcionarios(rut)
);

CREATE TABLE reportes_historicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mes INT NOT NULL,
    anio INT NOT NULL,
    funcionario_id INT NOT NULL,
    total_extras_diurnas TIME DEFAULT '00:00:00',
    total_extras_nocturnas TIME DEFAULT '00:00:00',
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);


DELIMITER $$

CREATE PROCEDURE sp_guardar_reporte_mensual()
BEGIN

    DECLARE v_mes_anterior INT;
    DECLARE v_anio_anterior INT;


    IF MONTH(CURRENT_DATE()) = 1 THEN
        SET v_mes_anterior = 12;
        SET v_anio_anterior = YEAR(CURRENT_DATE()) - 1;
    ELSE
        SET v_mes_anterior = MONTH(CURRENT_DATE()) - 1;
        SET v_anio_anterior = YEAR(CURRENT_DATE());
    END IF;

    INSERT INTO reportes_historicos (mes, anio, funcionario_id, total_extras_diurnas, total_extras_nocturnas)
    SELECT 
        v_mes_anterior,
        v_anio_anterior,
        f.id,
        SEC_TO_TIME(SUM(TIME_TO_SEC(IFNULL(a.horas_extras_diurnas, '00:00:00')))),
        SEC_TO_TIME(SUM(TIME_TO_SEC(IFNULL(a.horas_extras_nocturnas, '00:00:00'))))
    FROM funcionarios f
    INNER JOIN asistencia a ON f.id = a.funcionario_id
    WHERE MONTH(a.fecha) = v_mes_anterior 
      AND YEAR(a.fecha) = v_anio_anterior
    GROUP BY f.id;
    
END $$

DELIMITER ;

SET GLOBAL event_scheduler = ON;

DELIMITER $$
CREATE EVENT ev_cierre_mensual
ON SCHEDULE EVERY 1 MONTH
STARTS '2026-04-01 02:00:00' -- Empezará el 1 de abril a las 2:00 AM (calculando marzo)
DO
BEGIN
    CALL sp_guardar_reporte_mensual();
END;
DELIMITER ;