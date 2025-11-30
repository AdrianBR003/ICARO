import { modalStore, modalActions } from "@/stores/modalStore";
import { deleteResearchService } from "@/services/research/researchDeleteService"; 

let currentId: string | null = null;

export function initResearchDeleteModal() {
  const confirmBtn = document.getElementById("confirm-delete-btn") as HTMLButtonElement;
  const titleSpan = document.getElementById("delete-research-title");

  // 1. Suscripción: Obtener ID al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'delete') {
      currentId = state.data?.id || null;
      if (titleSpan) titleSpan.textContent = state.data?.title || "...";
    }
  });

  // 2. Acción
  if (confirmBtn) {
    const newBtn = confirmBtn.cloneNode(true) as HTMLButtonElement;
    confirmBtn.parentNode?.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener("click", async () => {
      if (!currentId) return;
      newBtn.disabled = true;
      newBtn.textContent = "Eliminando...";

      try {
        const response = await deleteResearchService(currentId);
        if (response.ok) {
          modalActions.close();
          window.location.reload();
        } else {
          alert("No se pudo eliminar.");
          modalActions.close();
        }
      } catch (error) {
        alert("Error de conexión.");
      } finally {
        newBtn.disabled = false;
        newBtn.textContent = "Sí, Eliminar";
      }
    });
  }
}