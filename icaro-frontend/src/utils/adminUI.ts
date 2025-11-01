// src/utils/adminUI.ts

import { adminState } from '@/stores/auth'; // Importa tu store de Nanostores

/**
 * Encuentra todos los elementos de admin y los muestra u oculta.
 * Busca cualquier elemento con la clase '.admin-control'.
 * @param isAdmin - El estado actual del admin.
 */
function updateAdminUI(isAdmin: boolean) {
  // Usamos una clase genérica para encontrar TODOS los elementos de admin
  const adminElements = document.querySelectorAll('.admin-control');
  
  adminElements.forEach(element => {
    // Usamos 'as' para decirle a TS que este elemento tiene 'classList'
    (element as HTMLElement).classList.toggle('hidden', !isAdmin);
  });
}

/**
 * Proporciona las cabeceras de autenticación para scripts 'is:inline'.
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Inicializa la reactividad de la UI de administración en una página.
 * - Se suscribe al store de admin.
 * - Proporciona funciones globales (en 'window') para que los
 * scripts 'is:inline' (como los modales) puedan acceder al
 * estado de autenticación.
 */
export function initializeAdminUI() {
  console.log('🛡️ Interfaz de Admin inicializada');

  // 1. Suscribirse al store para actualizaciones en tiempo real
  adminState.subscribe((state) => {
    console.log('🔄 Estado de Admin cambiado:', state.isAdmin);
    updateAdminUI(state.isAdmin);
  });

  // 2. Ejecutar una vez al cargar la página
  updateAdminUI(adminState.get().isAdmin);

  // 3. Crear el "puente" para scripts 'is:inline' (Modales)
  // (Usamos 'any' para adjuntar a 'window' de forma segura en TS)
  (window as any).getAuthHeaders = getAuthHeaders;
  
  (window as any).getCurrentAdminStatus = () => {
    return adminState.get().isAdmin;
  };
  
  // (Opcional) Proporciona una función de notificación 'dummy'
  // si tus modales la necesitan y no existe una global.
  if (!(window as any).addNotification) {
    console.warn('Definiendo "dummy" window.addNotification.');
    (window as any).addNotification = (type: string, message: string) => {
      console.log(`[Notification] ${type}: ${message}`);
      if (type === 'error') alert(message);
    };
  }
}