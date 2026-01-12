import { createImageLoader } from "@/utils/general/imageLoaderFactory";
import { initializeAdminUI } from "@/utils/general/adminUI";
import { setupAdvancedSearch } from "@/utils/general/searchFilter";
import { initializeModalController } from "@/utils/news/newsModalController";
import { backendStatus } from "@/stores/backendStatusStore";
import { updateLoaderState, hideLoader } from "@/services/general/loaderService";
import { API_BASE, API_URL } from "@/configAPI";

export function initNewsList() {
  const LOADER_ID = 'news-list-loader';
  const contentArea = document.getElementById('content-area');
  const listContainer = document.getElementById('news-list-container');
  const hasData = listContainer !== null;
  
  const urlParams = new URLSearchParams(window.location.search);
  const currentQuery = urlParams.get('query');

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
        : "No hay noticias disponibles";
        
      updateLoaderState(LOADER_ID, 'empty', msg);
      return;
    }

    hideLoader(LOADER_ID);
    if (contentArea) contentArea.classList.remove('opacity-0');
  };

  refreshState();
  backendStatus.subscribe(refreshState);

  initializeAdminUI();
  initializeModalController();

  const searchInput = document.getElementById('news-search') as HTMLInputElement;
  if (currentQuery && searchInput) searchInput.value = currentQuery;

  setupAdvancedSearch({
    inputId: "news-search",
    
    clearBtnId: "news-search-clear", 
    
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

  if (hasData) {
      const newsImageLoader = createImageLoader({
        basePath: `${API_URL}/assets/news`,
        dataAttribute: "data-news-image",
      });
      newsImageLoader.loadImages();
      newsImageLoader.setupObserver("news-list-container");
  }
}