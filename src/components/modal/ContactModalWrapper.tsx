/**
 * ContactModalWrapper
 * Client component that wraps ContactModal and provides the hook
 * Use this in Astro pages as a React island
 */

import { useState } from 'react';
import { ContactModal } from './ContactModal';
import type { ContextType } from './ContactModal';

type ContactModalWrapperProps = {
  triggerText?: string;
  context: ContextType;
  defaultMode?: 'quotes' | 'consultation';
  className?: string;
};

export function ContactModalWrapper({
  triggerText = 'Get Started',
  context,
  defaultMode,
  className = '',
}: ContactModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className || 'px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200'}
      >
        {triggerText}
      </button>
      
      <ContactModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={context}
        defaultMode={defaultMode}
      />
    </>
  );
}

