import { atom } from 'nanostores';

export type ModalContext = {
  page?: 'blog' | 'service' | 'corporate' | 'region' | 'home' | 'results';
  topic?: string;
  service?: string;
  region?: string;
  selectedAgencies?: string[]; // IDs of agencies if coming from results page
  company?: string;
  volume?: string;
  where?: string;
};

export const isModalOpen = atom(false);
export const modalContext = atom<ModalContext>({});

export function openModal(context: ModalContext = {}) {
  modalContext.set(context);
  isModalOpen.set(true);
}

export function closeModal() {
  isModalOpen.set(false);
} 