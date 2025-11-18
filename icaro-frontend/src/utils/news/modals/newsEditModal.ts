// utils/news/modals/newsEditModal.ts
// Lógica del modal de editar noticia - Simplificado

import { modalActions } from "@/stores/modalStore";
import { 
  updateNews, 
  type UpdateNewsData 
} from "@/services/news/newsEditService";

let scrollPosition = 0;

/**
 * Muestra el modal de edición con los datos de la noticia
 */
export function showEditModal(newsData: any) {
  const modal = document.getElementById("editModal");
  if (!modal) {
    console.error("[newsEditModal] Modal no encontrado");
    return;
  }

  // Rellenar formulario con los datos
  fillEditForm(newsData);

  // Guardar posición de scroll
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;

  // Mostrar modal
  modal.classList.remove("hidden");

  // Enfocar primer input
  setTimeout(() => {
    const firstInput = modal.querySelector("input:not([readonly]), textarea") as HTMLElement;
    if (firstInput) firstInput.focus();
  }, 100);
}

/**
 * Oculta el modal de edición
 */
export function hideEditModal() {
  const modal = document.getElementById("editModal");
  const form = document.getElementById("editForm") as HTMLFormElement;
  
  if (!modal) return;

  // Ocultar modal
  modal.classList.add("hidden");

  // Restaurar scroll
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);

  // Limpiar formulario
  if (form) form.reset();

  // Cerrar en el store
  modalActions.close();
}

/**
 * Rellena el formulario con los datos de la noticia
 */
function fillEditForm(data: any) {
  const form = document.getElementById("editForm") as HTMLFormElement;
  if (!form) return;

  // Rellenar campos
  (document.getElementById("editId") as HTMLInputElement).value = data.id || "";
  (document.getElementById("editIdDisplay") as HTMLInputElement).value = data.id || "";
  (document.getElementById("editTitle") as HTMLInputElement).value = data.title || "";
  (document.getElementById("editDescription") as HTMLTextAreaElement).value = data.description || "";
  (document.getElementById("editLink") as HTMLInputElement).value = data.link || "";
  (document.getElementById("editpublicationDate") as HTMLInputElement).value = data.publicationDate || "";
  (document.getElementById("editHighlighted") as HTMLInputElement).checked = data.highlighted || false;

  // Actualizar título del modal
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) {
    modalTitle.textContent = `Editar "${data.title}"`;
  }
}

/**
 * Maneja el submit del formulario
 */
async function handleFormSubmit(event: Event) {
  event.preventDefault();

  // Obtener funciones globales de adminUI
  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification;

  if (!getAuthHeaders || !addNotification) {
    console.error("[newsEditModal] Funciones de adminUI no encontradas");
    alert("Error de inicialización. Refresque la página.");
    return;
  }

  const form = event.target as HTMLFormElement;

  // Obtener datos del formulario
  const id = (document.getElementById("editId") as HTMLInputElement).value.trim();
  const title = (document.getElementById("editTitle") as HTMLInputElement).value.trim();
  const description = (document.getElementById("editDescription") as HTMLTextAreaElement).value.trim();

  // Validar campos obligatorios
  if (!id || !title || !description) {
    addNotification("error", "ID, Título y Descripción son obligatorios.");
    return;
  }

  // Preparar datos
  const newsData: UpdateNewsData = {
    id,
    title,
    description,
    link: (document.getElementById("editLink") as HTMLInputElement).value.trim() || null,
    publicationDate: (document.getElementById("editpublicationDate") as HTMLInputElement).value || null,
    highlighted: (document.getElementById("editHighlighted") as HTMLInputElement).checked,
  };

  // Llamar al servicio
  const result = await updateNews(newsData, getAuthHeaders());

  if (result.success) {
    addNotification("success", result.message);
    hideEditModal();
    
    // Recargar página para mostrar cambios
    setTimeout(() => window.location.reload(), 500);
  } else {
    addNotification("error", `Error al actualizar: ${result.message}`);
  }
}

/**
 * Inicializa el modal de edición
 */
export function initializeEditModal() {
  console.log("[newsEditModal] Inicializando...");

  const modal = document.getElementById("editModal");
  const form = document.getElementById("editForm");

  if (!modal || !form) {
    console.warn("[newsEditModal] Faltan elementos del DOM");
    return;
  }

  // Event listener para el formulario
  form.addEventListener("submit", handleFormSubmit);

  // Cerrar al hacer clic en el overlay
  modal.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
      hideEditModal();
    }
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      hideEditModal();
    }
  });

  console.log("✅ [newsEditModal] Inicializado");
}

// Exponer funciones al window para los botones de las cards
if (typeof window !== "undefined") {
  (window as any).editNews = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const newsData = {
      id: button.dataset.newsId || "",
      title: button.dataset.newsTitle || "",
      description: button.dataset.newsDescription || "",
      link: button.dataset.newsLink || "",
      publicationDate: button.dataset.newsPublicationdate || "",
      highlighted: button.dataset.newsHighlighted === "true",
    };

    showEditModal(newsData);
  };

  (window as any).hideModal = hideEditModal;
  (window as any).showEditModal = showEditModal;
}