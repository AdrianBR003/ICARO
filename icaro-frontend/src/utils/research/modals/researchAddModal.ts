import { modalStore, modalActions } from "@/stores/modalStore";
import { createResearchService } from "@/services/research/researchAddService";

// ⚠️ IMPORTANTE: Asegúrate de importar desde el SERVICE, no desde el Loader
import { fetchAllProjectsList } from "@/services/project/projectsService"; 

export function initializeResearchAddModal() {
  const form = document.getElementById("add-research-form") as HTMLFormElement;
  const projectSelect = document.getElementById("add-project-select") as HTMLSelectElement;

  if (!form) return;

  // 1. Suscripción
  modalStore.subscribe(async (state) => {
    if (state.isOpen && state.type === 'add') {
      form.reset();
      
      // CARGAR PROYECTOS AL ABRIR
      if (projectSelect) {
        // 👇 AQUÍ ESTABA EL ERROR. Llama al helper local, NO al loader externo
        await loadProjectsIntoSelect(projectSelect); 
      }
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

// HELPER LOCAL: Cargar proyectos en el select
async function loadProjectsIntoSelect(select: HTMLSelectElement, selectedId: string = "") {
  try {
    select.innerHTML = '<option value="">Cargando...</option>';
    select.disabled = true;
    
    const projects = await fetchAllProjectsList();
    
    let html = '<option value="">(No asignar)</option>';
    
    if (Array.isArray(projects)) {
      projects.forEach(p => {
        // Convertimos a string para comparar seguro
        const isSelected = String(p.id) === String(selectedId) ? 'selected' : '';
        html += `<option value="${p.id}" ${isSelected}>${p.title}</option>`;
      });
    }
    
    select.innerHTML = html;
    select.disabled = false;
  } catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Error al cargar proyectos</option>';
    select.disabled = false;
  }
}