import { modalStore, modalActions } from "@/stores/modalStore";
import { updateNews, type UpdateNewsData } from "@/services/news/newsEditService";

/**
 * Rellena el formulario con los datos de la noticia (Llamado al abrir)
 */
function fillEditForm(data: any) {
  const form = document.getElementById("editForm") as HTMLFormElement;
  if (!form) return;

  // Helper seguro
  const setVal = (id: string, val: any) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
    if (el) el.value = val || "";
  };

  setVal("editId", data.id);
  setVal("editIdDisplay", data.id);
  setVal("editTitle", data.title);
  setVal("editDescription", data.description);
  setVal("editLink", data.link);
  setVal("editpublicationDate", data.publicationDate);

  const checkEl = document.getElementById("editHighlighted") as HTMLInputElement;
  if (checkEl) checkEl.checked = data.highlighted || false;

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.textContent = `Editar "${data.title}"`;
}

/**
 * Maneja el submit del formulario
 */
async function handleFormSubmit(event: Event) {
  event.preventDefault();

  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification || alert;

  if (!getAuthHeaders) {
    console.error("[newsEditModal] Error: adminUI no cargado");
    return;
  }

  // Validar campos
  const id = (document.getElementById("editId") as HTMLInputElement).value.trim();
  const title = (document.getElementById("editTitle") as HTMLInputElement).value.trim();
  const description = (document.getElementById("editDescription") as HTMLTextAreaElement).value.trim();

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

  // Llamada API
  const result = await updateNews(newsData, getAuthHeaders());

  if (result.success) {
    addNotification("success", result.message);
    
    // Cerrar usando el Store (El controller ocultará la UI)
    modalActions.close();
    
    setTimeout(() => window.location.reload(), 500);
  } else {
    addNotification("error", `Error al actualizar: ${result.message}`);
  }
}

/**
 * Inicialización: Solo lógica interna y suscripción
 */
export function initializeEditModal() {
  const form = document.getElementById("editForm");
  if (!form) return;

  // 1. Suscripción al Store: Rellenar formulario al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'edit' && state.data) {
      fillEditForm(state.data);
    }
  });

  // 2. Evento Submit
  form.addEventListener("submit", handleFormSubmit);

  console.log("✅ [newsEditModal] Lógica de negocio inicializada");
}