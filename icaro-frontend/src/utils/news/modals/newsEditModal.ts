import { modalStore, modalActions } from "@/stores/modalStore";
import { updateNews, type UpdateNewsData } from "@/services/news/newsEditService";
import { uploadEntityImage } from "@/services/general/imageService";

/**
 * Rellena el formulario con los datos de la noticia al abrir el modal.
 * Se encarga de los campos de texto y de mostrar/ocultar la previsualización de la imagen.
 */
function fillEditForm(data: any) {
  const form = document.getElementById("editForm") as HTMLFormElement;
  if (!form) return;

  // Helper para asignar valores a inputs de forma segura
  const setVal = (id: string, val: any) => {
    const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
    if (el) el.value = val || "";
  };

  // 1. Rellenar campos de texto
  setVal("editId", data.id);
  setVal("editIdDisplay", data.id); // Input readonly visual
  setVal("editTitle", data.title);
  setVal("editDescription", data.description);
  setVal("editLink", data.link);
  setVal("editpublicationDate", data.publicationDate);

  const checkEl = document.getElementById("editHighlighted") as HTMLInputElement;
  if (checkEl) checkEl.checked = data.highlighted || false;

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.textContent = `Editar "${data.title}"`;

  // 2. Gestionar la Imagen
  const previewContainer = document.getElementById("edit-image-preview-container");
  const previewImg = document.getElementById("edit-image-preview") as HTMLImageElement;
  const fileInput = document.getElementById("edit-image-input") as HTMLInputElement;

  // Limpiamos el input de archivo siempre que abrimos el modal
  if (fileInput) fileInput.value = "";

  // Si la noticia tiene imagen (imageName), mostramos la previsualización desde Nginx
  if (data.imageName && previewContainer && previewImg) {
    previewImg.src = `/uploads/news/${data.imageName}`;
    previewContainer.classList.remove("hidden");
  } else if (previewContainer) {
    // Si no tiene imagen, ocultamos el recuadro de previsualización
    previewContainer.classList.add("hidden");
  }
}

/**
 * Maneja el envío del formulario.
 * Realiza el proceso en dos pasos: 1. Actualizar datos (JSON) -> 2. Subir imagen (FormData)
 */
async function handleFormSubmit(event: Event) {
  event.preventDefault();

  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification || alert;

  if (!getAuthHeaders) {
    console.error("[newsEditModal] Error: adminUI no cargado");
    return;
  }

  const headers = getAuthHeaders(); // Obtenemos las cabeceras una vez

  // Validar campos obligatorios
  const id = (document.getElementById("editId") as HTMLInputElement).value.trim();
  const title = (document.getElementById("editTitle") as HTMLInputElement).value.trim();
  const description = (document.getElementById("editDescription") as HTMLTextAreaElement).value.trim();

  if (!id || !title || !description) {
    addNotification("error", "ID, Título y Descripción son obligatorios.");
    return;
  }

  // Preparar datos JSON
  const newsData: UpdateNewsData = {
    id,
    title,
    description,
    link: (document.getElementById("editLink") as HTMLInputElement).value.trim() || null,
    publicationDate: (document.getElementById("editpublicationDate") as HTMLInputElement).value || null,
    highlighted: (document.getElementById("editHighlighted") as HTMLInputElement).checked,
  };

  if (addNotification) addNotification("info", "Actualizando noticia...");

  // PASO 1: Llamada API para actualizar textos
  const result = await updateNews(newsData, headers);

  if (result.success) {
    
    // PASO 2: Verificar si hay una imagen NUEVA para subir
    const imageInput = document.getElementById("edit-image-input") as HTMLInputElement;
    let imageError = false;

    if (imageInput && imageInput.files && imageInput.files.length > 0) {
        if (addNotification) addNotification("info", "Actualizando imagen...");
        
        try {
            const file = imageInput.files[0];
            // Usamos el servicio genérico (borrará el Content-Type automáticamente)
            await uploadEntityImage('news', id, file, headers);
            console.log("✅ Imagen actualizada");
        } catch (error: any) {
            console.error("❌ Error subiendo imagen:", error);
            imageError = true;
            addNotification("warning", "Datos actualizados, pero falló la imagen: " + error.message);
        }
    }

    // Finalización
    if (!imageError) {
        addNotification("success", "Noticia actualizada correctamente");
    }
    
    modalActions.close();
    
    // Recarga para ver cambios (texto e imagen nueva)
    setTimeout(() => window.location.reload(), 500);

  } else {
    addNotification("error", `Error al actualizar: ${result.message}`);
  }
}

/**
 * Inicialización: Suscribe el modal al store y configura los eventos.
 */
export function initializeEditModal() {
  const form = document.getElementById("editForm");
  if (!form) return;

  // 1. Suscripción al Store: Cuando se abre el modal 'edit', rellena el formulario
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'edit' && state.data) {
      fillEditForm(state.data);
    }
  });

  // 2. Evento Submit
  form.addEventListener("submit", handleFormSubmit);

  console.log("✅ [newsEditModal] Lógica de negocio inicializada");
}