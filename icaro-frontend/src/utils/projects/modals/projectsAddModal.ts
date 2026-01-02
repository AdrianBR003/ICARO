import { modalStore, modalActions } from "@/stores/modalStore";
import { createProjectService } from "@/services/project/projectsAddService";

// Estado local para la lógica de negocio
let tagsList: string[] = [];
let workIdsList: string[] = [];
function resetFormInternal() {
  const form = document.getElementById("add-project-form") as HTMLFormElement;
  if (form) form.reset();
  
  // Limpiar listas
  tagsList = [];
  workIdsList = [];
  
  // Limpiar UI de listas
  renderList("tagsContainer", tagsList, removeTag);
  renderList("workIdsContainer", workIdsList, removeWorkId);
}

// ============= GESTIÓN DE TAGS Y WORK IDS =============

function addTag() {
  const input = document.getElementById("tagInput") as HTMLInputElement;
  const val = input?.value.trim();
  if (val && !tagsList.includes(val)) {
    tagsList.push(val);
    renderList("tagsContainer", tagsList, removeTag);
    input.value = "";
  }
}

function removeTag(val: string) {
  tagsList = tagsList.filter(t => t !== val);
  renderList("tagsContainer", tagsList, removeTag);
}

function addWorkId() {
  const input = document.getElementById("workIdInput") as HTMLInputElement;
  const val = input?.value.trim();
  if (val && !workIdsList.includes(val)) {
    workIdsList.push(val);
    renderList("workIdsContainer", workIdsList, removeWorkId);
    input.value = "";
  }
}

function removeWorkId(val: string) {
  workIdsList = workIdsList.filter(w => w !== val);
  renderList("workIdsContainer", workIdsList, removeWorkId);
}

function renderList(containerId: string, list: string[], removeFn: (val: string) => void) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  list.forEach(item => {
    const el = document.createElement("div");
    el.className = "inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2 border border-gray-200";
    el.innerHTML = `
      <span>${item}</span>
      <button type="button" class="ml-2 text-gray-400 hover:text-red-500 font-bold focus:outline-none">&times;</button>
    `;
    const btn = el.querySelector("button");
    if (btn) btn.onclick = () => removeFn(item);
    container.appendChild(el);
  });
}

// ============= ENVÍO DEL FORMULARIO =============

async function handleFormSubmit(event: Event) {
  event.preventDefault();

  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification || alert;

  if (!getAuthHeaders) {
    console.error("[ProjectAdd] getAuthHeaders no encontrado");
    return;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  // Validaciones
  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const firstDate = formData.get("firstProjectDate");

  if (!id || !title || !description || !firstDate) {
    if(addNotification) addNotification("error", "Complete los campos obligatorios (*)");
    return;
  }

  // Construir DTO
  const projectData = {
    id,
    title,
    description,
    participants: (formData.get("participants") as string).split(",").map(p => p.trim()).filter(Boolean),
    firstProjectDate: firstDate,
    secondProjectDate: formData.get("secondProjectDate") || null,
    tags: tagsList,
    workIds: workIdsList
  };

  try {
    const response = await createProjectService(projectData); 

    if (response.ok) {
      addNotification("success", `Proyecto "${title}" creado.`);
      
      // Simplemente cerramos el Store. 
      // El Controller detectará el cambio y ocultará el HTML visualmente.
      modalActions.close();
      
      setTimeout(() => window.location.reload(), 500);
    } else {
      const errorText = await response.text();
      addNotification("error", `Error al crear: ${errorText}`);
    }
  } catch (error) {
    addNotification("error", "Error de conexión.");
  }
}

// ============= INICIALIZACIÓN =============

export function initializeProjectAddModal() {
  const form = document.getElementById("add-project-form");
  
  // Inputs internos
  const tagInput = document.getElementById("tagInput");
  const addTagBtn = document.getElementById("addTagBtn");
  const workIdInput = document.getElementById("workIdInput");
  const addWorkIdBtn = document.getElementById("addWorkIdBtn");

  if (!form) {
    console.warn("[ProjectAdd] Formulario no encontrado");
    return;
  }

  // 1. SUSCRIPCIÓN AL STORE (Reactividad)
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'add') {
      resetFormInternal();
    }
  });

  // 2. Listener Submit
  form.addEventListener("submit", handleFormSubmit);

  // 3. Listeners Tags / WorkIds
  addTagBtn?.addEventListener("click", addTag);
  tagInput?.addEventListener("keypress", (e: any) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });

  addWorkIdBtn?.addEventListener("click", addWorkId);
  workIdInput?.addEventListener("keypress", (e: any) => { if (e.key === "Enter") { e.preventDefault(); addWorkId(); } });

  console.log("✅ [ProjectAdd] Lógica de negocio inicializada");
}