import { modalStore, modalActions, type ModalType } from '@/stores/modalStore';

let scrollPosition = 0;
let isInitialized = false;

/**
 * Inicializa el controlador de modales para Proyectos
 * Se encarga de la UI (Visibilidad, Scroll, Triggers)
 */
export function initializeProjectModalController() {
  if (isInitialized) {
    console.warn('[ProjectModalController] Ya está inicializado');
    return;
  }

  console.log('🎮 [ProjectModalController] Inicializando...');

  // 1. SUSCRIPCIÓN AL STORE (Reacción visual)
  // Cuando el store cambia, mostramos u ocultamos el modal correspondiente
  modalStore.subscribe((state) => {
    if (state.isOpen && state.type) {
      openModalUI(state.type);
    } else {
      closeModalUI();
    }
  });

  // 2. LISTENERS DE BOTONES (Triggers)
  attachButtonListeners();

  // 3. LISTENERS GLOBALES (Cierre)
  attachGlobalListeners();

  isInitialized = true;
}

/**
 * Escucha los clics en los botones de la página y actualiza el Store
 */
/**
 * Adjunta listeners usando DELEGACIÓN DE EVENTOS.
 * Esto funciona incluso si los botones se renderizan tarde o cambian.
 */
function attachButtonListeners() {
  // Escuchamos en el body (o en #projects-page-wrapper si prefieres) para no fallar nunca
  document.body.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // 1. CASO: Botón AÑADIR (Busca por ID)
    // Usamos .closest() por si el usuario hace clic en el icono SVG dentro del botón
    const addBtn = target.closest('#addProjectButton');
    if (addBtn) {
      e.preventDefault();
      console.log("👆 [Controller] Click en AÑADIR detectado");
      modalActions.open('add');
      return; // Importante: Salimos para no evaluar otros casos
    }

    // 2. CASO: Botón EDITAR (Busca por clase)
    const editBtn = target.closest('.edit-btn');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      
      const json = editBtn.getAttribute('data-entity-data');
      if (json) {
        try {
          const data = JSON.parse(json);
          console.log("👆 [Controller] Click en EDITAR detectado");
          modalActions.open('edit', data);
        } catch (err) {
          console.error("Error parsing project data", err);
        }
      }
      return;
    }

    // 3. CASO: Botón ELIMINAR (Busca por clase)
    const deleteBtn = target.closest('.delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = deleteBtn.getAttribute('data-entity-id');
      const title = deleteBtn.getAttribute('data-entity-title');
      
      if (id) {
        console.log("👆 [Controller] Click en ELIMINAR detectado");
        modalActions.open('delete', { id, title });
      }
      return;
    }
  });
}

/**
 * Abre visualmente el modal correspondiente (quita 'hidden', bloquea scroll)
 * NOTA: El rellenado de datos lo hacen los archivos .ts específicos al suscribirse al store.
 */
function openModalUI(type: ModalType) {
  let modalElement: HTMLElement | null = null;

  switch (type) {
    case 'add':
      modalElement = document.getElementById('add-project-modal');
      break;
    case 'edit':
      modalElement = document.getElementById('project-edit-modal');
      break;
    case 'delete':
      modalElement = document.getElementById('project-delete-modal');
      break;
  }

  if (!modalElement) {
    console.warn(`[ProjectModalController] Modal "${type}" no encontrado en el DOM`);
    return;
  }

  // Guardar posición y bloquear scroll
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollPosition}px`;

  // Mostrar
  modalElement.classList.remove('hidden');

  // Accesibilidad: Enfocar primer input visible
  setTimeout(() => {
    const input = modalElement?.querySelector('input:not([type="hidden"]), button.confirm-btn') as HTMLElement;
    if (input) input.focus();
  }, 50);
}

/**
 * Cierra visualmente todos los modales
 */
function closeModalUI() {
  const modals = ['add-project-modal', 'project-edit-modal', 'project-delete-modal'];
  
  modals.forEach(id => {
    const m = document.getElementById(id);
    if (m && !m.classList.contains('hidden')) {
      m.classList.add('hidden');
    }
  });

  // Restaurar scroll
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, scrollPosition);
}

/**
 * Adjunta listeners para cerrar (ESC, Overlay, Botones cancelar)
 */
function attachGlobalListeners() {
  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStore.get().isOpen) {
      modalActions.close();
    }
  });

  // Click en Overlay (Fondo oscuro)
  const modals = ['add-project-modal', 'project-edit-modal', 'project-delete-modal'];
  modals.forEach(id => {
    const m = document.getElementById(id);
    if (m) {
      m.addEventListener('click', (e) => {
        // Si el click fue exactamente en el contenedor padre (overlay)
        if (e.target === m || (e.target as HTMLElement).classList.contains('modal-overlay')) {
          modalActions.close();
        }
      });
    }
  });

  // Botones de cerrar explícitos (X y Cancelar)
  const closeSelectors = [
    '.close-add-modal', // Add
    '#close-edit-modal', '#cancel-edit-btn', // Edit
    '#cancel-delete-btn' // Delete
  ];

  closeSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalActions.close();
      });
    });
  });
}