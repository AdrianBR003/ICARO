import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";
import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";

// Importaciones de Research
import { initializeResearchModalController } from "@/utils/research/researchModalController";
import { initializeResearchAddModal } from "@/utils/research/modals/researchAddModal";
import { initResearchEditModal } from "@/utils/research/modals/researchEditModal";
import { initResearchDeleteModal } from "@/utils/research/modals/researchDeleteModal";

export function initResearchList() {
  const LOADER_ID = 'research-list-loader';
  const contentArea = document.getElementById('content-area');
  const hasData = document.getElementById('research-list-container') !== null;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Lógica de estado (Offline/Empty)
  const refreshState = () => {
    const status = backendStatus.get();
    if (status === 'offline') {
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión');
      if (contentArea) contentArea.classList.add('opacity-0');
      return;
    }
    if (!hasData) {
      updateLoaderState(LOADER_ID, 'empty', 'No hay publicaciones');
      if (contentArea) contentArea.classList.add('opacity-0');
      return;
    }
    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  refreshState();
  backendStatus.subscribe(refreshState);

  // Inicializaciones
  initializeAdminUI();
  
  // MODALES
  initializeResearchModalController();
  initializeResearchAddModal();
  initResearchEditModal();
  initResearchDeleteModal();

  // BUSCADOR
  setupAdvancedSearch({
    inputId: "search-research",
    searchEndpoint: "http://localhost:8080/api/work/paged",
    baseUrl: "/research",
    debounceMs: 300,
  });

  console.log("🚀 [RESEARCH] Inicializado correctamente");
}