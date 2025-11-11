/**
 * Expose modal stores to window for inline script access
 * This runs independently of React, so it works even if React hydration fails
 */

import { isModalOpen, modalContext, type ModalContext } from '../stores/modal';

// Expose stores to window immediately (not waiting for React)
if (typeof window !== 'undefined') {
  (window as any).relofinderModalStores = {
    modalContext,
    isModalOpen,
    setContext: (ctx: ModalContext) => modalContext.set(ctx),
    setOpen: (open: boolean) => isModalOpen.set(open),
  };
  
  console.log('📦 Modal stores exposed to window');
}

