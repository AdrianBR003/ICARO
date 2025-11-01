
import { adminState } from "@/stores/auth"; // Importa tu store

// --- CONFIGURACIÓN ---
const API_BASE_URL = "http://localhost:8080/api/news";
let scrollPosition = 0;

// --- FUNCIONES DEL MODAL (VISIBILIDAD) ---

function showModal() {
  const modal = document.getElementById("editModal");
  if (!modal) return;
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;
  modal.classList.remove("hidden");
  
  setTimeout(() => {
    const firstInput = modal.querySelector("input, textarea") as HTMLElement;
    if (firstInput) firstInput.focus();
  }, 100);
}

function hideModal() {
  const modal = document.getElementById("editModal");
  if (!modal) return;
  modal.classList.add("hidden");
  
  setTimeout(() => {
    document.body.classList.remove("modal-open");
    document.body.style.top = "";
    window.scrollTo(0, scrollPosition);
  }, 50);
}

// --- LÓGICA DE DATOS Y API ---

function generateNewsId() {
  return `news-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function handleAuthError(response: Response) {
  if (response.status === 401 || response.status === 403) {
    alert("Sesión expirada o inválida. Por favor, inicie sesión.");
    localStorage.removeItem("adminToken");
    // Actualiza el store, lo que actualizará la UI en todas partes
    adminState.set({ isAdmin: false, username: "" }); 
    window.location.href = "/admin-login"; // Redirige al login
    return true;
  }
  return false;
}

async function saveNews(newsData: any) {
  // Verificación directa contra el store
  if (!adminState.get().isAdmin) {
    alert("Debe iniciar sesión como administrador.");
    return false;
  }

  try {
    const authHeaders = getAuthHeaders();
    if (!authHeaders["Authorization"]) {
      throw new Error("Token no encontrado");
    }

    const isEdit = !!newsData.id && !newsData.id.startsWith("news-");
    const url = isEdit
      ? `${API_BASE_URL}/update`
      : `${API_BASE_URL}/create`;

    const response = await fetch(url, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(newsData),
    });

    if (response.ok) {
      // if (window.addNotification) window.addNotification("success", "Noticia guardada");
      return true;
    } else if (handleAuthError(response)) {
      return false;
    } else {
      const errorText = await response.text();
     //  if (window.addNotification) window.addNotification("error", `Error: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Error en saveNews:", error);
   // if (window.addNotification) window.addNotification("error", "Error de conexión");
    return false;
  }
}

// --- FUNCIÓN DE INICIALIZACIÓN ---

export function initializeEditModal() {
  console.log("🔔 [NewsEdit] Inicializando lógica del modal...");

  const editModal = document.getElementById("editModal");
  const editForm = document.getElementById("editForm");
  if (!editModal || !editForm) return;

  // 1. Adjuntar funciones al 'window' para los 'onclick'
  // (Usamos 'any' para extender el objeto 'window' sin errores de TS)
  (window as any).editNews = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Verificación de admin al momento de abrir
    if (!adminState.get().isAdmin) {
      alert("Debe iniciar sesión como administrador.");
      return;
    }

    const button = event.currentTarget as HTMLElement;
    const newsItem = button.dataset;

    // Poblar modal
    (document.getElementById("editId") as HTMLInputElement).value = newsItem.newsId || "";
    (document.getElementById("editIdDisplay") as HTMLInputElement).value = newsItem.newsId || generateNewsId();
    (document.getElementById("editTitle") as HTMLInputElement).value = newsItem.newsTitle || "";
    (document.getElementById("editDescription") as HTMLTextAreaElement).value = newsItem.newsDescription || "";
    (document.getElementById("editLink") as HTMLInputElement).value = newsItem.newsLink || "";
    (document.getElementById("editpublicationDate") as HTMLInputElement).value = newsItem.newsPublicationdate || "";
    (document.getElementById("editHighlighted") as HTMLInputElement).checked = newsItem.newsHighlighted === "true";
    (document.getElementById("modalTitle") as HTMLElement).textContent = newsItem.newsId
      ? `Editar "${newsItem.newsTitle}"`
      : "Crear Nueva Noticia";

    showModal();
  };

  (window as any).hideModal = hideModal;
  
  // 2. Listeners para cerrar el modal (Overlay y Escape)
  editModal.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
      hideModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideModal();
  });

  // 3. Listener para el formulario
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = (document.getElementById("editId") as HTMLInputElement).value || generateNewsId();
    const title = (document.getElementById("editTitle") as HTMLInputElement).value;
    const description = (document.getElementById("editDescription") as HTMLTextAreaElement).value;
    
    /** 
    if (!title.trim() || !description.trim()) {
      if (window.addNotification) window.addNotification("error", "Título y Descripción son obligatorios.");
      return;
    }

    */

    const newsData = {
      id: id,
      title: title.trim(),
      description: description.trim(),
      link: (document.getElementById("editLink") as HTMLInputElement).value.trim(),
      publicationDate: (document.getElementById("editpublicationDate") as HTMLInputElement).value || null,
      highlighted: (document.getElementById("editHighlighted") as HTMLInputElement).checked,
    };

    const success = await saveNews(newsData);

    if (success) {
      hideModal();
      (editForm as HTMLFormElement).reset();
      setTimeout(() => window.location.reload(), 100); // Recargar para ver cambios
    }
  });

  console.log("✅ [NewsEdit] Inicialización completa.");
}