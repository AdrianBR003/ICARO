interface SearchConfig {
  inputId: string;
  searchEndpoint: string;
  baseUrl: string;
  debounceMs?: number;
  clearBtnId?: string;
  formatter?: (item: any) => { title: string; description: string };
}

export function setupAdvancedSearch(config: SearchConfig) {
  const { 
    inputId, 
    searchEndpoint, 
    baseUrl, 
    debounceMs = 300, 
    formatter, 
    clearBtnId 
  } = config;

  const searchInput = document.getElementById(inputId) as HTMLInputElement;
  const form = searchInput?.closest("form");
  const clearBtn = clearBtnId ? document.getElementById(clearBtnId) : null;

  if (!searchInput || !form) {
    console.warn("[SearchFilter] Input or form not found");
    return;
  }

  let debounceTimer: number | null = null;
  const cache = new Map<string, any>();

  injectStyles();

  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.className = "search-suggestions";
  suggestionsContainer.style.display = "none";
  searchInput.parentElement?.appendChild(suggestionsContainer);

  // --- LÓGICA DE LIMPIEZA ---
  const clearSearch = () => {
    searchInput.value = "";
    hideSuggestions();
    searchInput.focus();
    navigateToSearch(""); 
  };

  // --- EVENT LISTENERS ---
  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearSearch();
    });
  }

  searchInput.addEventListener("input", (e) => {
    const searchTerm = (e.target as HTMLInputElement).value.trim();
    
    if (clearBtn) clearBtn.style.display = searchTerm ? 'flex' : 'none';

    if (debounceTimer) clearTimeout(debounceTimer);

    if (searchTerm === "") {
      hideSuggestions();
      return;
    }

    debounceTimer = window.setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, debounceMs);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    hideSuggestions();
    // Navegamos manteniendo filtros, incluso si query está vacío (para borrar búsqueda pero dejar filtros)
    navigateToSearch(query);
  });

  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    if (
      !searchInput.contains(target) &&
      !suggestionsContainer.contains(target) &&
      (!clearBtn || !clearBtn.contains(target))
    ) {
      hideSuggestions();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideSuggestions();
  });

  // --- FETCH LOGIC (SOLUCIÓN PARTE 1: AUTOCOMPLETADO CON FILTROS) ---
  async function fetchSuggestions(searchTerm: string) {
    try {
      // Clave de caché única por búsqueda Y filtros actuales
      const currentSearchParams = new URLSearchParams(window.location.search);
      currentSearchParams.set("query", searchTerm);
      // Ordenamos para que la clave sea consistente (a=1&b=2 igual a b=2&a=1)
      currentSearchParams.sort(); 
      const cacheKey = currentSearchParams.toString();

      if (cache.has(cacheKey)) {
        showSuggestions(cache.get(cacheKey), searchTerm);
        return;
      }

      const url = new URL(searchEndpoint, window.location.origin);
      
      // 1. Añadimos TODOS los parámetros actuales de la URL al endpoint
      const currentUrlParams = new URLSearchParams(window.location.search);
      currentUrlParams.forEach((value, key) => {
        // Excluimos paginación y size porque es una búsqueda nueva de sugerencias
        if (key !== 'page' && key !== 'size') {
          url.searchParams.set(key, value);
        }
      });

      // 2. Sobrescribimos la query y configuración de autocompletado
      url.searchParams.set("query", searchTerm);
      url.searchParams.set("page", "0");
      url.searchParams.set("size", "5");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      cache.set(cacheKey, data);
      showSuggestions(data, searchTerm);
    } catch (error) {
      console.error(error);
      showError();
    }
  }

  // --- RENDER LOGIC ---
  function showSuggestions(data: any, searchTerm: string) {
    const results = data.content || [];
    const totalElements = data.totalElements || 0;

    if (results.length === 0) {
      showNoResults();
      return;
    }

    suggestionsContainer.innerHTML = `
      <div class="suggestions-header">${totalElements} resultado${totalElements !== 1 ? "s" : ""}</div>
      <div class="suggestions-list">
        ${results.map((result: any) => {
            const { title, description } = formatter 
              ? formatter(result) 
              : { title: result.title, description: result.description };
            
            return `
            <div class="suggestion-item" data-title="${escapeHtml(title || "")}">
              <div class="suggestion-title">${highlightText(title || "", searchTerm)}</div>
              <div class="suggestion-description">${truncate(description || "", 80)}</div>
            </div>`;
          }).join("")}
      </div>
      ${totalElements > 5 ? `<div class="suggestions-footer" data-query="${escapeHtml(searchTerm)}">Ver todos →</div>` : ""}
    `;

    suggestionsContainer.style.display = "block";

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

    const footer = suggestionsContainer.querySelector(".suggestions-footer");
    if (footer) footer.addEventListener("click", () => {
        const query = footer.getAttribute("data-query") || "";
        searchInput.value = query;
        hideSuggestions();
        navigateToSearch(query);
    });
  }

  // --- NAVIGATION LOGIC (SOLUCIÓN PARTE 2: PERSISTENCIA AL DAR ENTER) ---
  function navigateToSearch(query: string) {
    // 1. Tomamos la URL actual tal cual está (con sus filtros tag, project, etc.)
    const currentUrl = new URL(window.location.href);
    
    // 2. Si la baseURL es diferente (ej: estamos en home y buscamos), cambiamos pathname
    // pero intentamos mantener params si son compatibles
    if (!currentUrl.pathname.endsWith(baseUrl) && baseUrl !== window.location.pathname) {
       currentUrl.pathname = baseUrl;
    }

    // 3. Gestionamos el parámetro query
    if (query) {
      currentUrl.searchParams.set("query", query);
    } else {
      currentUrl.searchParams.delete("query");
    }

    // 4. Reset de paginación (siempre a la 1 al cambiar búsqueda)
    currentUrl.searchParams.set("page", "0"); // O '1' si tu paginación empieza en 1, Spring suele ser 0

    // 5. IMPORTANTE: No tocamos 'tag', 'projectId', etc. Se quedan como están.
    
    window.location.href = currentUrl.toString();
  }

  // --- HELPERS ---
  function showNoResults() { suggestionsContainer.innerHTML = `<div class="suggestions-empty">Sin resultados</div>`; suggestionsContainer.style.display = "block"; }
  function showError() { suggestionsContainer.innerHTML = `<div class="suggestions-error">Error al buscar</div>`; suggestionsContainer.style.display = "block"; }
  function hideSuggestions() { suggestionsContainer.style.display = "none"; }
  function highlightText(text: string, term: string): string { if (!text || !term) return text || ""; const regex = new RegExp(`(${escapeRegex(term)})`, "gi"); return text.replace(regex, "<mark>$1</mark>"); }
  function truncate(text: string, maxLength: number): string { if (!text) return ""; return text.length > maxLength ? text.substring(0, maxLength) + "..." : text; }
  function escapeHtml(text: string): string { const div = document.createElement("div"); div.textContent = text; return div.innerHTML; }
  function escapeRegex(str: string): string { return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  
  function injectStyles() {
    if (document.getElementById("search-filter-styles")) return;
    const style = document.createElement("style");
    style.id = "search-filter-styles";
    style.textContent = `
      .search-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; margin-top: 0.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); z-index: 50; max-height: 400px; overflow-y: auto; }
      .suggestions-header { padding: 0.5rem 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
      .suggestions-list { padding: 0.5rem; }
      .suggestion-item { padding: 0.75rem; cursor: pointer; border-radius: 0.375rem; transition: all 0.15s; }
      .suggestion-item:hover { background: #f1f5f9; transform: translateX(2px); }
      .suggestion-title { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
      .suggestion-title mark { background: #fef08a; padding: 0 2px; border-radius: 2px; }
      .suggestion-description { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
      .suggestions-footer { padding: 0.75rem; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.8rem; color: #3b82f6; font-weight: 500; cursor: pointer; }
      .suggestions-footer:hover { background: #eff6ff; }
      .suggestions-empty, .suggestions-error { padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.9rem; }
      .suggestions-error { color: #dc2626; }
    `;
    document.head.appendChild(style);
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    cache.clear();
    suggestionsContainer.remove();
    if(clearBtn) clearBtn.replaceWith(clearBtn.cloneNode(true));
  };
}