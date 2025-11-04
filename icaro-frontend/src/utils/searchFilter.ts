interface SearchConfig {
  inputId: string;
  containerId: string;
  itemSelector: string;
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
    noResultsId,
    searchEndpoint,
    baseUrl,
    debounceMs = 500,
  } = config;

  const searchInput = document.getElementById(inputId) as HTMLInputElement;
  const noResultsEl = noResultsId ? document.getElementById(noResultsId) : null;

  const container = document.getElementById(containerId);
  const allItems = container 
    ? (Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[])
    : [];

  if (!searchInput) {
    console.warn("[SearchFilter] Input de búsqueda no encontrado");
    return;
  }

  let debounceTimer: number | null = null;
  let searchResultsCache = new Map<string, any>();

  checkUrlSearchParam();

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
      cursor: pointer;
      transition: all 0.15s;
    }
    
    .suggestions-footer:hover {
      background: #f1f5f9;
      color: #1e293b;
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

  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.id = "search-suggestions";
  suggestionsContainer.className = "search-suggestions";
  suggestionsContainer.style.display = "none";
  searchInput.parentElement?.appendChild(suggestionsContainer);

  function navigateToSearch(query: string) {
    if (!baseUrl) {
      console.error("[Search] baseUrl no está configurada.");
      return;
    }
    window.location.href = `${baseUrl}?query=${encodeURIComponent(query)}`;
  }

  function checkUrlSearchParam() {
    if (allItems.length === 0 || !baseUrl) return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get('search');
    
    if (searchId) {
      const targetItem = allItems.find(item => 
        item.getAttribute('data-news-id') === searchId
      );
      
      if (targetItem) {
        setTimeout(() => {
          targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetItem.style.transition = 'all 0.5s ease';
          targetItem.style.backgroundColor = '#fef08a';
          targetItem.style.transform = 'scale(1.02)';
          setTimeout(() => {
            targetItem.style.backgroundColor = '';
            targetItem.style.transform = '';
          }, 2000);
        }, 100);
        
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('search');
        window.history.replaceState({}, '', cleanUrl.toString());
      }
    }
  }

  async function fetchSuggestions(searchTerm: string) {
    if (!searchEndpoint) return;

    showLoading();

    try {
      if (searchResultsCache.has(searchTerm)) {
        const cachedData = searchResultsCache.get(searchTerm);
        showSuggestions(cachedData, searchTerm);
        hideLoading();
        return;
      }

      const response = await fetch(
        `${searchEndpoint}?query=${encodeURIComponent(searchTerm)}&page=0&size=5`
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      
      searchResultsCache.set(searchTerm, data);
      showSuggestions(data, searchTerm);
      
    } catch (error) {
      console.error("[Search] Error:", error);
      showError("Error al buscar. Intenta de nuevo.");
    } finally {
      hideLoading();
    }
  }

  function showSuggestions(data: any, searchTerm: string) {
    const results = data.content || [];
    const totalElements = data.totalElements || 0;

    if (results.length === 0) {
      showNoResults();
      return;
    }

    if (noResultsEl) noResultsEl.style.display = "none";

    suggestionsContainer.innerHTML = `
      <div class="suggestions-header">
        <strong>Sugerencias</strong>
      </div>
      <div class="suggestions-list">
        ${results.map((result: any) => `
          <div class="suggestion-item" data-query="${encodeURIComponent(result.title)}">
            <div class="suggestion-title">
              ${highlightText(result.title, searchTerm)}
            </div>
            <div class="suggestion-description">${truncate(result.description, 100)}</div>
          </div>
        `).join('')}
      </div>
      ${totalElements > 5 ? 
        `<div class="suggestions-footer" data-query="${encodeURIComponent(searchTerm)}">
          Ver todos los ${totalElements} resultados...
        </div>` 
        : ''
      }
    `;
    
    suggestionsContainer.style.display = "block";

    suggestionsContainer.querySelectorAll("[data-query]").forEach((item) => {
      item.addEventListener("click", () => {
        const query = decodeURIComponent(item.getAttribute("data-query") || "");
        if (query) {
          navigateToSearch(query);
        }
      });
    });
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
      if (noResultsEl) noResultsEl.style.display = "none";
      hideSuggestions();
      return;
    }

    if (searchEndpoint) {
      debounceTimer = window.setTimeout(() => {
        fetchSuggestions(searchTerm);
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

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    searchResultsCache.clear();
  };
}