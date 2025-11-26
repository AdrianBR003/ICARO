import { modalActions } from "@/stores/modalStore";
import { createProjectService } from "@/services/project/projectsAddService";

// Estado local
let scrollPosition = 0;
let tagsList: string[] = [];
let workIdsList: string[] = [];

// ============= FUNCIONES VISUALES (SHOW/HIDE) =============

/**
 * Muestra el modal de añadir proyecto
 */
export function showAddModal() {
  const modal = document.getElementById("add-project-modal");
  if (!modal) return;

  // Resetear listas locales
  tagsList = [];
  workIdsList = [];
  renderList("tagsContainer", tagsList, removeTag);
  renderList("workIdsContainer", workIdsList, removeWorkId);

  // Guardar scroll y bloquear body
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;

  // Mostrar
  modal.classList.remove("hidden");

  // Enfocar primer input (ID)
  const firstInput = modal.querySelector('input[name="id"]') as HTMLElement;
  if (firstInput) firstInput.focus();
}

/**
 * Oculta el modal de añadir proyecto
 */
export function hideAddModal() {
  const modal = document.getElementById("add-project-modal");
  const form = document.getElementById("add-project-form") as HTMLFormElement;
  
  if (!modal || !form) return;

  modal.classList.add("hidden");

  // Restaurar scroll
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);

  // Limpiar formulario y estados
  form.reset();
  tagsList = [];
  workIdsList = [];
  renderList("tagsContainer", tagsList, removeTag);
  renderList("workIdsContainer", workIdsList, removeWorkId);
  
  // Cerrar en el store
  modalActions.close();
}

// ============= GESTIÓN DE LISTAS (TAGS & WORK IDS) =============

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

// Helper genérico para renderizar etiquetas
function renderList(containerId: string, list: string[], removeFn: (val: string) => void) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  list.forEach(item => {
    const el = document.createElement("div");
    el.className = "inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm mr-2 mb-2 border border-gray-200";
    
    const text = document.createElement("span");
    text.textContent = item;
    
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ml-2 text-gray-400 hover:text-red-500 font-bold focus:outline-none";
    btn.innerHTML = "&times;";
    btn.onclick = () => removeFn(item);

    el.appendChild(text);
    el.appendChild(btn);
    container.appendChild(el);
  });
}

// ============= SUBMIT DEL FORMULARIO =============

async function handleFormSubmit(event: Event) {
  event.preventDefault();

  // Obtener helpers globales (inyectados por adminUI)
  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification;

  if (!getAuthHeaders || !addNotification) {
    console.error("[ProjectAdd] Funciones de adminUI no encontradas");
    alert("Error de inicialización. Refresque la página.");
    return;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  // Validaciones básicas
  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const firstDate = formData.get("firstProjectDate");

  if (!id || !title || !description || !firstDate) {
    addNotification("error", "Complete los campos obligatorios (*)");
    return;
  }

  // Construir objeto DTO
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
    const response = await createProjectService(projectData); // Usamos el servicio existente

    if (response.ok) {
      addNotification("success", `Proyecto "${title}" creado exitosamente.`);
      hideAddModal();
      setTimeout(() => window.location.reload(), 500);
    } else {
      const errorText = await response.text();
      addNotification("error", `Error al crear: ${errorText}`);
    }
  } catch (error) {
    console.error(error);
    addNotification("error", "Error de conexión al crear el proyecto.");
  }
}

// ============= INICIALIZACIÓN =============

export function initializeAddModal() {
  const modal = document.getElementById("add-project-modal");
  const form = document.getElementById("add-project-form");
  const openBtns = document.querySelectorAll("#addProjectButton"); // Por si hay más de uno
  const closeBtns = document.querySelectorAll(".close-add-modal");
  
  // Inputs especiales
  const tagInput = document.getElementById("tagInput");
  const addTagBtn = document.getElementById("addTagBtn");
  const workIdInput = document.getElementById("workIdInput");
  const addWorkIdBtn = document.getElementById("addWorkIdBtn");

  if (!modal || !form) {
    console.warn("[ProjectAdd] Elementos del modal no encontrados");
    return;
  }

  // Listeners de Apertura
  openBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        showAddModal();
    });
  });

  // Listeners de Cierre
  closeBtns.forEach(btn => btn.addEventListener("click", hideAddModal));
  modal.querySelector(".modal-overlay")?.addEventListener("click", hideAddModal);

  // Listener Submit
  form.onsubmit = handleFormSubmit;

  // Listeners Tags
  addTagBtn?.addEventListener("click", addTag);
  tagInput?.addEventListener("keypress", (e: any) => { 
    if (e.key === "Enter") { e.preventDefault(); addTag(); } 
  });

  // Listeners Work IDs
  addWorkIdBtn?.addEventListener("click", addWorkId);
  workIdInput?.addEventListener("keypress", (e: any) => { 
    if (e.key === "Enter") { e.preventDefault(); addWorkId(); } 
  });

  console.log("✅ [ProjectAdd] Modal Inicializado");
}

// Exponer funciones al window para el controlador global si es necesario
if (typeof window !== 'undefined') {
  (window as any).showProjectAddModal = showAddModal;
  (window as any).hideProjectAddModal = hideAddModal;
}