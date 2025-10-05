/**
 * useContactModal Hook
 * Manages modal state and provides context-aware opening
 */

import { useState, useCallback } from 'react';
import type { ContextType } from './ContactModal';

export function useContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ContextType>({ type: 'home' });
  const [defaultMode, setDefaultMode] = useState<'quotes' | 'consultation' | undefined>();

  const open = useCallback((
    newContext: ContextType,
    mode?: 'quotes' | 'consultation'
  ) => {
    setContext(newContext);
    setDefaultMode(mode);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    context,
    defaultMode,
    open,
    close,
  };
}

