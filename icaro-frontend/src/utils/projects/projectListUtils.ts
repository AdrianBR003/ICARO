import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";
import { initializeAdminUI } from "@/utils/general/adminUI";
import { initializeModalController } from "@/utils/general/modalController";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";

export function initProjectList() {
  const LOADER_ID = 'project-list-loader';
  const contentArea = document.getElementById('content-area');
  const hasData = document.getElementById('project-list-container') !== null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');

  const refreshState = () => {
    const status = backendStatus.get();

    // Caso A: Servidor caído
    if (status === 'offline') {
      if (contentArea) contentArea.classList.add('opacity-0');
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      return;
    }

    // Caso B: Servidor OK pero sin datos (o búsqueda vacía)
    if (!hasData) {
      if (contentArea) contentArea.classList.add('opacity-0');
      
      const msg = currentQuery 
        ? `Sin resultados para "${currentQuery}"` 
        : "No hay proyectos disponibles";
        
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    // Caso C: Todo OK, mostramos lista
    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  refreshState(); // Ejecución inicial
  backendStatus.subscribe(refreshState);

  initializeAdminUI();       // Muestra botones editar/borrar si hay token
  initializeModalController(); // Activa la apertura de modales

  const searchInput = document.getElementById('project-search') as HTMLInputElement;
  if (currentQuery && searchInput) {
    searchInput.value = currentQuery;
  }

  setupAdvancedSearch({
    inputId: "project-search",
    searchEndpoint: "http://localhost:8080/api/project/paged",
    baseUrl: window.location.pathname,
    debounceMs: 300,
  });

  console.log("🚀 [PROJECTS] List logic initialized");
}