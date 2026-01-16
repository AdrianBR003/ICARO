/**
 * utils/news/modals/newsModalController.ts
 * Este archivo es el encargado de leer los datos de los botones y pasárselos al Store
 */

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
      
      // Leer atributos del botón con más debug
      const highlightedAttr = target.dataset.newsHighlighted;
      const highlightedBool = highlightedAttr === 'true';
      
      console.log('🔍 Leyendo datos del botón:', {
        rawAttribute: highlightedAttr,
        typeOf: typeof highlightedAttr,
        booleanValue: highlightedBool,
        allDataset: target.dataset
      });
      
      const data = {
        id: target.dataset.newsId || '',
        title: target.dataset.newsTitle || '',
        description: target.dataset.newsDescription || '',
        link: target.dataset.newsLink || '',
        publicationDate: target.dataset.newsPublicationdate || '',
        highlighted: highlightedBool,  // Ya es boolean aquí
        imageName: target.dataset.newsImagename || null
      };
      
      console.log('📤 Enviando al store:', data);
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
        resetAddForm();
      }
      break;
      
    case 'edit':
      modalElement = document.getElementById('editModal');
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

  setTimeout(() => {
    const firstInput = modalElement?.querySelector('input:not([readonly]):not([type="hidden"])') as HTMLElement;
    firstInput?.focus();
  }, 100);
}

/**
 * Cierra todos los modales
 */
function closeModalUI() {
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
  const closeButtons = [
    'btn-close-modal',
    'btn-cancel',
    'cancelNewsDeleteBtn',
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