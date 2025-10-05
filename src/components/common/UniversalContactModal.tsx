/**
 * UniversalContactModal - Wrapper for New ContactModal
 * Maintains compatibility with existing nanostore-based modal system
 * while using the new ContactModal component
 */

import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { isModalOpen, modalContext, type ModalContext } from '../../stores/modal';
import { ContactModal } from '../modal/ContactModal';
import type { ContextType } from '../modal/ContactModal';

interface ModalContentProps {
  headline?: string;
  subheadline?: string;
  successBadge?: string;
  eligibilityNotice?: string;
}

const UniversalContactModal: React.FC<ModalContentProps> = () => {
  const modalOpen = useStore(isModalOpen);
  const oldContext = useStore(modalContext);
  
  // Listen for global modal events (legacy support)
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      modalContext.set(event.detail || {});
      isModalOpen.set(true);
    };
    
    const handleCloseModal = () => {
      isModalOpen.set(false);
    };
    
    window.addEventListener('openModal', handleOpenModal as EventListener);
    window.addEventListener('closeModal', handleCloseModal);
    
    // Process any queued modal events
    if (typeof (window as any).processModalQueue === 'function') {
      (window as any).processModalQueue();
    }
    
    return () => {
      window.removeEventListener('openModal', handleOpenModal as EventListener);
      window.removeEventListener('closeModal', handleCloseModal);
      (window as any).modalReady = false;
    };
  }, []);
  
  // Convert old context format to new context format
  const convertContext = (oldCtx: ModalContext): ContextType => {
    switch (oldCtx.page) {
      case 'service':
        return {
          type: 'service',
          serviceName: oldCtx.service || 'Relocation Services'
        };
      case 'region':
        return {
          type: 'region',
          regionName: oldCtx.region || 'Switzerland'
        };
      case 'corporate':
        return { type: 'home' };
      case 'blog':
        return { type: 'home' };
      default:
        return { type: 'home' };
    }
  };

  const context = convertContext(oldContext);
  
  const closeModal = () => {
    isModalOpen.set(false);
  };

  if (!modalOpen) return null;

  return (
    <ContactModal
      isOpen={modalOpen}
      onClose={closeModal}
      context={context}
    />
  );
};

export default UniversalContactModal;
