import { modalStore, modalActions, type ModalType } from '@/stores/modalStore';

let isInitialized = false;
let scrollPosition = 0;

export function initializePeopleModalController() {
  if (isInitialized) return;

  // 1. Suscripción al Store para mostrar/ocultar modales visualmente
  modalStore.subscribe((state) => {
    if (state.isOpen && state.type) {
      openModalUI(state.type);
    } else {
      closeModalUI();
    }
  });

  // 2. Escuchar Clics (Delegación)
  attachButtonListeners();
  
  // 3. Escuchar Teclado (ESC) y Overlay
  attachGlobalListeners();

  isInitialized = true;
}

function attachButtonListeners() {
  // Escuchamos en todo el wrapper para capturar clics en tarjetas dinámicas
  const container = document.getElementById("people-page-wrapper");
  
  // Botón Añadir (que está dentro de PeopleAdd.astro, pero lo controlamos aquí o en su propio archivo)
  // Nota: A veces el botón de añadir tiene su propio ID, si es así, se puede gestionar en peopleAddModal.ts
  // Pero si usa la clase standard, lo capturamos aquí.
  
  if (container) {
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // A. Click en EDITAR
      const editBtn = target.closest('.edit-btn');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        // Leemos el JSON que habremos puesto en el botón en PeopleCard
        const json = editBtn.getAttribute('data-entity-data');
        if (json) {
          try {
            const personData = JSON.parse(json);
            console.log('✏️ [Controller] Abriendo Edit para:', personData.orcid);
            modalActions.open('edit', personData);
          } catch (err) {
            console.error("Error parsing person data", err);
          }
        }
        return;
      }

      // B. Click en ELIMINAR
      const deleteBtn = target.closest('.delete-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const id = deleteBtn.getAttribute('data-entity-id'); // ORCID
        const name = deleteBtn.getAttribute('data-entity-title'); // Nombre completo (para el mensaje)
        
        if (id) {
            console.log('🗑️ [Controller] Abriendo Delete para:', id);
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

  // Bloquear scroll
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
  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalStore.get().isOpen) modalActions.close();
  });

  // Cerrar con Overlay o botones X
  const modals = ['add-people-modal', 'people-edit-modal', 'people-delete-modal'];
  modals.forEach(id => {
    const m = document.getElementById(id);
    m?.addEventListener('click', (e) => { if (e.target === m) modalActions.close(); });
  });
  
  // Selectores de botones cerrar
  // Ajusta estos selectores a los que uses en tus modales (.close-modal, #cancel-btn, etc)
  const closeSelectors = ['.close-modal-btn', '#cancel-btn']; 
  closeSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(btn => 
          btn.addEventListener('click', () => modalActions.close())
      );
  });
}