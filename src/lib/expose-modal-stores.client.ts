/**
 * Client-side script to expose modal stores to window
 * This runs immediately when loaded, before React hydrates
 */

import { isModalOpen, modalContext } from '../stores/modal';

// Expose stores to window immediately (only in browser)
if (typeof window !== 'undefined') {
  (window as any).relofinderModalStores = {
    modalContext,
    isModalOpen,
    setContext: (ctx: any) => modalContext.set(ctx),
    setOpen: (open: boolean) => isModalOpen.set(open),
  };

  console.log('📦 Modal stores exposed to window (pre-React)');
}

