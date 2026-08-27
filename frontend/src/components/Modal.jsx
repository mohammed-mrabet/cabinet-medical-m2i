import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  // Rendu via portail dans document.body : un ancêtre React (ex: une page
  // avec une classe d'animation utilisant `transform`) créerait sinon un
  // containing block qui casserait le `position: fixed` de l'overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] p-4 animate-fade-up"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full ${width} bg-card rounded-card shadow-xl border border-line max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-card rounded-t-card">
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="text-ink-soft hover:text-ink w-8 h-8 flex items-center justify-center rounded-full hover:bg-paper-dim transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
