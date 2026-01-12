import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";
import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";
import { initializePeopleModalController } from "@/utils/people/peopleModalController";
import { initializePeopleAddModal } from "@/utils/people/modals/peopleAddModals";
import { initPeopleEditModal } from "@/utils/people/modals/peopleEditModals";
import { initPeopleDeleteModal } from "@/utils/people/modals/peopleDeleteModals";
import { initPersonImageLoader } from "./peopleImageHelpers";
import { API_BASE} from "@/configAPI";

export function initPeopleList() {
  const LOADER_ID = 'people-list-loader';
  const contentArea = document.getElementById('content-area');
  const listContainer = document.getElementById('people-list-container');
  const hasData = listContainer !== null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');
  
  const refreshState = () => {
    const status = backendStatus.get();
    
    // Caso: Sin conexión
    if (status === 'offline') {
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      if (contentArea) contentArea.classList.add('opacity-0');
      return;
    }
    
    // Caso: Lista vacía (con o sin búsqueda)
    if (!hasData) {
      if (contentArea) contentArea.classList.add('opacity-0');
      
      const msg = currentQuery 
        ? `Sin resultados para "${currentQuery}"` 
        : "No hay miembros del equipo disponibles";
        
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    // Caso: Todo OK
    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  // Suscribirse a cambios y ejecutar inicial
  refreshState();
  backendStatus.subscribe(refreshState);

  initializeAdminUI();
  initializePeopleModalController();
  initializePeopleAddModal();
  initPeopleEditModal();
  initPeopleDeleteModal();
  initPersonImageLoader();

  const searchInput = document.getElementById('search-people') as HTMLInputElement;
  if (currentQuery && searchInput) searchInput.value = currentQuery;

  setupAdvancedSearch({
    inputId: "search-people",
    
    clearBtnId: "search-people-clear", 
    
    searchEndpoint: `${API_BASE}/investigators/paged`,
    baseUrl: "/people",
    debounceMs: 300,
    formatter: (person) => {
      const fullName = `${person.givenNames}`; 
      const info = person.email || person.department || "Investigador";

      return {
        title: fullName,
        description: info
      };
    }
  });
}