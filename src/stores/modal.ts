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

// Assessment Modal Store (The new high-trust flow)
export type AssessmentContext = {
  mode: 'full-package' | 'corporate' | 'service';
  initialCanton?: string;
  initialService?: string;
};

export const isAssessmentOpen = atom(false);
export const assessmentContext = atom<AssessmentContext>({ mode: 'full-package' });

export function openModal(context: ModalContext = {}) {
  modalContext.set(context);
  isModalOpen.set(true);
}

export function openAssessmentModal(context: AssessmentContext) {
  assessmentContext.set(context);
  isAssessmentOpen.set(true);
}

export function closeModal() {
  isModalOpen.set(false);
  isAssessmentOpen.set(false);
}