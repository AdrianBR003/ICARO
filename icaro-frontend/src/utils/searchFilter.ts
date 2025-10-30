interface SearchConfig {
  inputId: string;
  containerId: string;
  itemSelector: string;
  titleSelector?: string;
  descriptionSelector?: string;
  noResultsId?: string;
  searchEndpoint?: string;
  baseUrl?: string;
  debounceMs?: number;
}

export function setupAdvancedSearch(config: SearchConfig) {
  const {
    inputId,
    containerId,
    itemSelector,
    titleSelector,
    descriptionSelector,
    noResultsId,
    searchEndpoint,
    baseUrl,
    debounceMs = 500,
  } = config;

  const searchInput = document.getElementById(inputId) as HTMLInputElement;
  const container = document.getElementById(containerId);
  const noResultsEl = noResultsId ? document.getElementById(noResultsId) : null;

  if (!searchInput || !container) {
    console.warn("[SearchFilter] Elementos no encontrados");
    return;
  }

  const allItems = Array.from(
    container.querySelectorAll(itemSelector)
  ) as HTMLElement[];

  let debounceTimer: number | null = null;
  let searchResultsCache = new Map<string, any>();

  // Procesar parámetro de búsqueda si existe al cargar la página
  checkUrlSearchParam();

  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.id = "search-suggestions";
  suggestionsContainer.className = "search-suggestions";
  suggestionsContainer.style.display = "none";
  searchInput.parentElement?.appendChild(suggestionsContainer);

  /**
   * Verifica si hay un parámetro de búsqueda en la URL al cargar
   */
  function checkUrlSearchParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get('search');
    
    if (searchId) {
      // Buscar el item con ese ID
      const targetItem = allItems.find(item => 
        item.getAttribute('data-news-id') === searchId
      );
      
      if (targetItem) {
        // Hacer scroll suave al elemento
        setTimeout(() => {
          targetItem.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Resaltar temporalmente
          targetItem.style.transition = 'all 0.5s ease';
          targetItem.style.backgroundColor = '#fef08a';
          targetItem.style.transform = 'scale(1.02)';
          
          setTimeout(() => {
            targetItem.style.backgroundColor = '';
            targetItem.style.transform = '';
          }, 2000);
        }, 100);
        
        // Limpiar el parámetro de la URL
        window.history.replaceState({}, '', baseUrl || window.location.pathname);
      }
    }
  }

  function getItemText(item: HTMLElement): string {
    let text = "";
    
    if (titleSelector) {
      text += item.querySelector(titleSelector)?.textContent?.toLowerCase() || "";
    }
    
    if (descriptionSelector) {
      text += " " + (item.querySelector(descriptionSelector)?.textContent?.toLowerCase() || "");
    }
    
    if (!titleSelector && !descriptionSelector) {
      text = item.textContent?.toLowerCase() || "";
    }
    
    return text;
  }

  function searchLocal(searchTerm: string): number {
    let found = 0;
    
    allItems.forEach((item) => {
      const text = getItemText(item);
      const isMatch = text.includes(searchTerm);
      
      item.style.display = isMatch ? "" : "none";
      if (isMatch) found++;
    });
    
    return found;
  }

  async function searchBackendWithNavigation(searchTerm: string) {
    if (!searchEndpoint) return;

    showLoading();

    try {
      if (searchResultsCache.has(searchTerm)) {
        const cachedData = searchResultsCache.get(searchTerm);
        handleSearchResults(cachedData, searchTerm);
        return;
      }

      const response = await fetch(
        `${searchEndpoint}?query=${encodeURIComponent(searchTerm)}&page=0&size=50`
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      
      searchResultsCache.set(searchTerm, data);
      handleSearchResults(data, searchTerm);
      
    } catch (error) {
      console.error("[Search] Error:", error);
      showError("Error al buscar. Intenta de nuevo.");
    } finally {
      hideLoading();
    }
  }

  function handleSearchResults(data: any, searchTerm: string) {
    const results = data.content || [];
    
    allItems.forEach((item) => {
      item.style.display = "none";
    });

    const matchingIds = new Set(results.map((r: any) => r.id));
    let foundInCurrentPage = 0;

    allItems.forEach((item) => {
      const itemId = item.getAttribute("data-news-id");
      if (itemId && matchingIds.has(parseInt(itemId))) {
        item.style.display = "";
        foundInCurrentPage++;
      }
    });

    if (results.length > 0 && foundInCurrentPage === 0) {
      showSuggestions(results, searchTerm);
    } else if (results.length === 0) {
      showNoResults();
    } else {
      hideSuggestions();
      if (noResultsEl) noResultsEl.style.display = "none";
    }
  }

  function showSuggestions(results: any[], searchTerm: string) {
    suggestionsContainer.innerHTML = `
      <div class="suggestions-header">
        <strong>${results.length}</strong> resultado(s) encontrado(s) en otras páginas
      </div>
      <div class="suggestions-list">
        ${results.slice(0, 5).map((result: any) => {
          const pageInfo = result.pageNumber !== undefined 
            ? `📄 Página ${result.pageNumber + 1}` 
            : '';
          
          return `
            <div class="suggestion-item" data-result='${JSON.stringify(result)}'>
              <div class="suggestion-title">
                ${highlightText(result.title, searchTerm)}
                ${pageInfo ? `<span class="page-badge">${pageInfo}</span>` : ''}
              </div>
              <div class="suggestion-description">${truncate(result.description, 100)}</div>
            </div>
          `;
        }).join('')}
      </div>
      ${results.length > 5 ? 
        `<div class="suggestions-footer">Y ${results.length - 5} más resultados...</div>` 
        : ''
      }
    `;
    
    suggestionsContainer.style.display = "block";

    suggestionsContainer.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", () => {
        const result = JSON.parse(item.getAttribute("data-result") || "{}");
        navigateToResult(result);
      });
    });
  }

  /**
   * Navega al resultado usando el pageNumber del backend
   */
  function navigateToResult(result: any) {
    if (!result.id || !baseUrl) return;
    
    if (result.pageNumber !== undefined) {
      // Usar el número de página exacto que viene del backend
      // pageNumber es base-0, así que sumamos 1 para la URL
      window.location.href = `${baseUrl}?page=${result.pageNumber + 1}&search=${result.id}`;
    } else {
      // Fallback si no hay pageNumber (no debería ocurrir)
      console.warn("Resultado sin pageNumber:", result);
      window.location.href = `${baseUrl}?search=${result.id}`;
    }
  }

  function highlightText(text: string, term: string): string {
    if (!text) return "";
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function truncate(text: string, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
  }

  function showLoading() {
    if (noResultsEl) {
      noResultsEl.textContent = "🔍 Buscando en todas las páginas...";
      noResultsEl.className = "search-status loading";
      noResultsEl.style.display = "block";
    }
  }

  function hideLoading() {
    if (noResultsEl && noResultsEl.className.includes("loading")) {
      noResultsEl.style.display = "none";
    }
  }

  function showNoResults() {
    if (noResultsEl) {
      noResultsEl.textContent = "No se encontraron resultados.";
      noResultsEl.className = "search-status no-results";
      noResultsEl.style.display = "block";
    }
    hideSuggestions();
  }

  function showError(message: string) {
    if (noResultsEl) {
      noResultsEl.textContent = message;
      noResultsEl.className = "search-status error";
      noResultsEl.style.display = "block";
    }
  }

  function hideSuggestions() {
    suggestionsContainer.style.display = "none";
  }

  searchInput.addEventListener("input", (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase().trim();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (searchTerm === "") {
      allItems.forEach((item) => {
        item.style.display = "";
      });
      if (noResultsEl) noResultsEl.style.display = "none";
      hideSuggestions();
      return;
    }

    const localResults = searchLocal(searchTerm);

    if (localResults > 0) {
      if (noResultsEl) noResultsEl.style.display = "none";
      hideSuggestions();
    } else if (searchEndpoint) {
      debounceTimer = window.setTimeout(() => {
        searchBackendWithNavigation(searchTerm);
      }, debounceMs);
    } else {
      showNoResults();
    }
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target as Node) && 
        !suggestionsContainer.contains(e.target as Node)) {
      hideSuggestions();
    }
  });

  const style = document.createElement("style");
  style.textContent = `
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      margin-top: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 50;
      max-height: 400px;
      overflow-y: auto;
    }

    .suggestions-header {
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .suggestions-list {
      padding: 0.5rem;
    }

    .suggestion-item {
      padding: 0.75rem;
      cursor: pointer;
      border-radius: 0.375rem;
      transition: all 0.15s;
    }

    .suggestion-item:hover {
      background: #f1f5f9;
      transform: translateX(4px);
    }

    .suggestion-title {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .suggestion-title mark {
      background: #fef08a;
      padding: 0.125rem 0.25rem;
      border-radius: 0.125rem;
    }

    .page-badge {
      font-size: 0.75rem;
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .suggestion-description {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.4;
    }

    .suggestions-footer {
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 0.875rem;
      color: #64748b;
      font-style: italic;
    }

    .search-status {
      padding: 1rem;
      border-radius: 0.5rem;
      text-align: center;
      margin: 1rem 0;
    }

    .search-status.loading {
      background: #eff6ff;
      color: #3b82f6;
      border: 1px solid #dbeafe;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .search-status.no-results {
      background: #f8fafc;
      color: #64748b;
      border: 1px dashed #cbd5e1;
    }

    .search-status.error {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
  `;
  document.head.appendChild(style);

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    searchResultsCache.clear();
  };
}