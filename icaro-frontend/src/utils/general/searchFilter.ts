interface SearchConfig {
  inputId: string;
  searchEndpoint: string;
  baseUrl: string;
  debounceMs?: number;
}

export function setupAdvancedSearch(config: SearchConfig) {
  const { inputId, searchEndpoint, baseUrl, debounceMs = 300 } = config;

  const searchInput = document.getElementById(inputId) as HTMLInputElement;
  const form = searchInput?.closest("form");

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

  // --- Event Listeners ---

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

  form.addEventListener("submit", (e) => {
    const query = searchInput.value.trim();

    if (query === "") {
      e.preventDefault();
      return;
    }

    if (/^[\(\)\[\]\{\}\.\*\+\?\^\$\|\\]+$/.test(query)) {
      e.preventDefault();
      showError();
      return;
    }

    e.preventDefault();
    hideSuggestions();
    navigateToSearch(query);
  });

  document.addEventListener("click", (e) => {
    if (
      !searchInput.contains(e.target as Node) &&
      !suggestionsContainer.contains(e.target as Node)
    ) {
      hideSuggestions();
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  // --- Fetch Logic (Corregida con URL Object) ---

  async function fetchSuggestions(searchTerm: string) {
    try {
      if (cache.has(searchTerm)) {
        const cachedData = cache.get(searchTerm);
        showSuggestions(cachedData, searchTerm);
        return;
      }

      // Construcción robusta de la URL para el backend
      const url = new URL(searchEndpoint, window.location.origin);
      url.searchParams.set("query", searchTerm);
      url.searchParams.set("page", "0");
      url.searchParams.set("size", "5");

      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.has("tag"))
        url.searchParams.set("tag", currentParams.get("tag")!);
      if (currentParams.has("projectId"))
        url.searchParams.set("projectId", currentParams.get("projectId")!);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      cache.set(searchTerm, data);
      showSuggestions(data, searchTerm);
    } catch (error) {
      console.error("[SearchFilter] Error:", error);
      showError();
    }
  }

  // --- Render Logic ---

  function showSuggestions(data: any, searchTerm: string) {
    const results = data.content || [];
    const totalElements = data.totalElements || 0;

    if (results.length === 0) {
      showNoResults();
      return;
    }

    suggestionsContainer.innerHTML = `
      <div class="suggestions-header">
        ${totalElements} resultado${totalElements !== 1 ? "s" : ""}
      </div>
      <div class="suggestions-list">
        ${results
          .map(
            (result: any) => `
          <div class="suggestion-item" data-title="${escapeHtml(result.title)}">
            <div class="suggestion-title">
              ${highlightText(result.title, searchTerm)}
            </div>
            <div class="suggestion-description">
              ${truncate(result.description, 80)}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      ${
        totalElements > 5
          ? `<div class="suggestions-footer" data-query="${escapeHtml(
              searchTerm
            )}">
          Ver todos los resultados →
        </div>`
          : ""
      }
    `;

    suggestionsContainer.style.display = "block";

    // Click en Item Sugerido
    suggestionsContainer
      .querySelectorAll(".suggestion-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          const title = item.getAttribute("data-title") || "";
          if (title) {
            searchInput.value = title;
            hideSuggestions();
            navigateToSearch(title); 
          }
        });
      });

    // Click en "Ver todos"
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


  // --- Función: Navegación Acumulativa ---
  function navigateToSearch(query: string) {
    const currentUrl = new URL(window.location.href);
    const targetBase = new URL(baseUrl, window.location.origin);

    // ¿Estamos en la misma página (ej: /research)?
    if (currentUrl.pathname === targetBase.pathname) {
      
      // 1. Actualizamos SOLO la query
      if (query) {
        currentUrl.searchParams.set("query", query);
      } else {
        currentUrl.searchParams.delete("query"); // Si borra el texto, quitamos param
      }
      
      // 2. Reseteamos paginación (siempre a la 1 al filtrar)
      currentUrl.searchParams.set("page", "1");

      // 3. NO TOCAMOS LOS DEMÁS FILTROS
      // (tag, project, projectId se quedan como están)

      window.location.href = currentUrl.toString();
    } else {
      // Si venimos de otra página, vamos limpios
      targetBase.searchParams.set("query", query);
      window.location.href = targetBase.toString();
    }
  }

  // --- Estados Visuales y Helpers ---

  function showNoResults() {
    suggestionsContainer.innerHTML = `<div class="suggestions-empty">Sin resultados</div>`;
    suggestionsContainer.style.display = "block";
  }

  function showError() {
    suggestionsContainer.innerHTML = `<div class="suggestions-error">Error al buscar</div>`;
    suggestionsContainer.style.display = "block";
  }

  function hideSuggestions() {
    suggestionsContainer.style.display = "none";
  }

  function highlightText(text: string, term: string): string {
    if (!text || !term) return text || "";
    const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  function truncate(text: string, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // --- Inyección de Estilos ---
  function injectStyles() {
    if (document.getElementById("search-filter-styles")) return;
    const style = document.createElement("style");
    style.id = "search-filter-styles";
    style.textContent = `
      .search-suggestions {
        position: absolute; top: 100%; left: 0; right: 0;
        background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem;
        margin-top: 0.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 50; max-height: 400px; overflow-y: auto;
      }
      .suggestions-header {
        padding: 0.5rem 1rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
        font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;
      }
      .suggestions-list { padding: 0.5rem; }
      .suggestion-item {
        padding: 0.75rem; cursor: pointer; border-radius: 0.375rem; transition: all 0.15s;
      }
      .suggestion-item:hover { background: #f1f5f9; transform: translateX(2px); }
      .suggestion-title { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
      .suggestion-title mark { background: #fef08a; padding: 0 2px; border-radius: 2px; }
      .suggestion-description { font-size: 0.8rem; color: #64748b; margin-top: 2px; }
      .suggestions-footer {
        padding: 0.75rem; background: #f8fafc; border-top: 1px solid #e2e8f0;
        text-align: center; font-size: 0.8rem; color: #3b82f6; font-weight: 500; cursor: pointer;
      }
      .suggestions-footer:hover { background: #eff6ff; }
      .suggestions-loading, .suggestions-empty, .suggestions-error { padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.9rem; }
      .suggestions-error { color: #dc2626; }
    `;
    document.head.appendChild(style);
  }

  // Cleanup
  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    cache.clear();
    suggestionsContainer.remove();
  };
}
