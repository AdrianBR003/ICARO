import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";
import { initializeResearchModalController } from "@/utils/research/researchModalController"; 
import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";

export function initResearchList() {
  const LOADER_ID = 'research-list-loader';
  const contentArea = document.getElementById('content-area');
  const listContainer = document.getElementById('research-list-container');
  
  // Si listContainer es null, es que NO hay datos renderizados
  const hasData = listContainer !== null; 
  
  // --- CORRECCIÓN LÓGICA CLIENTE ---
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');
  
  // Detectar si hay CUALQUIER filtro activo (excluyendo paginación)
  const isFiltering = Array.from(urlParams.keys())
    .some(key => key !== 'page' && key !== 'size');
  // ---------------------------------

  const refreshState = () => {
    const status = backendStatus.get();

    if (status === 'offline') {
      if (contentArea) contentArea.classList.add('opacity-0');
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      return;
    }

    // SI NO HAY DATOS (works.length === 0)
    if (!hasData) {
      if (contentArea) contentArea.classList.add('opacity-0');
      
      // Mensaje dinámico
      const msg = isFiltering 
        ? "No se encontraron resultados con los filtros actuales" 
        : "No hay publicaciones disponibles";
        
      // FORZAMOS EL ESTADO 'empty'
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    // SI HAY DATOS
    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  refreshState();
  backendStatus.subscribe(refreshState);

  initializeAdminUI();
  
  if (typeof initializeResearchModalController === 'function') {
    initializeResearchModalController();
  }

  const searchInput = document.getElementById('search-research') as HTMLInputElement;
  if (currentQuery && searchInput) searchInput.value = currentQuery;

  setupAdvancedSearch({
    inputId: "search-research",
    clearBtnId: "search-research-clear", 
    searchEndpoint: "http://localhost:8080/api/works/paged", 
    baseUrl: window.location.pathname,
    debounceMs: 300,
    formatter: (work) => {
      const description = work.authors 
        ? `${work.authors} (${work.publicationDate ? new Date(work.publicationDate).getFullYear() : ''})`
        : work.description || "";

      return {
        title: work.title,
        description: description
      };
    }
  });
}