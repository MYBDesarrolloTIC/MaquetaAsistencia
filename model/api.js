const API_REQUEST_FAIL = 0;
const API_REQUEST_SUCCESS = 1;

const validUser = async (username, password) => {
   if (username.trim().length > 0) {
      if (password.length >= 8) {
         const request = await fetch("../../controller/login_controller.php", {
            method: "POST",
            headers: {
               "Content-Type": "application/json"
            },
            body: JSON.stringify({
               username: encodeURIComponent(username),
               password: encodeURIComponent(password),
            })
         });

         if (!request.ok) return { status: API_REQUEST_FAIL, message: "Error en la solicitud" };
         return {
            status: API_REQUEST_SUCCESS,
            message: "Usuario válido",
            data: await request.json(),
         };
      } else {
         return { status: API_REQUEST_FAIL, message: "La contraseña es demasiado corta" };
      }
   } else {
      return { status: API_REQUEST_FAIL, message: "El usuario esta en blanco" };
   }
};


// ====== MODEL/API.JS ======

const api = {

   // URL base hacia tu controlador PHP
   baseUrl: '../../controller/controller.php',

   // 1. Obtener todos los funcionarios para armar la lista
   obtenerFuncionarios: async () => {
      try {
         const respuesta = await fetch(`${api.baseUrl}?action=getFuncionarios`);
         if (!respuesta.ok) throw new Error("Error en la red");
         return await respuesta.json();
      } catch (error) {
         console.error("Error API obtenerFuncionarios:", error);
      }
   },

   // 2. Obtener la asistencia de un funcionario para armar el calendario
   obtenerAsistenciaMes: async (rut, mes, anio) => {
      try {
         // Pasamos los parámetros por GET
         const respuesta = await fetch(`${api.baseUrl}?action=getAsistencia&rut=${rut}&mes=${mes}&anio=${anio}`);
         return await respuesta.json();
      } catch (error) {
         console.error("Error API obtenerAsistenciaMes:", error);
      }
   },

   // 3. Eliminar funcionario (CRUD)
   eliminarFuncionario: async (rut) => {
      try {
         const respuesta = await fetch(api.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteFuncionario', rut: rut })
         });
         return await respuesta.json();
      } catch (error) {
         console.error("Error API eliminarFuncionario:", error);
      }
   },

   // 4. Actualizar funcionario (CRUD)
   actualizarFuncionario: async (datosFuncionario) => {
      try {
         const respuesta = await fetch(api.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // datosFuncionario debe ser un objeto: {rut: 123, nombres: '...', etc.}
            body: JSON.stringify({ action: 'updateFuncionario', ...datosFuncionario })
         });
         return await respuesta.json();
      } catch (error) {
         console.error("Error API actualizarFuncionario:", error);
      }
   }
};