import { atom } from 'nanostores';

export type ModalContext = {
  page?: 'blog' | 'service' | 'corporate' | 'region' | 'home';
  topic?: string;
  service?: string;
  region?: string;
};

export const isModalOpen = atom(false);
export const modalContext = atom<ModalContext>({});

export function openModal(context: ModalContext = {}) {
  modalContext.set(context);
  isModalOpen.set(true);

  // If the global modal helper is available, open it as well
  if (typeof window !== 'undefined' && typeof (window as any).openModal === 'function') {
    (window as any).openModal({
      tab: context.page === 'corporate' ? 'corporate' : context.page === 'home' ? 'individual' : context.page,
      ...context
    });
  }
}

export function closeModal() {
  isModalOpen.set(false);

  if (typeof window !== 'undefined' && typeof (window as any).closeModal === 'function') {
    (window as any).closeModal();
  }
} 