import { modalStore, modalActions } from "@/stores/modalStore";
// Asegúrate de crear este servicio luego
import { createResearchService } from "@/services/research/researchAddService"; 

export function initializeResearchAddModal() {
  const form = document.getElementById("add-research-form") as HTMLFormElement;
  if (!form) return;

  // 1. Suscripción: Limpiar al abrir
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'add') {
      form.reset();
    }
  });

  // 2. Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addNotification = (window as any).addNotification || alert;
    const getAuthHeaders = (window as any).getAuthHeaders;

    if (!getAuthHeaders) { console.error("Auth missing"); return; }

    const formData = new FormData(form);
    
    // Validación básica
    if (!formData.get("id") || !formData.get("title")) {
        addNotification("error", "Faltan campos obligatorios");
        return;
    }

    const researchData = {
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description"),
      // Convertir CSV a Array
      participants: (formData.get("participants") as string).split(",").map(s => s.trim()).filter(Boolean),
      projectDate: formData.get("projectDate"),
      projectId: formData.get("projectId") || null
    };

    try {
      const response = await createResearchService(researchData);
      if (response.ok) {
        addNotification("success", "Publicación añadida.");
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