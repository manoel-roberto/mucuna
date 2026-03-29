'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string; // Tailwind max-w class: max-w-lg, max-w-2xl, max-w-4xl, etc.
  className?: string; // Additional classes for the content container
}

/**
 * Reusable Modal component with "Organic Security" aesthetic.
 * Handles backdrop click to close and prevents scroll on body.
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  maxWidth = 'max-w-xl',
  className = ''
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return (
    <div 
      className="fixed inset-0 bg-primary-mucuna/40 backdrop-blur-xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-500 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-[48px] shadow-2xl ${maxWidth} w-full p-10 space-y-8 animate-in zoom-in-95 duration-500 relative transition-all border border-white/20 my-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start gap-4">
          {(title || subtitle) ? (
            <div className="space-y-1">
              <div className="w-12 h-1.5 bg-accent-mucuna rounded-full opacity-50 mb-4" />
              {title && (
                <h2 className="text-3xl font-black text-primary-mucuna font-display uppercase tracking-tighter italic leading-none">
                  {title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 !== 0 ? "text-accent-mucuna not-italic" : ""}>{word} </span>
                  ))}
                </h2>
              )}
              {subtitle && <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">{subtitle}</p>}
            </div>
          ) : <div />}

          <button 
            onClick={onClose} 
            className="p-3 bg-surface-mucuna rounded-2xl text-primary-mucuna/20 hover:text-primary-mucuna hover:bg-white transition-all shadow-sm hover:rotate-90 active:scale-95"
            title="Fechar Janela"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="relative animate-in slide-in-from-bottom-2 duration-700 delay-150">
          {children}
        </div>
      </div>
    </div>
  );
}
