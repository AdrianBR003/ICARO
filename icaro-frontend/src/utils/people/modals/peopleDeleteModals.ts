import { modalStore, modalActions } from "@/stores/modalStore";
import { deletePersonService } from "@/services/people/peopleDeleteService";

let currentOrcid: string | null = null;

export function initPeopleDeleteModal() {
  const confirmBtn = document.getElementById("confirm-delete-btn") as HTMLButtonElement;
  const titleSpan = document.getElementById("delete-people-title");

  // 1. Suscripción
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'delete') {
      currentOrcid = state.data?.id || null; // Usamos 'id' porque así lo manda el Controller
      if (titleSpan) titleSpan.textContent = state.data?.title || "este usuario";
    }
  });

  // 2. Acción
  if (confirmBtn) {
    const newBtn = confirmBtn.cloneNode(true) as HTMLButtonElement;
    confirmBtn.parentNode?.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener("click", async () => {
      if (!currentOrcid) return;
      newBtn.disabled = true;
      newBtn.textContent = "Eliminando...";

      try {
        const response = await deletePersonService(currentOrcid);
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