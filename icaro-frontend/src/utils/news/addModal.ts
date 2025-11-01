// src/utils/news/addModal.ts

import { adminState } from "@/stores/auth";

const API_BASE = "http://localhost:8080/api";
let scrollPosition = 0;

// --- FUNCIONES DEL MODAL (VISIBILIDAD) ---
function showModal() {
  const modal = document.getElementById("modal-add-news");
  if (!modal) return;
  generateAndVerifyId();
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add("modal-open");
  document.body.style.top = `-${scrollPosition}px`;
  modal.classList.remove("hidden");
  const firstInput = modal.querySelector('input[name="title"]') as HTMLElement;
  if (firstInput) firstInput.focus();
}

function hideModal() {
  const modal = document.getElementById("modal-add-news");
  const form = document.getElementById("form-add-news") as HTMLFormElement;
  if (!modal || !form) return;
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollPosition);
  form.reset();
  resetIdField();
}

// --- LÓGICA DE ID ---
function generateId(): string {
  return `news-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
}

function setIdStatus(status: 'loading' | 'valid' | 'invalid' | 'idle', message: string) {
  const statusEl = document.getElementById("id-status");
  const inputEl = document.getElementById("newsId");
  if (!statusEl || !inputEl) return;
  inputEl.classList.remove("border-[#006D38]", "border-red-500", "focus:ring-[#006D38]", "focus:ring-red-500");
  statusEl.classList.remove("text-[#006D38]", "text-red-600", "text-gray-500");

  switch (status) {
    case 'loading':
      statusEl.innerHTML = `Verificando...`;
      statusEl.className = 'text-gray-500 text-xs';
      break;
    case 'valid':
      statusEl.innerHTML = `✓ ${message}`;
      statusEl.className = 'text-[#006D38] text-xs';
      inputEl.classList.add("border-[#006D38]", "focus:ring-[#006D38]");
      break;
    case 'invalid':
      statusEl.innerHTML = `✕ ${message}`;
      statusEl.className = 'text-red-600 text-xs';
      inputEl.classList.add("border-red-500", "focus:ring-red-500");
      break;
    default:
      statusEl.innerHTML = message;
      statusEl.className = 'text-gray-400 text-xs mt-1';
      break;
  }
}

function resetIdField() {
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  if (inputEl) inputEl.value = "";
  setIdStatus('idle', 'Un ID único es requerido. Genere uno o escriba el suyo.');
}

/**
 * Verifica si un ID existe en el backend.
 * USA EL NUEVO ENDPOINT: GET /api/news/check/{id}
 */
async function checkIdExists(id: string): Promise<boolean> {
  try {
    // --- ¡ESTA LÍNEA ES LA QUE CAMBIA! ---
    // Ya no usamos '?id='
    const response = await fetch(`${API_BASE}/news/check/${encodeURIComponent(id)}`);

    if (response.ok) {
      const exists = await response.json(); // Backend devuelve true (existe) o false (no existe)
      return exists;
    }
    
    // Si el backend devuelve 404 (Not Found), también significa que NO existe.
    if (response.status === 404) {
      return false;
    }

    console.error("Error del servidor al verificar ID:", response.status);
    return true; // Asumimos inválido si hay error
  } catch (error) {
    console.error("Error de red al verificar ID:", error);
    return true; // Asumimos inválido si hay error
  }
}

async function generateAndVerifyId() {
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  if (!inputEl) return;
  let newId = "";
  let isUnique = false;
  let attempts = 0;
  setIdStatus('loading', 'Generando ID único...');
  while (!isUnique && attempts < 5) {
    attempts++;
    newId = generateId();
    const exists = await checkIdExists(newId);
    isUnique = !exists;
  }
  inputEl.value = newId;
  if (isUnique) {
    setIdStatus('valid', 'ID único generado.');
  } else {
    setIdStatus('invalid', 'No se pudo generar un ID. Intente de nuevo.');
  }
}

async function handleVerifyClick() {
  const inputEl = document.getElementById("newsId") as HTMLInputElement;
  if (!inputEl) return;
  const id = inputEl.value.trim();
  if (!id) {
    setIdStatus('invalid', 'El ID no puede estar vacío.');
    return;
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
     setIdStatus('invalid', 'ID solo puede contener letras, números, guiones y guiones bajos.');
     return;
  }
  setIdStatus('loading', `Verificando '${id}'...`);
  const exists = await checkIdExists(id);
  if (exists) {
    setIdStatus('invalid', 'Este ID ya está en uso.');
  } else {
    setIdStatus('valid', 'Este ID está disponible.');
  }
}

// --- LÓGICA DE FORMULARIO ---
async function handleFormSubmit(event: Event) {
  event.preventDefault();
  if (!adminState.get().isAdmin) {
    alert('Debe iniciar sesión como administrador.');
    return;
  }
  const getAuthHeaders = (window as any).getAuthHeaders;
  const addNotification = (window as any).addNotification;
  if (typeof getAuthHeaders !== 'function' || typeof addNotification !== 'function') {
    console.error("Funciones de adminUI (getAuthHeaders, addNotification) no encontradas.");
    alert("Error de inicialización. Refresque la página.");
    return;
  }
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const id = (formData.get("id") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  if (!id || !title || !description) {
    addNotification("error", "ID, Título y Descripción son obligatorios.");
    return;
  }
  setIdStatus('loading', 'Verificando ID final...');
  const idExists = await checkIdExists(id);
  if (idExists) {
    setIdStatus('invalid', 'Este ID ya está en uso. Genere uno nuevo.');
    addNotification("error", "El ID ya existe. Por favor, genere o escriba uno nuevo.");
    return;
  }
  const newsData = {
    id: id,
    title: title,
    description: description,
    publicationDate: formData.get("publicationDate") || null,
    link: (formData.get("link") as string)?.trim() || null,
  };
  try {
    const response = await fetch(`${API_BASE}/news/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(newsData),
    });
    if (response.ok) {
      addNotification('success', 'Noticia creada exitosamente.');
      hideModal();
      window.location.reload();
    } else {
      const errorText = await response.text();
      addNotification('error', `Error al crear: ${errorText}`);
    }
  } catch (error) {
    console.error("Error creando noticia:", error);
    addNotification('error', 'Error de conexión al crear la noticia.');
  }
}

// --- INICIALIZADOR PRINCIPAL ---
export function initializeAddModal() {
  console.log('📰 [NewsAdd] Inicializando script del modal...');
  const btnAdd = document.getElementById("btn-add-news");
  const modal = document.getElementById("modal-add-news");
  const btnClose = document.getElementById("btn-close-modal");
  const btnCancel = document.getElementById("btn-cancel");
  const form = document.getElementById("form-add-news");
  const btnGenerateId = document.getElementById("btn-generate-id");
  const btnVerifyId = document.getElementById("btn-verify-id");
  const idInput = document.getElementById("newsId");
  if (!btnAdd || !modal || !form || !btnClose || !btnCancel || !btnGenerateId || !btnVerifyId || !idInput) {
    console.warn("[NewsAdd] Faltan elementos del modal. La inicialización puede fallar.");
    return;
  }
  btnAdd.onclick = (e) => {
    e.preventDefault();
    if (adminState.get().isAdmin) {
      showModal();
    } else {
      alert('Debe iniciar sesión como administrador.');
    }
  };
  btnClose.onclick = hideModal;
  btnCancel.onclick = hideModal;
  modal.onclick = (e) => {
    if (e.target === modal) hideModal();
  };
  document.onkeydown = (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) hideModal();
  };
  form.onsubmit = handleFormSubmit;
  btnGenerateId.onclick = generateAndVerifyId;
  btnVerifyId.onclick = handleVerifyClick;
  idInput.addEventListener('input', () => {
     setIdStatus('idle', 'El ID ha sido modificado. Verifique su disponibilidad.');
  });
  console.log('✅ [NewsAdd] Modal listo.');
}