import { modalStore, modalActions, type ModalType } from '@/stores/modalStore';

let scrollPosition = 0;
let isInitialized = false;

export function initializeResearchModalController() {
  if (isInitialized) return;
  console.log('🔬 [ResearchModalController] Inicializando...');

  // 1. Suscripción al Store (Gestión Visual)
  modalStore.subscribe((state) => {
    if (state.isOpen && state.type) {
      openModalUI(state.type, state.data || {});
    } else {
      closeModalUI();
    }
  });

  // 2. Listeners
  attachButtonListeners();
  attachGlobalListeners();

  isInitialized = true;
}

function attachButtonListeners() {
  const container = document.getElementById("research-page-wrapper");
  const addBtn = document.getElementById('addResearchButton');

  // Trigger AÑADIR
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modalActions.open('add');
    });
  }

  // Triggers EDITAR / ELIMINAR (Delegación)
  if (container) {
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Editar
      const editBtn = target.closest('.edit-btn');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const json = editBtn.getAttribute('data-entity-data');
        if (json) {
          try {
            modalActions.open('edit', JSON.parse(json));
          } catch (err) { console.error("Error parsing research data", err); }
        }
        return;
      }

      // Eliminar
      const deleteBtn = target.closest('.delete-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = deleteBtn.getAttribute('data-entity-id');
        const title = deleteBtn.getAttribute('data-entity-title');
        if (id) modalActions.open('delete', { id, title });
        return;
      }
    });
  }
}

function openModalUI(type: ModalType, data: any) {
  let modalElement: HTMLElement | null = null;

  switch (type) {
    case 'add': modalElement = document.getElementById('add-research-modal'); break;
    case 'edit': modalElement = document.getElementById('research-edit-modal'); break; // IDs coinciden con tu HTML anterior
    case 'delete': modalElement = document.getElementById('research-delete-modal'); break;
  }

  if (!modalElement) return;

  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollPosition}px`;
  modalElement.classList.remove('hidden');
}

function closeModalUI() {
  const modals = ['add-research-modal', 'research-edit-modal', 'research-delete-modal'];
  modals.forEach(id => document.getElementById(id)?.classList.add('hidden'));

  document.body.classList.remove('modal-open');
  document.body.style.top = '';
  window.scrollTo(0, scrollPosition);
}

function attachGlobalListeners() {
  // ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStore.get().isOpen) modalActions.close();
  });

  // Overlay y Botones Cerrar
  const modals = ['add-research-modal', 'research-edit-modal', 'research-delete-modal'];
  const closeSelectors = ['.close-add-modal', '#close-edit-modal', '#cancel-edit-btn', '#cancel-delete-btn', '#cancel-delete-btn']; // Ajusta selectores según tus IDs

  modals.forEach(id => {
    const m = document.getElementById(id);
    m?.addEventListener('click', (e) => { if (e.target === m) modalActions.close(); });
  });

  closeSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); modalActions.close(); });
    });
  });
}