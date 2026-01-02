import { atom } from "nanostores";

export interface AdminState {
  isAdmin: boolean;
  username: string;
}

/* Pieza de estado -> Sera exportada para que otros componentes 
   puedan importarla
*/

export const adminState = atom<AdminState>({
  isAdmin: false,
  username: "",
});

// Funciones para modificar el estado del AdminState

const API_BASE = 'http://localhost:8080/api';

// Funcion para verificar el token contra el backend
export async function checkAdminStatus() {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      adminState.set({ isAdmin: false, username: "" });
    }

    const response = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if(response.ok){
        const data = await response.json(); 
        // Mandamos el token al backend, si es válido, actualizamos el estado
        adminState.set({
            isAdmin: data.authenticated && data.isAdmin,
            username: data.username
        })
    }else{
        throw new Error('Token inválido'); 
    }
  } catch (error) {
    localStorage.removeItem('adminToken'); 
    adminState.set({ isAdmin: false, username: "" });
  }
}

// Función para hacer el logout
export function logoutAdmin(){
    localStorage.removeItem('adminToken'); 
    adminState.set({ isAdmin: false, username: "" });
}

// Función de inicializació automática (la que actualiza la información del token)
if(typeof window !== 'undefined'){ // si se ha cargado la pagina en el cliente
    checkAdminStatus(); 
    setInterval(checkAdminStatus, 300000); // comprueba cada 5 min el estado del token
    document.addEventListener('visibilitychange', ()=> {
        if(!document.hidden){
            checkAdminStatus(); // Comprobar si se minimiza la página
        }
    })
    window.addEventListener('storage', (e) => {
        if (e.key === 'adminToken'){
            checkAdminStatus(); // Sincronización entre pestañas
        }
    })
}