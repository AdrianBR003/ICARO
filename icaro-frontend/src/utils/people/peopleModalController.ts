import { modalStore, modalActions, type ModalType } from '@/stores/modalStore';

let isInitialized = false;
let scrollPosition = 0;

export function initializePeopleModalController() {
  if (isInitialized) return;

  // 1. Suscripción al Store
  modalStore.subscribe((state) => {
    if (state.isOpen && state.type) {
      openModalUI(state.type);
    } else {
      closeModalUI();
    }
  });

  // 2. Escuchar Clics
  attachButtonListeners();
  
  // 3. Escuchar Teclado y Overlay
  attachGlobalListeners();

  isInitialized = true;
  console.log('✅ [PeopleModalController] Inicializado');
}

function attachButtonListeners() {
  const container = document.getElementById("people-page-wrapper");
  
  if (container) {
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // --- A. Click en EDITAR ---
      const editBtn = target.closest('.edit-btn');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        // 1. Leemos el JSON con los datos de texto
        const json = editBtn.getAttribute('data-entity-data');
        
        // 2. IMPORTANTE: Leemos el nombre de la imagen explícitamente
        // (Esto es lo que añadimos en PeopleCard.astro)
        const imageName = editBtn.getAttribute('data-person-imagename');

        if (json) {
          try {
            const personData = JSON.parse(json);
            
            // 3. Inyectamos el imageName en el objeto de datos
            // Esto asegura que llegue al Store y luego al Modal
            if (imageName) {
                personData.imageName = imageName;
            } else {
                personData.imageName = null;
            }

            console.log('✏️ [Controller] Editando:', personData.orcid, 'Img:', personData.imageName);
            modalActions.open('edit', personData);

          } catch (err) {
            console.error("Error parsing person data", err);
          }
        }
        return;
      }

      // --- B. Click en ELIMINAR ---
      const deleteBtn = target.closest('.delete-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const id = deleteBtn.getAttribute('data-entity-id');
        const name = deleteBtn.getAttribute('data-entity-title');
        
        if (id) {
            console.log('🗑️ [Controller] Borrando:', id);
            modalActions.open('delete', { id, title: name });
        }
        return;
      }
    });
  }
}

function openModalUI(type: ModalType) {
  let modalElement: HTMLElement | null = null;

  switch (type) {
    case 'add': modalElement = document.getElementById('add-people-modal'); break;
    case 'edit': modalElement = document.getElementById('people-edit-modal'); break;
    case 'delete': modalElement = document.getElementById('people-delete-modal'); break;
  }

  if (!modalElement) return;

  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('modal-open');
  document.body.style.top = `-${scrollPosition}px`;
  
  modalElement.classList.remove('hidden');
}

function closeModalUI() {
  const modals = ['add-people-modal', 'people-edit-modal', 'people-delete-modal'];
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

  // Overlay
  const modals = ['add-people-modal', 'people-edit-modal', 'people-delete-modal'];
  modals.forEach(id => {
    const m = document.getElementById(id);
    m?.addEventListener('click', (e) => { if (e.target === m) modalActions.close(); });
  });
  
  // Botones cerrar explícitos
  const closeSelectors = ['.close-modal-btn', '#cancel-btn', '#cancel-edit-btn']; 
  closeSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => 
          btn.addEventListener('click', () => modalActions.close())
      );
  });
}