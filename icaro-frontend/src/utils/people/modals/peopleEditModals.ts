import { modalStore, modalActions } from "@/stores/modalStore";
import { updatePersonService } from "@/services/people/peopleEditService";

export function initPeopleEditModal() {
  const form = document.getElementById("edit-people-form") as HTMLFormElement;
  const cancelBtn = document.getElementById("cancel-edit-btn");

  // 1. CERRAR MODAL (Arregla el problema de "quitar el modal")
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modalActions.close();
    });
  }

  if (!form) return;

  // 2. Suscripción: Rellenar datos
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'edit' && state.data) {
      populateForm(form, state.data);
    }
  });

  // 3. SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!confirm("¿Guardar cambios?")) return;

    const addNotification = (window as any).addNotification || alert;
    const formData = new FormData(form);

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
      const response = await updatePersonService(personData);
      if (response.ok) {
        addNotification("success", "Datos actualizados.");
        modalActions.close();
        setTimeout(() => window.location.reload(), 500);
      } else {
        const err = await response.text();
        addNotification("error", `Error: ${err}`);
      }
    } catch (error) {
      addNotification("error", "Error de conexión.");
    }
  });
}

function populateForm(form: HTMLFormElement, data: any) {
  const setVal = (name: string, val: any) => {
    const input = form.elements.namedItem(name) as HTMLInputElement;
    if (input) input.value = val || "";
  };

  setVal("orcid", data.orcid);
  setVal("givenNames", data.givenNames);
  setVal("familyName", data.familyName);
  setVal("email", data.email);
  setVal("role", data.role);
  setVal("office", data.office);
  setVal("phone", data.phone);
  setVal("biography", data.biography);
}