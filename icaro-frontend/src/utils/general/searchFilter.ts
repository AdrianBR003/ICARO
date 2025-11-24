interface SearchConfig {
  inputId: string;
  searchEndpoint: string;
  baseUrl: string;
  debounceMs?: number;
}

export function setupAdvancedSearch(config: SearchConfig) {
  const {
    inputId,
    searchEndpoint,
    baseUrl,
    debounceMs = 300,
  } = config;

  const searchInput = document.getElementById(inputId) as HTMLInputElement;
  const form = searchInput?.closest('form');

  if (!searchInput || !form) {
    console.warn("[SearchFilter] Input o form no encontrado");
    return;
  }

  let debounceTimer: number | null = null;
  const cache = new Map<string, any>();

  injectStyles();

  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.className = "search-suggestions";
  suggestionsContainer.style.display = "none";
  searchInput.parentElement?.appendChild(suggestionsContainer);

  searchInput.addEventListener("input", (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.trim();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (searchTerm === "") {
      hideSuggestions();
      return;
    }

    debounceTimer = window.setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, debounceMs);
  });

  form.addEventListener('submit', (e) => {
    const query = searchInput.value.trim();
    
    if (query === '') {
      e.preventDefault();
      return;
    }

    if (/^[\(\)\[\]\{\}\.\*\+\?\^\$\|\\]+$/.test(query)) {
      e.preventDefault();
      showError("Por favor, introduce un término de búsqueda válido");
      return;
    }

    hideSuggestions();
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target as Node) && 
        !suggestionsContainer.contains(e.target as Node)) {
      hideSuggestions();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  async function fetchSuggestions(searchTerm: string) {
    showLoading();

    try {
      // Revisar cache
      if (cache.has(searchTerm)) {
        const cachedData = cache.get(searchTerm);
        showSuggestions(cachedData, searchTerm);
        return;
      }

      // Fetch real
      const response = await fetch(
        `${searchEndpoint}?query=${encodeURIComponent(searchTerm)}&page=0&size=5`
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      cache.set(searchTerm, data);
      showSuggestions(data, searchTerm);
      
    } catch (error) {
      console.error("[SearchFilter] Error:", error);
      showError();
    }
  }

  // --- Función: Mostrar Sugerencias ---
  function showSuggestions(data: any, searchTerm: string) {
    const results = data.content || [];
    const totalElements = data.totalElements || 0;

    if (results.length === 0) {
      showNoResults();
      return;
    }

    suggestionsContainer.innerHTML = `
      <div class="suggestions-header">
        ${totalElements} resultado${totalElements !== 1 ? 's' : ''} encontrado${totalElements !== 1 ? 's' : ''}
      </div>
      <div class="suggestions-list">
        ${results.map((result: any) => `
          <div class="suggestion-item" data-title="${escapeHtml(result.title)}">
            <div class="suggestion-title">
              ${highlightText(result.title, searchTerm)}
            </div>
            <div class="suggestion-description">
              ${truncate(result.description, 80)}
            </div>
          </div>
        `).join('')}
      </div>
      ${totalElements > 5 ? 
        `<div class="suggestions-footer" data-query="${escapeHtml(searchTerm)}">
          Ver todos los ${totalElements} resultados →
        </div>` 
        : ''
      }
    `;
    
    suggestionsContainer.style.display = "block";

    // Click en sugerencia → autocompletar y buscar ese título
    suggestionsContainer.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", () => {
        const title = item.getAttribute("data-title") || "";
        if (title) {
          searchInput.value = title;
          hideSuggestions();
          navigateToSearch(title);
        }
      });
    });

    // Click en footer → buscar con el término original
    const footer = suggestionsContainer.querySelector(".suggestions-footer");
    if (footer) {
      footer.addEventListener("click", () => {
        const query = footer.getAttribute("data-query") || "";
        searchInput.value = query;
        hideSuggestions();
        navigateToSearch(query);
      });
    }
  }

  // --- Función: Navegación SSR ---
  function navigateToSearch(query: string) {
    window.location.href = `${baseUrl}?query=${encodeURIComponent(query)}`;
  }

  // --- Estados visuales ---
  function showLoading() {
    suggestionsContainer.innerHTML = `
      <div class="suggestions-loading">
        <div class="loading-spinner"></div>
        Buscando...
      </div>
    `;
    suggestionsContainer.style.display = "block";
  }

  function showNoResults() {
    suggestionsContainer.innerHTML = `
      <div class="suggestions-empty">
        No se encontraron resultados
      </div>
    `;
    suggestionsContainer.style.display = "block";
  }

  function showError() {
    suggestionsContainer.innerHTML = `
      <div class="suggestions-error">
        Error al buscar. Intenta de nuevo.
      </div>
    `;
    suggestionsContainer.style.display = "block";
  }

  function hideSuggestions() {
    suggestionsContainer.style.display = "none";
  }

  // --- Helpers ---
  function highlightText(text: string, term: string): string {
    if (!text || !term) return text || "";
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function truncate(text: string, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength 
      ? text.substring(0, maxLength) + "..." 
      : text;
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // --- Cleanup ---
  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    cache.clear();
    suggestionsContainer.remove();
  };
}

// --- Inyectar estilos ---
function injectStyles() {
  if (document.getElementById('search-filter-styles')) return;

  const style = document.createElement("style");
  style.id = 'search-filter-styles';
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
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 50;
      max-height: 400px;
      overflow-y: auto;
    }

    .suggestions-header {
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .suggestions-list {
      padding: 0.5rem;
    }

    .suggestion-item {
      padding: 0.75rem;
      cursor: pointer;
      border-radius: 0.375rem;
      transition: all 0.15s ease;
    }

    .suggestion-item:hover {
      background: #f1f5f9;
      transform: translateX(2px);
    }

    .suggestion-title {
      font-weight: 500;
      color: #1e293b;
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .suggestion-title mark {
      background: #fef08a;
      padding: 0 0.25rem;
      border-radius: 0.125rem;
      font-weight: 600;
    }

    .suggestion-description {
      font-size: 0.8125rem;
      color: #64748b;
      line-height: 1.4;
    }

    .suggestions-footer {
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 0.8125rem;
      color: #3b82f6;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    
    .suggestions-footer:hover {
      background: #eff6ff;
      color: #2563eb;
    }

    .suggestions-loading,
    .suggestions-empty,
    .suggestions-error {
      padding: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
    }

    .suggestions-loading {
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid #e0e7ff;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .suggestions-empty {
      color: #64748b;
    }

    .suggestions-error {
      color: #dc2626;
    }
  `;
  document.head.appendChild(style);
}