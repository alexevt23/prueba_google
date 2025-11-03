import React, { useEffect, useRef } from 'react';
import { XIcon, AlertTriangleIcon } from './Icons';
import { gsap } from 'gsap';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ onClose, onConfirm, title, message }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.1)', delay: 0.05 });
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, { scale: 0.95, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.15, ease: 'power2.in', onComplete: onClose });
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="bg-surface border border-border rounded-3xl shadow-custom-strong w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="flex items-start justify-between p-6 border-b border-border">
          <h2 id="modal-title" className="text-2xl font-montserrat font-bold text-text-primary flex items-center gap-3">
            <AlertTriangleIcon className="w-6 h-6 text-red-500" />
            {title}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Cerrar modal">
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </header>
        <div className="p-6">
          <p className="text-text-secondary font-open-sans">{message}</p>
        </div>
        <footer className="flex justify-end gap-3 p-6 bg-background rounded-b-3xl mt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-border text-text-primary hover:bg-neutral-100 transition-colors font-montserrat font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 text-white shadow-md hover:bg-red-700 transition-all duration-300 font-montserrat font-semibold"
          >
            Eliminar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
