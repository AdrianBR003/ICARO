// Estado centralizado para todos los modales

import { atom } from 'nanostores';

export type ModalType = 'add' | 'edit' | 'delete' | null;

export interface ModalData {
  id?: string;
  title?: string;
  description?: string;
  link?: string;
  publicationDate?: string;
  highlighted?: boolean;
  [key: string]: any;
}

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: ModalData | null;
}

// Estado inicial
const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

// Atom del store
export const modalStore = atom<ModalState>(initialState);

// Acciones
export const modalActions = {
  /**
   * Abre un modal con datos opcionales
   */
  open(type: ModalType, data: ModalData = {}) {
    modalStore.set({
      isOpen: true,
      type,
      data,
    });
  },

  /**
   * Cierra el modal actual
   */
  close() {
    modalStore.set(initialState);
  },

  /**
   * Actualiza solo los datos sin cerrar el modal
   */
  updateData(data: Partial<ModalData>) {
    const current = modalStore.get();
    modalStore.set({
      ...current,
      data: {
        ...current.data,
        ...data,
      },
    });
  },

  /**
   * Verifica si un modal específico está abierto
   */
  isModalOpen(type: ModalType): boolean {
    const state = modalStore.get();
    return state.isOpen && state.type === type;
  },
};