import { modalStore, modalActions } from "@/stores/modalStore";
import { updateResearchService } from "@/services/research/researchEditService";
import { fetchAllProjectsList } from "@/services/project/projectsService";

let isInitialized = false; // Evitar doble submit

let tagsList: string[] = [];

export function initResearchEditModal() {
  const form = document.getElementById("edit-research-form") as HTMLFormElement;
  const projectSelect = document.getElementById(
    "edit-project-select"
  ) as HTMLSelectElement;
  // Elementos Tags
  const tagInput = document.getElementById(
    "edit-research-tag-input"
  ) as HTMLInputElement;
  const addTagBtn = document.getElementById("btn-edit-research-tag");

  if (isInitialized) {
    return;
  }

  if (!form) return;

  // 1. Suscripción: Rellenar datos al abrir
  modalStore.subscribe(async (state) => {
    if (state.isOpen && state.type === "edit" && state.data) {
      populateFormBasic(form, state.data);

      // Seleccionar tags
      tagsList = state.data.tags || []; // <--- IMPORTANTE
      renderTags();

      if (projectSelect) {
        await loadProjectsIntoSelect(projectSelect, state.data.projectId);
      }
    }
  });

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
    const container = document.getElementById("edit-research-tags-container");
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

  addTagBtn?.addEventListener("click", (e) => { e.preventDefault(); addTag(); });
  tagInput?.addEventListener("keypress", (e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });

  // 2. Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!confirm("¿Guardar cambios?")) return;

    const addNotification = (window as any).addNotification || alert;
    const formData = new FormData(form);

    const researchData = {
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description"),
      participants: (formData.get("participants") as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      projectDate: formData.get("projectDate"),
      projectId: formData.get("projectId") || null,
      tags: tagsList,
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
  isInitialized = true;
}

function populateFormBasic(form: HTMLFormElement, data: any) {
  const setVal = (name: string, val: any) => {
    // Evitamos tocar el select aquí, lo maneja el helper async
    const input = form.elements.namedItem(name) as HTMLInputElement;
    if (input && input.tagName !== "SELECT") {
      input.value = val || "";
    }
  };

  setVal("id", data.id);
  setVal("title", data.title);
  setVal("description", data.description);

  // Fecha (YYYY-MM-DD)
  const formatDate = (d: string) =>
    d && d.length >= 10 ? d.substring(0, 10) : "";
  setVal("projectDate", formatDate(data.projectDate));

  // Array -> String
  const parts = data.participants || [];
  setVal("participants", Array.isArray(parts) ? parts.join(", ") : parts);
}

async function loadProjectsIntoSelect(
  select: HTMLSelectElement,
  currentProjectId: string | null
) {
  try {
    select.innerHTML = '<option value="">Cargando...</option>';

    // Llamada al servicio
    const projects = await fetchAllProjectsList();

    let html = '<option value="">(No asignar)</option>';

    if (Array.isArray(projects)) {
      projects.forEach((p) => {
        // COMPARACIÓN: Si el ID del proyecto coincide con el de la publicación -> selected
        const isSelected =
          String(p.id) === String(currentProjectId) ? "selected" : "";
        html += `<option value="${p.id}" ${isSelected}>${p.title}</option>`;
      });
    }

    select.innerHTML = html;
  } catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Error al cargar proyectos</option>';
  }
}
