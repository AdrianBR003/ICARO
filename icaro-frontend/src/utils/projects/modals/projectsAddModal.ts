import { modalActions } from "@/stores/modalStore";
import { createProjectService } from "@/services/project/projectsAddService";

let scrollPosition = 0;
let tagsList: string[] = [];
let workIdsList: string[] = [];

// ============= LÓGICA DE APERTURA / CIERRE =============

/**
 * Muestra el modal de añadir proyecto
 */
export function showAddProjectModal() {
  const modal = document.getElementById("add-project-modal");
  if (!modal) return;

  // 1. Guardar scroll y bloquear body
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;

  // 2. Resetear estados internos
  resetFormInternal();

  // 3. Mostrar visualmente
  modal.classList.remove("hidden");

  // 4. Enfocar primer input
  const firstInput = modal.querySelector('input[name="id"]') as HTMLElement;
  if (firstInput) firstInput.focus();
  
  // 5. Actualizar Store (opcional, para que el resto de la app sepa que hay un modal)
  modalActions.open('add');
}

/**
 * Oculta el modal de añadir proyecto
 */
export function hideAddProjectModal() {
  const modal = document.getElementById("add-project-modal");
  if (!modal) return;

  // 1. Ocultar visualmente
  modal.classList.add("hidden");

  // 2. Restaurar scroll
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);

  // 3. Limpiar formulario
  resetFormInternal();

  // 4. Cerrar en Store
  modalActions.close();
}

function resetFormInternal() {
  const form = document.getElementById("add-project-form") as HTMLFormElement;
  if (form) form.reset();
  
  tagsList = [];
  workIdsList = [];
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

// Renderizado genérico de etiquetas
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
    
    // Asignar evento al botón de borrar
    const btn = el.querySelector("button");
    if (btn) btn.onclick = () => removeFn(item);

    container.appendChild(el);
  });
}

// ============= ENVÍO DEL FORMULARIO =============

async function handleFormSubmit(event: Event) {
  event.preventDefault();

  // Obtener helpers globales (inyectados por adminUI)
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
    // Aquí deberías pasar getAuthHeaders() si tu servicio lo requiere como argumento,
    // o dejar que el servicio lo coja del localStorage si está programado así.
    // Asumo que tu servicio ya lo gestiona o lo pasas:
    const response = await createProjectService(projectData); 

    if (response.ok) {
      addNotification("success", `Proyecto "${title}" creado.`);
      hideAddProjectModal();
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
  // Referencias al DOM
  const openBtn = document.getElementById("addProjectButton");
  const modal = document.getElementById("add-project-modal");
  const form = document.getElementById("add-project-form");
  const closeBtns = document.querySelectorAll(".close-add-modal");
  
  const tagInput = document.getElementById("tagInput");
  const addTagBtn = document.getElementById("addTagBtn");
  const workIdInput = document.getElementById("workIdInput");
  const addWorkIdBtn = document.getElementById("addWorkIdBtn");

  if (!openBtn || !modal || !form) {
    console.warn("[ProjectAdd] Elementos principales no encontrados");
    return;
  }

  // Listeners Apertura/Cierre
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showAddProjectModal();
  });

  closeBtns.forEach(btn => btn.addEventListener("click", hideAddProjectModal));
  modal.querySelector(".modal-overlay")?.addEventListener("click", hideAddProjectModal);

  // Listener Submit
  form.addEventListener("submit", handleFormSubmit);

  // Listeners Tags
  addTagBtn?.addEventListener("click", addTag);
  tagInput?.addEventListener("keypress", (e: any) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } });

  // Listeners Work IDs
  addWorkIdBtn?.addEventListener("click", addWorkId);
  workIdInput?.addEventListener("keypress", (e: any) => { if (e.key === "Enter") { e.preventDefault(); addWorkId(); } });

  console.log("✅ [ProjectAdd] Modal Inicializado");
}

// Exponer a window para compatibilidad si es necesario
if (typeof window !== 'undefined') {
  (window as any).showAddProjectModal = showAddProjectModal;
  (window as any).hideAddProjectModal = hideAddProjectModal;
}