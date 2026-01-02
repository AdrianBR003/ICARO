import { modalStore, modalActions } from "@/stores/modalStore";
import { createResearchService } from "@/services/research/researchAddService";
import { fetchAllProjectsList } from "@/services/project/projectsService";

let tagsList: string[] = [];

export function initializeResearchAddModal() {
  const form = document.getElementById("add-research-form") as HTMLFormElement;
  const tagInput = document.getElementById("add-research-tag-input") as HTMLInputElement;
  const addTagBtn = document.getElementById("btn-add-research-tag");

  const projectSelect = document.getElementById(
    "add-project-select"
  ) as HTMLSelectElement;

  if (!form) return;

  // 1. Suscripción
  modalStore.subscribe(async (state) => {
    if (state.isOpen && state.type === "add") {
      form.reset();

      tagsList = [];
      renderTags();

      if (projectSelect) {
        await loadProjectsIntoSelect(projectSelect);
      }
    }
  }); 

  // --- LÓGICA DE TAGS ---
  const addTag = () => {
    const val = tagInput.value.trim();
    if (val && !tagsList.includes(val)) {
      tagsList.push(val);
      renderTags();
      tagInput.value = "";
    }
  };

  const removeTag = (tag: string) => {
    tagsList = tagsList.filter((t) => t !== tag);
    renderTags();
  };

  const renderTags = () => {
    const container = document.getElementById("add-research-tags-container");
    if (!container) return;
    container.innerHTML = "";

    tagsList.forEach((tag) => {
      const el = document.createElement("div");
      el.className =
        "inline-flex items-center bg-gray-150 text-gray-600 border border-gray-300 px-3 py-1 rounded-full text-sm";
      el.innerHTML = `
        <span>${tag}</span>
        <button type="button" class="ml-2 text-gray-600 hover:text-red-300 font-bold focus:outline-none">&times;</button>
      `;
      const btn = el.querySelector("button");
      if (btn) btn.onclick = () => removeTag(tag);
      container.appendChild(el);
    });
  };

  // Listeners de Tags
  addTagBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    addTag();
  });
  tagInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  });

  // 2. Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const addNotification = (window as any).addNotification || alert;
    const getAuthHeaders = (window as any).getAuthHeaders;

    if (!getAuthHeaders) {
      console.error("Auth missing");
      return;
    }

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
      participants: (formData.get("participants") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      projectDate: formData.get("projectDate"),
      projectId: formData.get("projectId") || null,
      tags: tagsList,
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
async function loadProjectsIntoSelect(
  select: HTMLSelectElement,
  selectedId: string = ""
) {
  try {
    select.innerHTML = '<option value="">Cargando...</option>';
    select.disabled = true;

    const projects = await fetchAllProjectsList();

    let html = '<option value="">(No asignar)</option>';

    if (Array.isArray(projects)) {
      projects.forEach((p) => {
        // Convertimos a string para comparar seguro
        const isSelected =
          String(p.id) === String(selectedId) ? "selected" : "";
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
