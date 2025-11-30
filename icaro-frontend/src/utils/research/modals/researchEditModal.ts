import { modalStore, modalActions } from "@/stores/modalStore";
import { updateResearchService } from "@/services/research/researchEditService"; 

export function initResearchEditModal() {
  const form = document.getElementById("edit-research-form") as HTMLFormElement;
  if (!form) return;

  // 1. Suscripción: Rellenar datos al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'edit' && state.data) {
      populateForm(form, state.data);
    }
  });

  // 2. Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!confirm("¿Guardar cambios?")) return;

    const addNotification = (window as any).addNotification || alert;
    const formData = new FormData(form);

    const researchData = {
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description"),
      participants: (formData.get("participants") as string).split(",").map(s => s.trim()).filter(Boolean),
      projectDate: formData.get("projectDate"),
      projectId: formData.get("projectId") || null
    };

    try {
      const response = await updateResearchService(researchData);
      if (response.ok) {
        addNotification("success", "Publicación actualizada.");
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

  setVal("id", data.id);
  setVal("title", data.title);
  setVal("description", data.description);
  setVal("projectDate", data.projectDate);
  setVal("projectId", data.projectId);

  // Array -> CSV String
  const parts = data.participants || [];
  setVal("participants", Array.isArray(parts) ? parts.join(", ") : parts);
}