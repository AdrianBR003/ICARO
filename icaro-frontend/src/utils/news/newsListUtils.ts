import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";
import { initializeModalController } from "@/utils/news/newsModalController";
import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader, showLoader } from "@/services/general/loaderService";
import { API_BASE, API_URL } from "@/configAPI"; 

export function initNewsList() {
  const LOADER_ID = 'news-list-loader';
  const loaderWrapper = document.getElementById('news-list-loader-wrapper');
  const contentArea = document.getElementById('content-area');
  const listContainer = document.getElementById('news-list-container');
  const hasData = listContainer !== null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');

  const refreshState = () => {
    const status = backendStatus.get();

    // 1. ESTADO: OFFLINE
    if (status === 'offline') {
      if (contentArea) contentArea.classList.add('opacity-50', 'pointer-events-none'); // Deshabilitar visualmente en vez de ocultar total
      if (loaderWrapper) loaderWrapper.classList.remove('hidden');
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      return;
    }

    // 2. ESTADO: ONLINE PERO SIN DATOS (Lista vacía o búsqueda sin resultados)
    if (!hasData) {
      if (contentArea) contentArea.classList.add('hidden');
      if (loaderWrapper) loaderWrapper.classList.remove('hidden');
      
      const msg = currentQuery 
        ? `Sin resultados para "${currentQuery}"` 
        : "No hay noticias disponibles";
        
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    // 3. ESTADO: ONLINE Y CON DATOS (Todo OK)
    // Ocultamos el loader y nos aseguramos de que el contenido se vea
    hideLoader(LOADER_ID);
    if (loaderWrapper) loaderWrapper.classList.add('hidden');
    if (contentArea) {
        contentArea.classList.remove('opacity-50', 'pointer-events-none', 'hidden');
    }
  };

  // Suscripción al store de estado
  refreshState();
  backendStatus.subscribe(refreshState);

  // Inicializadores
  initializeAdminUI();
  initializeModalController();

  // Restaurar valor del input de búsqueda si venimos de una query
  const searchInput = document.getElementById('news-search') as HTMLInputElement;
  if (currentQuery && searchInput) searchInput.value = currentQuery;

  // Configuración del buscador
  setupAdvancedSearch({
    inputId: "news-search",
    clearBtnId: "news-search-clear", 
    // Usamos API_BASE para que en Prod sea /api/news/search y Nginx lo rutee bien
    searchEndpoint: `${API_BASE}/news/search`, 
    baseUrl: window.location.pathname,
    debounceMs: 300,
    formatter: (item) => {
      return {
        title: item.title,
        description: item.summary || item.description || "" 
      };
    }
  });
}