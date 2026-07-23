// /utils/news/modals/newsEditModal.ts

import { modalStore, modalActions } from "@/stores/modalStore";
import {
  updateNews,
  type UpdateNewsData,
} from "@/services/news/newsEditService";
import { uploadEntityImage } from "@/services/general/imageService";

/**
 * Rellena el formulario con los datos de la noticia al abrir el modal.
 */
function fillEditForm(data: any) {
  const form = document.getElementById("editForm") as HTMLFormElement;
  if (!form) {
    console.warn("⚠️ Formulario no encontrado");
    return;
  }

  // Helper function para setear valores
  const setVal = (id: string, val: any) => {
    const el = document.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement;
    if (el) el.value = val || "";
  };

  // 1. Campos de texto
  setVal("editId", data.id);
  setVal("editIdDisplay", data.id);
  setVal("editTitle", data.title);
  setVal("editDescription", data.description);
  setVal("editLink", data.link);
  setVal("editpublicationDate", data.publicationDate);
  setVal("editCurrentImageName", data.imageName);

  // 2. Checkbox - ARREGLADO
  const checkEl = document.getElementById("editHighlighted") as HTMLInputElement;

  if (checkEl) {
    // Normalizar el valor a boolean estricto
    const isHighlighted = Boolean(
      data.highlighted === true ||
        data.highlighted === "true" ||
        data.highlighted === 1 ||
        String(data.highlighted).toLowerCase() === "true"
    );

    console.log("🔍 Debug checkbox ANTES:", {
      dataValue: data.highlighted,
      typeOfData: typeof data.highlighted,
      isHighlighted: isHighlighted,
      checkboxCheckedBefore: checkEl.checked
    });

    // Método más directo y confiable
    checkEl.checked = isHighlighted;

    // Forzar actualización visual (importante en algunos navegadores)
    checkEl.dispatchEvent(new Event('change', { bubbles: true }));

    console.log("✅ Checkbox DESPUÉS:", {
      checked: checkEl.checked,
      hasAttribute: checkEl.hasAttribute("checked"),
    });
  }

  // 3. Título del modal
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) modalTitle.textContent = `Editar "${data.title}"`;

  // 4. Limpiar input de archivo
  const fileInput = document.getElementById("edit-image-input") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
}

/**
 * Maneja el submit del formulario.
 */
async function handleFormSubmit(event: Event) {
  event.preventDefault();

  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification || alert;

  if (!getAuthHeaders) {
    console.error("[newsEditModal] Error: adminUI no cargado");
    return;
  }

  const headers = getAuthHeaders();

  const id = (document.getElementById("editId") as HTMLInputElement).value.trim();
  const title = (document.getElementById("editTitle") as HTMLInputElement).value.trim();
  const description = (
    document.getElementById("editDescription") as HTMLTextAreaElement
  ).value.trim();

  if (!id || !title || !description) {
    addNotification("error", "ID, Título y Descripción son obligatorios.");
    return;
  }

  // RECUPERAR EL NOMBRE DE LA IMAGEN ACTUAL
  const currentImageName =
    (document.getElementById("editCurrentImageName") as HTMLInputElement).value || null;

  // Preparar datos JSON
  const newsData: UpdateNewsData = {
    id,
    title,
    description,
    link:
      (document.getElementById("editLink") as HTMLInputElement).value.trim() || null,
    publicationDate:
      (document.getElementById("editpublicationDate") as HTMLInputElement).value || null,
    highlighted: (document.getElementById("editHighlighted") as HTMLInputElement).checked,
    imageName: currentImageName,
  };

  console.log("📤 Enviando datos:", newsData);

  if (addNotification) addNotification("info", "Actualizando noticia...");

  // PASO 1: Actualizar JSON
  const result = await updateNews(newsData, headers);

  if (result.success) {
    // PASO 2: Verificar si hay imagen NUEVA para subir
    const imageInput = document.getElementById("edit-image-input") as HTMLInputElement;
    let imageError = false;

    if (imageInput && imageInput.files && imageInput.files.length > 0) {
      if (addNotification) addNotification("info", "Actualizando imagen...");
      try {
        const file = imageInput.files[0];
        await uploadEntityImage("news", id, file, headers);
        console.log("✅ Imagen actualizada");
      } catch (error: any) {
        console.error("❌ Error subiendo imagen:", error);
        imageError = true;
        addNotification(
          "warning",
          "Datos guardados, pero falló la nueva imagen: " + error.message
        );
      }
    }

    if (!imageError) {
      addNotification("success", "Noticia actualizada correctamente");
    }

    modalActions.close();

    // Recargar para ver los cambios
    setTimeout(() => window.location.reload(), 500);
  } else {
    addNotification("error", `Error al actualizar: ${result.message}`);
  }
}

export function initializeEditModal() {
  const form = document.getElementById("editForm");
  if (!form) {
    console.error('❌ Formulario "editForm" no encontrado');
    return;
  }

  // Suscripción al store - SIMPLIFICADO
  modalStore.subscribe((state) => {
    if (state.isOpen && state.type === "edit" && state.data) {
      console.log("📥 Datos recibidos del store:", state.data);
      // Usar requestAnimationFrame para asegurar que el DOM está listo
      requestAnimationFrame(() => {
        fillEditForm(state.data);
      });
    }
  });

  form.addEventListener("submit", handleFormSubmit);

  console.log("✅ [newsEditModal] Inicializado");
}