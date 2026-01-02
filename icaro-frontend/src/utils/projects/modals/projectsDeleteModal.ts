import { deleteProjectService } from "@/services/project/projectDeleteService";
import { modalStore } from "@/stores/modalStore";

export function initProjectDeleteModal() {
  const modal = document.getElementById("project-delete-modal");
  const confirmBtn = document.getElementById("confirm-delete-btn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancel-delete-btn");
  const titleSpan = document.getElementById("delete-project-title");
  
  // Variables de estado
  let currentProjectId: string | null = null;

  // SUSCRIPCIÓN AL MODAL 

  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'delete') {
      // 1. Capturamos el ID del store y lo guardamos en la variable local
      currentProjectId = state.data?.id || null;
      
      console.log("🗑️ [DeleteModal] ID recibido del Store:", currentProjectId);

      // 2. Actualizamos el texto visualmente (opcional pero recomendado)
      if (titleSpan && state.data?.title) {
        titleSpan.textContent = state.data.title;
      }
    } else {
      // Limpiamos la variable cuando se cierra para evitar errores futuros
      if (!state.isOpen) {
        currentProjectId = null;
      }
    }
  });

  // 1. ABRIR MODAL (Delegación de eventos o Controller global)
  // El modalController global ya maneja la clase 'hidden', 
  document.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest('[data-modal-trigger="project-delete-modal"]');
    if (trigger) {
      const id = trigger.getAttribute("data-entity-id");
      const title = trigger.getAttribute("data-entity-title");

      if (id && title) {
        currentProjectId = id;
        if (titleSpan) titleSpan.textContent = title;
      }
    }
  });

  // 2. CERRAR MODAL
  const closeModal = () => {
    modal?.classList.add("hidden");
    document.body.style.overflow = "";
    currentProjectId = null;
  };

  cancelBtn?.addEventListener("click", closeModal);
  modal?.querySelector(".modal-overlay")?.addEventListener("click", closeModal);

  // 3. CONFIRMAR BORRADO
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      console.log("ProjectID Delete: " + currentProjectId); 
      if (!currentProjectId) return;

      confirmBtn.disabled = true;
      confirmBtn.textContent = "Eliminando...";

      try {
        const response = await deleteProjectService(currentProjectId);

        if (response.ok) {
          saveNotification("success", "Proyecto eliminado correctamente.");
          window.location.reload();
        } else {
          const isAuthError = response.status === 401 || response.status === 403;
          if (isAuthError) {
             alert("Sesión expirada o sin permisos.");
          } else {
             alert("No se pudo eliminar el proyecto (puede tener dependencias).");
          }
          closeModal();
        }
      } catch (error) {
        alert("Error de conexión.");
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Sí, Eliminar";
      }
    });
  }

  function saveNotification(type: string, message: string) {
    const notifications = JSON.parse(localStorage.getItem("pendingNotifications") || "[]");
    notifications.push({ id: Date.now(), message, type, duration: 4000 });
    localStorage.setItem("pendingNotifications", JSON.stringify(notifications));
  }
}