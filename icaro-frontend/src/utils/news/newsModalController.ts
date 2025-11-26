import { modalStore, modalActions, type ModalType } from '@/stores/modalStore';

let scrollPosition = 0;
let isInitialized = false;

/**
 * Inicializa el controlador de modales
 * Solo debe llamarse una vez al cargar la página
 */
export function initializeModalController() {
  if (isInitialized) {
    console.warn('[ModalController] Ya está inicializado');
    return;
  }

  console.log('[ModalController] Inicializando...');

  // --- Suscribirse a cambios en el store ---
  modalStore.subscribe((state) => {
    if (state.isOpen && state.type) {
      openModalUI(state.type, state.data || {});
    } else {
      closeModalUI();
    }
  });

  // --- Event listeners para botones de las cards ---
  attachCardButtonListeners();

  // --- Event listeners globales (ESC, click fuera) ---
  attachGlobalListeners();

  isInitialized = true;
  console.log('✅ [ModalController] Inicializado');
}

/**
 * Adjunta listeners a todos los botones de editar/eliminar en las cards
 */
function attachCardButtonListeners() {
  // --- Botón de Añadir ---
  const addBtn = document.getElementById('btn-add-news');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modalActions.open('add');
    });
  }

  // --- Botones de Editar ---
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      
      const data = {
        id: target.dataset.newsId || '',
        title: target.dataset.newsTitle || '',
        description: target.dataset.newsDescription || '',
        link: target.dataset.newsLink || '',
        publicationDate: target.dataset.newsPublicationdate || '',
      };

      modalActions.open('edit', data);
    });
  });

  // --- Botones de Eliminar ---
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      
      const data = {
        id: target.dataset.newsId || '',
        title: target.dataset.newsTitle || '',
      };

      modalActions.open('delete', data);
    });
  });
}

/**
 * Abre el modal en la UI (muestra el HTML y rellena el formulario)
 */
function openModalUI(type: ModalType, data: any) {
  let modalElement: HTMLElement | null = null;
  
  switch (type) {
    case 'add':
      modalElement = document.getElementById('modal-add-news');
      if (modalElement) {
        // El modal de add maneja su propio reseteo
        resetAddForm();
      }
      break;
      
    case 'edit':
      modalElement = document.getElementById('editModal');
      if (modalElement) {
        fillEditForm(data);
      }
      break;
      
    case 'delete':
      modalElement = document.getElementById('deleteNewsModal');
      if (modalElement) {
        fillDeleteModal(data);
      }
      break;
  }

  if (!modalElement) {
    console.error(`[ModalController] Modal "${type}" no encontrado en el DOM`);
    return;
  }

  // --- Guardar posición de scroll y bloquear body ---
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollPosition}px`;

  // --- Mostrar modal ---
  modalElement.classList.remove('hidden');

  // --- Enfocar primer input ---
  setTimeout(() => {
    const firstInput = modalElement?.querySelector('input:not([readonly]):not([type="hidden"])') as HTMLElement;
    firstInput?.focus();
  }, 100);
}

/**
 * Cierra todos los modales
 */
function closeModalUI() {
  // Cerrar todos los modales
  ['modal-add-news', 'editModal', 'deleteNewsModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal && !modal.classList.contains('hidden')) {
      modal.classList.add('hidden');
    }
  });

  // --- Restaurar scroll y desbloquear body ---
  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, scrollPosition);
}

/**
 * Rellena el formulario de edición con los datos
 */
function fillEditForm(data: any) {
  const form = document.getElementById('editForm') as HTMLFormElement;
  if (!form) return;

  // Rellenar campos
  (document.getElementById('editId') as HTMLInputElement).value = data.id || '';
  (document.getElementById('editIdDisplay') as HTMLInputElement).value = data.id || '';
  (document.getElementById('editTitle') as HTMLInputElement).value = data.title || '';
  (document.getElementById('editDescription') as HTMLTextAreaElement).value = data.description || '';
  (document.getElementById('editLink') as HTMLInputElement).value = data.link || '';
  (document.getElementById('editpublicationDate') as HTMLInputElement).value = data.publicationDate || '';
  (document.getElementById('editHighlighted') as HTMLInputElement).checked = data.highlighted || false;
}

/**
 * Rellena el modal de eliminación con el título
 */
function fillDeleteModal(data: any) {
  const titleElement = document.getElementById('deleteNewsTitle');
  if (titleElement) {
    titleElement.textContent = data.title || `"${data.id}"`;
  }
}

/**
 * Resetea el formulario de añadir (llamado por addModal.ts)
 */
function resetAddForm() {
  const form = document.getElementById('form-add-news') as HTMLFormElement;
  if (form) {
    form.reset();
  }
}

/**
 * Adjunta listeners globales (ESC, click fuera del modal)
 */
function attachGlobalListeners() {
  // --- ESC para cerrar ---
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStore.get().isOpen) {
      modalActions.close();
    }
  });

  // --- Click fuera del modal ---
  ['modal-add-news', 'editModal', 'deleteNewsModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modalActions.close();
        }
      });
    }
  });

  // --- Botones de cerrar/cancelar ---
  attachCloseButtons();
}

/**
 * Adjunta listeners a todos los botones de cerrar/cancelar
 */
function attachCloseButtons() {
  // Botones específicos de cada modal
  const closeButtons = [
    'btn-close-modal',      // Add modal
    'btn-cancel',           // Add modal
    'cancelNewsDeleteBtn',  // Delete modal
  ];

  closeButtons.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalActions.close();
      });
    }
  });

  // Botones que usan onclick="window.hideModal()" (Edit modal)
  document.querySelectorAll('[onclick*="hideModal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modalActions.close();
    });
  });
}

/**
 * Expone una función global para compatibilidad con código legacy
 */
if (typeof window !== 'undefined') {
  (window as any).hideModal = () => modalActions.close();
  (window as any).openModal = (type: ModalType, data?: any) => modalActions.open(type, data);
}