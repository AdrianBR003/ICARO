import { createImageLoader } from "@/utils/general/imageLoaderFactory";
import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";
import { initializeModalController } from "@/utils/news/newsModalController";
import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";

export function initNewsList() {
  const LOADER_ID = 'news-list-loader';
  const contentArea = document.getElementById('content-area');
  const listContainer = document.getElementById('news-list-container');
  const hasData = listContainer !== null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');

  // 1. Gestión del Loader y Estado
  const refreshState = () => {
    const status = backendStatus.get();

    if (status === 'offline') {
      if (contentArea) contentArea.classList.add('opacity-0');
      updateLoaderState(LOADER_ID, 'error', 'Sin conexión con el servidor');
      return;
    }

    if (!hasData) {
      if (contentArea) contentArea.classList.add('opacity-0');
      
      const msg = currentQuery 
        ? `Sin resultados para "${currentQuery}"` 
        : "No hay noticias disponibles"; // Mensaje por defecto si está vacío
        
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  // Suscripción al store
  refreshState();
  backendStatus.subscribe(refreshState);

  // 2. Inicialización de UI
  initializeAdminUI();
  initializeModalController();

  // 3. Configuración del Buscador (SearchFilter)
  const searchInput = document.getElementById('news-search') as HTMLInputElement;
  if (currentQuery && searchInput) searchInput.value = currentQuery;

  setupAdvancedSearch({
    inputId: "news-search",
    
    // IMPORTANTE: ID del botón X para que funcione la limpieza
    clearBtnId: "news-search-clear", 
    
    // Asegúrate de que este endpoint sea correcto (search o paged)
    searchEndpoint: "http://localhost:8080/api/news/search", 
    baseUrl: window.location.pathname,
    debounceMs: 300,
    
    // Formateador para adaptar el JSON de News al buscador
    formatter: (item) => {
      return {
        title: item.title,
        // Usa summary, description o body recortado
        description: item.summary || item.description || "" 
      };
    }
  });

  // 4. Carga de Imágenes (Lazy Loading)
  if (hasData) {
      const newsImageLoader = createImageLoader({
        basePath: "http://localhost:8080/assets/news", // Ajusta si tu ruta de assets es diferente
        dataAttribute: "data-news-image",
      });
      newsImageLoader.loadImages();
      newsImageLoader.setupObserver("news-list-container");
  }
}