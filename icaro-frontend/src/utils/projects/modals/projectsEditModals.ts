import { updateProjectService } from "@/services/project/projectEditService";

let scrollPosition = 0;

// ============= LÓGICA VISUAL (SHOW/HIDE) =============

/**
 * Muestra el modal de editar y rellena los datos
 */
export function showEditProjectModal(data: any) {
  console.log("📝 [ProjectEdit] Abriendo modal con datos:", data);
  
  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form") as HTMLFormElement;

  if (!modal || !form) {
    console.error("❌ [ProjectEdit] Modal o formulario no encontrados");
    return;
  }

  // 1. Guardar scroll y bloquear body
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;

  // 2. Rellenar formulario
  populateForm(form, data);

  // 3. Mostrar modal
  modal.classList.remove("hidden");
  
  // 4. Accesibilidad: Enfocar primer input
  const firstInput = form.querySelector("input:not([type='hidden'])") as HTMLElement;
  if(firstInput) firstInput.focus();
}

/**
 * Cierra el modal y limpia estados
 */
export function hideEditProjectModal() {
  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form") as HTMLFormElement;

  if (!modal) return;

  // 1. Ocultar visualmente
  modal.classList.add("hidden");

  // 2. Restaurar scroll
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);

  // 3. Limpiar formulario
  if (form) form.reset();
}

// ============= GESTIÓN DE DATOS (POPULATE) =============

function populateForm(form: HTMLFormElement, data: any) {
  const setVal = (name: string, val: any) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
    if (input) input.value = val || "";
  };

  setVal("id", data.id);
  setVal("title", data.title);
  setVal("description", data.description);
  
  // Fechas: Formato YYYY-MM-DD para inputs date
  const formatDate = (d: string) => (d && d.length >= 10) ? d.substring(0, 10) : "";
  setVal("firstProjectDate", formatDate(data.firstProjectDate));
  setVal("secondProjectDate", formatDate(data.secondProjectDate));

  // Participantes: Array -> String
  const parts = data.participants || data.colaborators || [];
  const partsStr = Array.isArray(parts) ? parts.join(", ") : parts;
  setVal("participants", partsStr);
}

// ============= ENVÍO (SUBMIT) =============

async function handleFormSubmit(event: Event) {
  event.preventDefault();

  // Helpers globales
  const addNotification = (window as any).addNotification || alert;
  const getAuthHeaders = (window as any).getAuthHeaders;

  if (!getAuthHeaders) {
    console.error("Faltan funciones de autenticación (adminUI)");
    return;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  // Validar ID
  const id = formData.get("id");
  if (!id) {
    addNotification("error", "Error crítico: No hay ID de proyecto.");
    return;
  }

  // Construir DTO
  const projectData = {
    id: id,
    title: formData.get("title"),
    description: formData.get("description"),
    // String -> Array (limpieza de espacios)
    participants: (formData.get("participants") as string)
      .split(",")
      .map(p => p.trim())
      .filter(Boolean),
    firstProjectDate: formData.get("firstProjectDate"),
    secondProjectDate: formData.get("secondProjectDate") || null
  };

  try {
    // Llamada al servicio de actualización
    const response = await updateProjectService(projectData);

    if (response.ok) {
      addNotification("success", "Proyecto actualizado correctamente.");
      hideEditProjectModal();
      setTimeout(() => window.location.reload(), 500);
    } else {
      const errorText = await response.text();
      addNotification("error", `Error al actualizar: ${errorText}`);
    }
  } catch (error) {
    console.error(error);
    addNotification("error", "Error de conexión al actualizar.");
  }
}

// ============= INICIALIZACIÓN =============

export function initProjectEditModal() {
  console.log("🚀 [ProjectEdit] Inicializando listeners...");

  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form");
  
  if (!modal || !form) {
    console.warn("⚠️ [ProjectEdit] Modal no encontrado en el DOM (¿Usuario no admin?)");
    return;
  }

  // 1. Listeners de Cierre
  const closeSelectors = ["#close-edit-modal", "#cancel-edit-btn"];
  closeSelectors.forEach(sel => {
    const btn = document.querySelector(sel);
    btn?.addEventListener("click", hideEditProjectModal);
  });
  
  modal.querySelector(".modal-overlay")?.addEventListener("click", hideEditProjectModal);

  // 2. Listener Submit
  form.addEventListener("submit", handleFormSubmit);

  // 3. DELEGACIÓN GLOBAL (Para abrir el modal)
  // Escuchamos clicks en todo el body para capturar los botones .edit-btn dinámicos
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    
    // Buscamos si el click fue dentro de un .edit-btn
    const editBtn = target.closest(".edit-btn");

    if (editBtn && editBtn.hasAttribute("data-entity-data")) {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const json = editBtn.getAttribute("data-entity-data") || "{}";
        console.log("👆 [ProjectEdit] Click detectado.");
        const data = JSON.parse(json);
        
        showEditProjectModal(data);
      } catch (err) {
        console.error("❌ [ProjectEdit] Error al leer JSON:", err);
      }
    }
  });
}

// Exponer globalmente por si acaso
if (typeof window !== 'undefined') {
  (window as any).initProjectEditModal = initProjectEditModal;
}