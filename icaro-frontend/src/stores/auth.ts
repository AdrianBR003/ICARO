import { atom } from "nanostores";
import { API_BASE } from "@/configAPI";

export interface AdminState {
  isAdmin: boolean;
  username: string;
}

export const adminState = atom<AdminState>({
  isAdmin: false,
  username: "",
});

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

if(typeof window !== 'undefined'){ 
    checkAdminStatus(); 
    setInterval(checkAdminStatus, 300000);
    document.addEventListener('visibilitychange', ()=> {
        if(!document.hidden){
            checkAdminStatus(); 
        }
    })
    window.addEventListener('storage', (e) => {
        if (e.key === 'adminToken'){
            checkAdminStatus(); 
        }
    })
}