import { modalStore, modalActions } from "@/stores/modalStore";
import { deleteNews } from "@/services/news/newsDeleteService"; // Asumiendo existencia

/**
 * Actualiza el texto del modal con el nombre de la noticia
 */
function updateDeleteModalUI(data: any) {
  const titleEl = document.getElementById("deleteNewsTitle");
  if (titleEl) {
    titleEl.textContent = data.title || data.id || "esta noticia";
  }
}

/**
 * Ejecuta el borrado
 */
async function handleConfirmDelete() {
  // Obtenemos el ID directamente del estado actual del Store
  const state = modalStore.get();
  const newsId = state.data?.id;

  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification || alert;

  if (!newsId) {
    addNotification("error", "Error: No se identificó la noticia a eliminar.");
    return;
  }

  // Bloquear botón visualmente (opcional)
  const confirmBtn = document.getElementById("confirmNewsDeleteBtn") as HTMLButtonElement;
  if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Eliminando...";
  }

  try {
    const result = await deleteNews(newsId, getAuthHeaders());

    if (result.success) {
      addNotification("success", "Noticia eliminada correctamente.");
      modalActions.close(); // Cerramos via Store
      setTimeout(() => window.location.reload(), 500);
    } else {
      addNotification("error", `Error al eliminar: ${result.message}`);
      modalActions.close();
    }
  } catch (error) {
    addNotification("error", "Error de conexión.");
  } finally {
      if(confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.textContent = "Sí, Eliminar";
      }
  }
}

/**
 * Inicialización
 */
export function initializeDeleteModal() {
  const confirmBtn = document.getElementById("confirmNewsDeleteBtn");
  
  // 1. Suscripción al Store: Actualizar texto al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'delete' && state.data) {
      updateDeleteModalUI(state.data);
    }
  });

  // 2. Evento de Confirmación
  if (confirmBtn) {
    // Clonamos para evitar listeners duplicados si se reinicializa
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode?.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener("click", handleConfirmDelete);
  }

  console.log("✅ [newsDeleteModal] Lógica de negocio inicializada");
}