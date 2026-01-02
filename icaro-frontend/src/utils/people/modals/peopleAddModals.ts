import { modalStore, modalActions } from "@/stores/modalStore";
import { createPersonService } from "@/services/people/peopleAddService";

export function initializePeopleAddModal() {
  const form = document.getElementById("add-people-form") as HTMLFormElement;
  const openBtn = document.getElementById("addPeopleButton"); // Botón Verde
  const cancelBtn = document.getElementById("cancel-add-btn"); // Botón Cancelar

  // 1. ABRIR MODAL (Esto faltaba o fallaba)
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modalActions.open('add');
    });
  }

  // 2. CERRAR MODAL (Botón Cancelar)
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modalActions.close();
    });
  }

  if (!form) return;

  // 3. Suscripción para limpiar el form al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'add') {
      form.reset();
    }
  });

  // 4. SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addNotification = (window as any).addNotification || alert;
    const getAuthHeaders = (window as any).getAuthHeaders;

    if (!getAuthHeaders) return;

    const formData = new FormData(form);
    
    // Validación
    if (!formData.get("orcid") || !formData.get("givenNames") || !formData.get("familyName")) {
        addNotification("error", "Faltan campos obligatorios");
        return;
    }

    const personData = {
      orcid: formData.get("orcid"),
      givenNames: formData.get("givenNames"),
      familyName: formData.get("familyName"),
      email: formData.get("email"),
      role: formData.get("role"),
      office: formData.get("office"),
      phone: formData.get("phone"),
      biography: formData.get("biography")
    };

    try {
      const response = await createPersonService(personData);
      if (response.ok) {
        addNotification("success", "Investigador añadido.");
        modalActions.close();
        setTimeout(() => window.location.reload(), 500);
      } else {
        const err = await response.text();
        addNotification("error", `Error: ${err}`);
      }
    } catch (error) {
      addNotification("error", "Error al insertar el usuario. Compruebe que el OID no existe. ");
    }
  });
}