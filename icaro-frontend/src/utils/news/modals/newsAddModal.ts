import { modalStore, modalActions } from "@/stores/modalStore";
import { 
  createNews, 
  checkIdExists, 
  generateUniqueId,
  type CreateNewsData 
} from "@/services/news/newsAddService";

// ============= LÓGICA DE NEGOCIO (ID) =============

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

  // Obtener funciones globales
  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification;

  if (!getAuthHeaders) {
    console.error("[addModal] Funciones de adminUI no encontradas");
    return;
  }

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  // 1. Validar campos obligatorios
  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!id || !title || !description) {
    if(addNotification) addNotification("error", "ID, Título y Descripción son obligatorios.");
    return;
  }

  // 2. Verificar ID una última vez
  setIdStatus("loading", "Verificando ID final...");
  const idExists = await checkIdExists(id);

  if (idExists) {
    setIdStatus("invalid", "Este ID ya está en uso.");
    if(addNotification) addNotification("error", "El ID ya existe.");
    return;
  }

  // 3. Preparar datos
  const newsData: CreateNewsData = {
    id,
    title,
    description,
    publicationDate: formData.get("publicationDate") as string || null,
    link: (formData.get("link") as string)?.trim() || null,
  };

  // 4. Llamar al servicio
  const result = await createNews(newsData, getAuthHeaders());

  if (result.success) {
    if(addNotification) addNotification("success", result.message);
    
    // Limpiamos
    form.reset();
    resetIdField();
    
    // Cerramos via Store (El controller se encarga de ocultar el HTML)
    modalActions.close();
    
    setTimeout(() => window.location.reload(), 500);
  } else {
    if(addNotification) addNotification("error", `Error al crear: ${result.message}`);
  }
}

// ============= INICIALIZACIÓN =============

export function initializeAddModal() {
  const form = document.getElementById("form-add-news") as HTMLFormElement;
  const btnGenerateId = document.getElementById("btn-generate-id");
  const btnVerifyId = document.getElementById("btn-verify-id");
  const idInput = document.getElementById("newsId");

  // Si no hay formulario, salimos (quizás no se ha renderizado el modal aún)
  if (!form) return;

  // 1. Suscripción al Store para REACCIONAR a la apertura
  // Esto reemplaza a showAddModal()
  modalStore.subscribe(state => {
    if (state.isOpen && state.type === 'add') {
      // Cuando el store dice "OPEN ADD", nosotros preparamos el formulario
      // El controller se encarga de quitar la clase 'hidden' y el scroll
      form.reset();
      generateAndVerifyId(); // Generar ID automáticamente
      
      // Enfocar primer input
      setTimeout(() => {
          const firstInput = form.querySelector('input[name="title"]') as HTMLElement;
          if(firstInput) firstInput.focus();
      }, 50);
    }
  });

  // 2. Listeners internos del formulario
  form.onsubmit = handleFormSubmit;
  
  if (btnGenerateId) btnGenerateId.onclick = generateAndVerifyId;
  if (btnVerifyId) btnVerifyId.onclick = handleVerifyClick;

  if (idInput) {
    idInput.addEventListener("input", () => {
      setIdStatus("idle", "El ID ha sido modificado. Verifique su disponibilidad.");
    });
  }

  console.log("✅ [NewsAddModal] Lógica interna inicializada");
}