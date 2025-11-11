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
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Set up event listeners and mark component as ready synchronously
  useEffect(() => {
    console.log('🎯 UniversalContactModal mounted');
    
    // Add DOM marker for MutationObserver detection
    if (containerRef.current) {
      containerRef.current.setAttribute('data-relofinder-modal', 'ready');
    }
    
    const handleOpenModal = (event: CustomEvent) => {
      console.log('🔔 OpenModal event:', event.detail);
      try {
        modalContext.set(event.detail || {});
        isModalOpen.set(true);
        console.log('✅ Modal opened successfully');
      } catch (error) {
        console.error('❌ Error opening modal:', error);
      }
    };
    
    const handleCloseModal = () => {
      console.log('🔔 CloseModal event');
      isModalOpen.set(false);
    };
    
    window.addEventListener('openModal', handleOpenModal as EventListener);
    window.addEventListener('closeModal', handleCloseModal);
    
    // Mark as ready and process queue immediately
    (window as any).modalReady = true;
    if (typeof (window as any).processModalQueue === 'function') {
      (window as any).processModalQueue();
    }
    
    return () => {
      console.log('🔌 UniversalContactModal unmounting');
      window.removeEventListener('openModal', handleOpenModal as EventListener);
      window.removeEventListener('closeModal', handleCloseModal);
      (window as any).modalReady = false;
      if (containerRef.current) {
        containerRef.current.removeAttribute('data-relofinder-modal');
      }
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
    console.log('🚪 Closing modal');
    isModalOpen.set(false);
  };

  // Update the marker div when component mounts
  useEffect(() => {
    const markerDiv = document.getElementById('relofinder-modal-marker');
    if (markerDiv) {
      markerDiv.setAttribute('data-relofinder-modal', 'ready');
    }
    // Also set on container ref if it exists
    if (containerRef.current) {
      containerRef.current.setAttribute('data-relofinder-modal', 'ready');
    }
  }, []);

  // Always render container with marker for MutationObserver, even when modal is closed
  return (
    <>
      {/* Hidden marker for MutationObserver */}
      <div ref={containerRef} data-relofinder-modal="ready" style={{ display: 'none' }} aria-hidden="true" />
      {/* Actual modal */}
      {modalOpen && (
        <ContactModal
          isOpen={modalOpen}
          onClose={closeModal}
          context={context}
        />
      )}
    </>
  );
};

export default UniversalContactModal;
