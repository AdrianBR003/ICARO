import { updateProjectService } from "@/services/project/projectEditService";

let scrollPosition = 0;

// ============= APERTURA / CIERRE =============

export function showEditProjectModal(data: any) {
  console.log("📝 [ProjectEdit] Abriendo modal con datos:", data);
  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form") as HTMLFormElement;

  if (!modal || !form) {
    console.error("❌ [ProjectEdit] No se encontró el modal o el formulario");
    return;
  }

  // 1. Guardar scroll
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;

  // 2. Rellenar datos
  populateForm(form, data);

  // 3. Mostrar
  modal.classList.remove("hidden");
}

export function hideEditProjectModal() {
  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form") as HTMLFormElement;

  if (!modal) return;

  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);

  if (form) form.reset();
}

// ============= RELLENADO DE DATOS =============

function populateForm(form: HTMLFormElement, data: any) {
  const setVal = (name: string, val: any) => {
    const input = form.elements.namedItem(name) as HTMLInputElement;
    if (input) input.value = val || "";
  };

  setVal("id", data.id);
  setVal("title", data.title);
  setVal("description", data.description);
  
  // Fechas: Recortar ISO string si es necesario (yyyy-mm-dd)
  const formatDate = (d: string) => (d && d.length >= 10 ? d.substring(0, 10) : "");
  setVal("firstProjectDate", formatDate(data.firstProjectDate));
  setVal("secondProjectDate", formatDate(data.secondProjectDate));

  // Participantes: Array a String
  const parts = data.participants || data.colaborators || [];
  const partsStr = Array.isArray(parts) ? parts.join(", ") : parts;
  setVal("participants", partsStr);
}

// ============= SUBMIT =============

async function handleFormSubmit(event: Event) {
  event.preventDefault();
  const addNotification = (window as any).addNotification || alert;
  const getAuthHeaders = (window as any).getAuthHeaders;

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const projectData = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    participants: (formData.get("participants") as string).split(",").map(p => p.trim()).filter(Boolean),
    firstProjectDate: formData.get("firstProjectDate"),
    secondProjectDate: formData.get("secondProjectDate") || null
  };

  try {
    const response = await updateProjectService(projectData);
    if (response.ok) {
      addNotification("success", "Proyecto actualizado correctamente.");
      hideEditProjectModal();
      setTimeout(() => window.location.reload(), 500);
    } else {
      const err = await response.text();
      addNotification("error", `Error: ${err}`);
    }
  } catch (error) {
    console.error(error);
    addNotification("error", "Error de conexión.");
  }
}

// ============= INICIALIZACIÓN (LA PARTE IMPORTANTE) =============

export function initProjectEditModal() {
  console.log("🚀 [ProjectEdit] Inicializando listeners...");

  const modal = document.getElementById("project-edit-modal");
  const form = document.getElementById("edit-project-form");
  
  if (!modal) {
    console.error("❌ [ProjectEdit] Error crítico: No existe el modal en el DOM");
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
  form?.addEventListener("submit", handleFormSubmit);

  // 3. DELEGACIÓN DE EVENTOS GLOBAL (EL FIX)
  // Escuchamos en todo el documento para pillar los botones edit-btn
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    
    // Buscamos si el click fue dentro de un .edit-btn
    const editBtn = target.closest(".edit-btn");

    if (editBtn) {
      // Verificamos si tiene datos
      if (editBtn.hasAttribute("data-entity-data")) {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          const json = editBtn.getAttribute("data-entity-data") || "{}";
          console.log("👆 [ProjectEdit] Click detectado. JSON:", json);
          const data = JSON.parse(json);
          showEditProjectModal(data);
        } catch (err) {
          console.error("❌ [ProjectEdit] Error al leer JSON del botón:", err);
        }
      } else {
        console.warn("⚠️ [ProjectEdit] Botón detectado pero sin data-entity-data");
      }
    }
  });
}

// Exponer globalmente por si acaso
if (typeof window !== 'undefined') {
  (window as any).initProjectEditModal = initProjectEditModal;
}