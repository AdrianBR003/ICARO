
import { modalActions } from "@/stores/modalStore";
import { 
  createNews, 
  checkIdExists, 
  generateUniqueId,
  type CreateNewsData 
} from "@/services/news/newsAddService";

let scrollPosition = 0;

/**
 * Muestra el modal de añadir
 */
export function showAddModal() {
  const modal = document.getElementById("modal-add-news");
  if (!modal) return;

  // Generar ID automáticamente al abrir
  generateAndVerifyId();

  // Guardar posición de scroll
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;

  // Mostrar modal
  modal.classList.remove("hidden");

  // Enfocar primer input
  const firstInput = modal.querySelector('input[name="title"]') as HTMLElement;
  if (firstInput) firstInput.focus();
}

/**
 * Oculta el modal de añadir
 */
export function hideAddModal() {
  const modal = document.getElementById("modal-add-news");
  const form = document.getElementById("form-add-news") as HTMLFormElement;
  
  if (!modal || !form) return;

  // Ocultar modal
  modal.classList.add("hidden");

  // Restaurar scroll
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);

  // Limpiar formulario
  form.reset();
  resetIdField();

  // Cerrar en el store
  modalActions.close();
}

// ============= LÓGICA DE ID =============

type IdStatus = "loading" | "valid" | "invalid" | "idle";

function setIdStatus(status: IdStatus, message: string) {
  const statusEl = document.getElementById("id-status");
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  
  if (!statusEl || !inputEl) return;

  // Limpiar clases previas
  inputEl.classList.remove(
    "border-[#006D38]",
    "border-red-500",
    "focus:ring-[#006D38]",
    "focus:ring-red-500"
  );
  statusEl.classList.remove("text-[#006D38]", "text-red-600", "text-gray-500");

  // Aplicar nuevas clases según el estado
  switch (status) {
    case "loading":
      statusEl.textContent = "Verificando...";
      statusEl.className = "text-gray-500 text-xs";
      break;

    case "valid":
      statusEl.textContent = `✓ ${message}`;
      statusEl.className = "text-[#006D38] text-xs";
      inputEl.classList.add("border-[#006D38]", "focus:ring-[#006D38]");
      break;

    case "invalid":
      statusEl.textContent = `✕ ${message}`;
      statusEl.className = "text-red-600 text-xs";
      inputEl.classList.add("border-red-500", "focus:ring-red-500");
      break;

    default:
      statusEl.textContent = message;
      statusEl.className = "text-gray-400 text-xs mt-1";
      break;
  }
}

function resetIdField() {
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  if (inputEl) inputEl.value = "";
  setIdStatus("idle", "Un ID único es requerido. Genere uno o escriba el suyo.");
}

async function generateAndVerifyId() {
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  if (!inputEl) return;

  setIdStatus("loading", "Generando ID único...");

  const newId = await generateUniqueId();

  if (newId) {
    inputEl.value = newId;
    setIdStatus("valid", "ID único generado.");
  } else {
    inputEl.value = "";
    setIdStatus("invalid", "No se pudo generar un ID. Intente de nuevo.");
  }
}

async function handleVerifyClick() {
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  if (!inputEl) return;

  const id = inputEl.value.trim();

  // Validaciones
  if (!id) {
    setIdStatus("invalid", "El ID no puede estar vacío.");
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    setIdStatus("invalid", "ID solo puede contener letras, números, guiones y guiones bajos.");
    return;
  }

  setIdStatus("loading", `Verificando '${id}'...`);

  const exists = await checkIdExists(id);

  if (exists) {
    setIdStatus("invalid", "Este ID ya está en uso.");
  } else {
    setIdStatus("valid", "Este ID está disponible.");
  }
}

// ============= SUBMIT DEL FORMULARIO =============

async function handleFormSubmit(event: Event) {
  event.preventDefault();

  // Obtener funciones globales de adminUI
  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification;

  if (!getAuthHeaders || !addNotification) {
    console.error("[addModal] Funciones de adminUI no encontradas");
    alert("Error de inicialización. Refresque la página.");
    return;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  // Validar campos obligatorios
  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!id || !title || !description) {
    addNotification("error", "ID, Título y Descripción son obligatorios.");
    return;
  }

  // Verificar ID una última vez
  setIdStatus("loading", "Verificando ID final...");
  const idExists = await checkIdExists(id);

  if (idExists) {
    setIdStatus("invalid", "Este ID ya está en uso. Genere uno nuevo.");
    addNotification("error", "El ID ya existe. Por favor, genere o escriba uno nuevo.");
    return;
  }

  // Preparar datos
  const newsData: CreateNewsData = {
    id,
    title,
    description,
    publicationDate: formData.get("publicationDate") as string || null,
    link: (formData.get("link") as string)?.trim() || null,
  };

  // Llamar al servicio
  const result = await createNews(newsData, getAuthHeaders());

  if (result.success) {
    addNotification("success", result.message);
    hideAddModal();
    
    // Recargar página para mostrar la nueva noticia
    setTimeout(() => window.location.reload(), 500);
  } else {
    addNotification("error", `Error al crear: ${result.message}`);
  }
}

// ============= INICIALIZACIÓN =============

export function initializeAddModal() {
  const btnAdd = document.getElementById("btn-add-news");
  const btnClose = document.getElementById("btn-close-modal");
  const btnCancel = document.getElementById("btn-cancel");
  const form = document.getElementById("form-add-news");
  const btnGenerateId = document.getElementById("btn-generate-id");
  const btnVerifyId = document.getElementById("btn-verify-id");
  const idInput = document.getElementById("newsId");

  if (!btnAdd || !form || !btnClose || !btnCancel || !btnGenerateId || !btnVerifyId || !idInput) {
    console.warn("[addModal] Faltan elementos del DOM");
    return;
  }

  // Event listeners
  btnClose.onclick = hideAddModal;
  btnCancel.onclick = hideAddModal;
  form.onsubmit = handleFormSubmit;
  btnGenerateId.onclick = generateAndVerifyId;
  btnVerifyId.onclick = handleVerifyClick;

  idInput.addEventListener("input", () => {
    setIdStatus("idle", "El ID ha sido modificado. Verifique su disponibilidad.");
  });

  console.log("✅ [addModal] Inicializado");
}

// Exponer funciones al window para modalController
if (typeof window !== 'undefined') {
  (window as any).showAddModal = showAddModal;
  (window as any).hideAddModal = hideAddModal;
}