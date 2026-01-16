import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";
import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";

// Importamos los controladores principales
import { initializePeopleModalController } from "@/utils/people/peopleModalController";
import { initPeopleAddModal } from "@/utils/people/modals/peopleAddModals"; 
import { initPeopleEditModal } from "@/utils/people/modals/peopleEditModals";
import { initPeopleDeleteModal } from "@/utils/people/modals/peopleDeleteModals"; 

import { API_BASE } from "@/configAPI";

export function initPeopleList() {
  const LOADER_ID = 'people-list-loader';
  const contentArea = document.getElementById('content-area');
  const listContainer = document.getElementById('people-list-container');
  const hasData = listContainer !== null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');
  
  // 1. GESTIÓN DE ESTADO (Carga / Error / Vacío)
  const refreshState = () => {
    const status = backendStatus.get();
    
    if (status === 'offline') {
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      if (contentArea) contentArea.classList.add('opacity-0');
      return;
    }
    
    if (!hasData) {
      if (contentArea) contentArea.classList.add('opacity-0');
      
      const msg = currentQuery 
        ? `Sin resultados para "${currentQuery}"` 
        : "No hay miembros del equipo disponibles";
        
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    // Todo OK
    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  refreshState();
  backendStatus.subscribe(refreshState);

  // 2. INICIALIZACIÓN DE MODALES Y UI
  initializeAdminUI();
  
  // Controlador maestro (gestiona los clics en editar/borrar de las tarjetas)
  initializePeopleModalController(); 
  
  // Lógica específica de cada formulario modal
  initPeopleAddModal();
  initPeopleEditModal();
  if (typeof initPeopleDeleteModal === 'function') {
      initPeopleDeleteModal();
  }

  // NOTA: Hemos borrado initPersonImageLoader() porque ya no hace falta.

  // 3. CONFIGURACIÓN DEL BUSCADOR
  const searchInput = document.getElementById('search-people') as HTMLInputElement;
  if (currentQuery && searchInput) searchInput.value = currentQuery;

  setupAdvancedSearch({
    inputId: "search-people",
    clearBtnId: "search-people-clear", 
    searchEndpoint: `${API_BASE}/investigators/paged`,
    baseUrl: "/people",
    debounceMs: 300,
    
    // Formateador visual para los resultados del desplegable de búsqueda
    formatter: (person: any) => {
      // Unimos nombre y apellidos
      const fullName = `${person.givenNames} ${person.familyName || ''}`.trim();
      // Mostramos el Rol o el Email como descripción
      const info = person.role || person.email || "Investigador";

      return {
        title: fullName,
        description: info
      };
    }
  });
}