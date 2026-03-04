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

   baseUrl: '../../controller/controller.php',
   obtenerFuncionarios: async () => {
      try {
         const respuesta = await fetch(`${api.baseUrl}?action=getFuncionarios`);
         if (!respuesta.ok) throw new Error("Error en la red");
         return await respuesta.json();
      } catch (error) {
         console.error("Error API obtenerFuncionarios:", error);
      }
   },

   obtenerAsistenciaMes: async (rut, mes, anio) => {
      try {
         const respuesta = await fetch(`${api.baseUrl}?action=getAsistencia&rut=${rut}&mes=${mes}&anio=${anio}`);
         return await respuesta.json();
      } catch (error) {
         console.error("Error API obtenerAsistenciaMes:", error);
      }
   },

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

   actualizarFuncionario: async (datosFuncionario) => {
      try {
         const respuesta = await fetch(api.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateFuncionario', ...datosFuncionario })
         });
         return await respuesta.json();
      } catch (error) {
         console.error("Error API actualizarFuncionario:", error);
      }
   }
};




// api turnos por pablito
// Objeto exclusivo para hablar con el controlador de turnos
const apiTurnos = {
    baseUrl: '../../controller/turno_controller.php',

    // Función "cazadora de errores": Nos dirá exactamente qué escupe PHP
    procesarPeticion: async (url, opciones) => {
        try {
            const req = await fetch(url, opciones);
            const textoCrudo = await req.text(); // Atrapamos la respuesta cruda de PHP
            
            try {
                return JSON.parse(textoCrudo); // Intentamos convertirlo a JSON
            } catch (errorParseo) {
                // SI PHP DIO ERROR, CAEREMOS AQUÍ Y LO VEREMOS EN CONSOLA
                console.error("❌ ERROR EN PHP DETECTADO ❌");
                console.error("Lo que PHP devolvió realmente fue:", textoCrudo);
                return { status: 0, message: "Error interno del servidor. Revisa la consola (F12)." };
            }
        } catch (errorRed) {
            console.error("Error real de conexión:", errorRed);
            return { status: 0, message: "No se pudo conectar con el servidor." };
        }
    },

    getTurnos: async () => {
        return await apiTurnos.procesarPeticion(`${apiTurnos.baseUrl}?action=getTurnos`, { method: 'GET' });
    },

    createTurno: async (datos) => {
        return await apiTurnos.procesarPeticion(apiTurnos.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createTurno', ...datos })
        });
    },

    updateTurno: async (datos) => {
        return await apiTurnos.procesarPeticion(apiTurnos.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateTurno', ...datos })
        });
    },

    deleteTurno: async (id) => {
        return await apiTurnos.procesarPeticion(apiTurnos.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteTurno', id: id })
        });
    }
};