import { modalStore, modalActions } from "@/stores/modalStore";
import { deletePersonService } from "@/services/people/peopleDeleteService";

let currentOrcid: string | null = null;

export function initPeopleDeleteModal() {
  const confirmBtn = document.getElementById("confirm-delete-btn") as HTMLButtonElement;
  // 1. Seleccionamos el botón de cancelar
  const cancelBtn = document.getElementById("cancel-delete-btn") as HTMLButtonElement;
  const titleSpan = document.getElementById("delete-people-title");

  // Suscripción
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'delete') {
      currentOrcid = state.data?.id || null;
      if (titleSpan) titleSpan.textContent = state.data?.title || "este usuario";
    }
  });

  // 2. Lógica para Cancelar (NUEVO)
  if (cancelBtn) {
    // Usamos cloneNode para limpiar listeners anteriores si la función se llama varias veces, 
    // o simplemente addEventListener si solo se inicializa una vez.
    // Aquí hago lo simple:
    cancelBtn.onclick = () => {
      modalActions.close();
    };
  }

  // 3. Acción Confirmar
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