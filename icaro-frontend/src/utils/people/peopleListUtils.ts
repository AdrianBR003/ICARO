import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";
import { initializeAdminUI } from "@/utils/general/adminUI";

// Importamos los controladores de modales (que veremos abajo)
import { initializePeopleModalController } from "@/utils/people/peopleModalController";
// Importamos las lógicas específicas de cada modal (Add/Edit/Delete)
import { initializePeopleAddModal } from "@/utils/people/modals/peopleAddModals";
import { initPeopleEditModal } from "@/utils/people/modals/peopleEditModals";
import { initPeopleDeleteModal } from "@/utils/people/modals/peopleDeleteModals";
import { initPersonImageLoader } from "./peopleImageHelpers";

export function initPeopleList() {
  const LOADER_ID = 'people-list-loader';
  const contentArea = document.getElementById('content-area');
  const hasData = document.getElementById('people-list-container') !== null;
  
  // 1. Gestión de Estado (Carga / Vacío / Error)
  const refreshState = () => {
    const status = backendStatus.get();
    
    // Caso: Sin conexión
    if (status === 'offline') {
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      if (contentArea) contentArea.classList.add('opacity-0');
      return;
    }
    
    // Caso: Lista vacía
    if (!hasData) {
      updateLoaderState(LOADER_ID, 'empty', 'No hay resultados');
      if (contentArea) contentArea.classList.add('opacity-0');
      return;
    }

    // Caso: Todo OK
    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  // Suscribirse a cambios y ejecutar inicial
  refreshState();
  backendStatus.subscribe(refreshState);

  // 2. Inicializar UI de Admin (Muestra/Oculta botones según token)
  initializeAdminUI();
  
  // 3. Inicializar Controladores de Modales
  initializePeopleModalController(); // Escucha los clics en las tarjetas
  
  // 4. Inicializar Lógica de Formularios
  initializePeopleAddModal();
  initPeopleEditModal();
  initPeopleDeleteModal();
  initPersonImageLoader();

  console.log("🚀 [PEOPLE] Inicializado correctamente");
}