import { modalActions } from "@/stores/modalStore";
import {
  deleteNews,
  clearImageCache,
  verifyAdminPermissions,
} from "@/services/news/newsDeleteService";

// --- Funciones del Modal ---

export function showDeleteModal(newsId: string, newsTitle?: string) {
  const modal = document.getElementById("deleteNewsModal");
  const confirmBtn = document.getElementById("confirmNewsDeleteBtn");

  if (!modal || !confirmBtn) return;

  // Guardamos el ID en el botón de confirmar del propio modal
  confirmBtn.dataset.targetId = newsId;

  const titleElement = document.getElementById("deleteNewsTitle");
  if (titleElement) titleElement.textContent = newsTitle || `"${newsId}"`;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

export function hideDeleteModal() {
  const modal = document.getElementById("deleteNewsModal");
  const confirmBtn = document.getElementById("confirmNewsDeleteBtn");

  if (!modal) return;

  modal.classList.add("hidden");
  document.body.style.overflow = "";

  if (confirmBtn) delete confirmBtn.dataset.targetId;

  modalActions.close();
}

// --- Lógica de Borrado ---

async function performDelete() {
  const confirmBtn = document.getElementById("confirmNewsDeleteBtn") as HTMLButtonElement;
  const newsIdToDelete = confirmBtn?.dataset.targetId;

  if (!newsIdToDelete) {
    alert("Error interno: No se encontró el ID de la noticia.");
    return;
  }

  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification;

  if (!getAuthHeaders || !addNotification) return;

  confirmBtn.disabled = true;
  const originalText = confirmBtn.textContent;
  confirmBtn.textContent = "Eliminando...";

  try {
    const result = await deleteNews(newsIdToDelete, getAuthHeaders());

    if (result.success) {
      clearImageCache(newsIdToDelete);

      // Importante: El selector aquí debe coincidir con tu HTML principal si usas data-news-id allí también
      const newsElement = document.querySelector(`[data-news-id="${newsIdToDelete}"]`);
      // O si el contenedor principal tiene otro atributo, ajústalo. 
      // Si no encuentras el elemento padre, recargar la página funcionará igual.
      if (newsElement) newsElement.closest('article')?.remove() || newsElement.remove();

      addNotification("success", result.message);
      hideDeleteModal();

      setTimeout(() => window.location.reload(), 500);
    } else {
      addNotification("error", `Error: ${result.message}`);
    }
  } catch {
    addNotification("error", "Error inesperado al eliminar");
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = originalText || "Sí, eliminar";
  }
}

async function handleDeleteClick(newsId: string, newsTitle?: string) {
  const addNotification = (window as any).addNotification;
  const getCurrentAdminStatus = (window as any).getCurrentAdminStatus;
  const currentAdminStatus = getCurrentAdminStatus?.() || false;

  if (!currentAdminStatus) {
    const hasPermissions = await verifyAdminPermissions();
    if (!hasPermissions) {
      addNotification?.(
        "error",
        "Debe iniciar sesión como administrador para realizar esta acción."
      );
      return;
    }
  }

  showDeleteModal(newsId, newsTitle);
}

// --- Inicialización y Listeners ---

export function initializeDeleteModal() {
  const modal = document.getElementById("deleteNewsModal");
  const cancelBtn = document.getElementById("cancelNewsDeleteBtn");
  const confirmBtn = document.getElementById("confirmNewsDeleteBtn");

  if (!modal || !cancelBtn || !confirmBtn) return;

  // 1. Limpieza de eventos antiguos (clonación)
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newConfirmBtn = confirmBtn.cloneNode(true);

  cancelBtn.parentNode?.replaceChild(newCancelBtn, cancelBtn);
  confirmBtn.parentNode?.replaceChild(newConfirmBtn, confirmBtn);

  // 2. Listeners del Modal
  newCancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideDeleteModal();
  });

  newConfirmBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await performDelete();
  });

  modal.onclick = (e) => {
    if (e.target === modal) hideDeleteModal();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) hideDeleteModal();
  });

  // 3. LISTENER GLOBAL (Event Delegation) - Aquí estaba la clave
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    
    // Buscamos el botón por la clase .delete-btn (la que tienes en tu HTML)
    const deleteTrigger = target.closest(".delete-btn") as HTMLElement;

    if (deleteTrigger) {
      e.preventDefault();
      e.stopPropagation();

    
      const id = deleteTrigger.dataset.newsId;
      const title = deleteTrigger.dataset.newsTitle;

      if (id) {
        handleDeleteClick(id, title);
      } else {
        console.error("Error: El botón eliminar no tiene data-news-id");
      }
    }
  });
}

if (typeof window !== "undefined") {
  (window as any).showDeleteModal = showDeleteModal;
  (window as any).hideDeleteModal = hideDeleteModal;
}