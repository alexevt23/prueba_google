import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import { XIcon } from './Icons';
import { gsap } from 'gsap';

interface AddEditEmployeeModalProps {
  employee: Employee; // Always an Employee object for editing
  onClose: () => void;
  onSave: (data: Employee) => void; // Always expects an Employee object
}

const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({ employee, onClose, onSave }) => {
  const [name, setName] = useState(employee.name);
  const [totalHoursMonth, setTotalHoursMonth] = useState(String(employee.totalHoursMonth));
  // Removed state for avatar and role as they are no longer editable/displayed

  // GSAP Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation for modal entry
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(1.1)', delay: 0.05 });
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, { scale: 0.95, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modalRef.current, { 
        opacity: 0, 
        duration: 0.15, 
        ease: 'power2.in', 
        onComplete: onClose 
    });
  };

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setTotalHoursMonth(String(employee.totalHoursMonth));
      // No updates for avatar and role states as they are removed
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData: Employee = {
      ...employee, // Keep existing ID and other properties including original avatar/role if present
      name,
      totalHoursMonth: parseInt(totalHoursMonth, 10),
      // avatar and role are not updated from this modal
    };

    onSave(employeeData); // Always editing existing employee
    handleClose();
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" // Changed bg-slate to neutral
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
        <header className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 id="modal-title" className="text-2xl font-montserrat font-bold text-text-primary">
            Editar Empleado
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-background transition-colors"
            aria-label="Cerrar modal"
          >
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-montserrat font-medium text-text-secondary mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-custom-light font-open-sans"
              required
            />
          </div>
          {/* Role input removed */}
          <div>
            <label htmlFor="totalHoursMonth" className="block text-sm font-montserrat font-medium text-text-secondary mb-1">
              Horas Mensuales
            </label>
            <input
              type="number"
              id="totalHoursMonth"
              value={totalHoursMonth}
              onChange={(e) => setTotalHoursMonth(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-custom-light font-open-sans"
              required
              min="0"
            />
          </div>
          {/* Avatar URL input removed */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg border border-border text-text-primary hover:bg-background transition-colors font-montserrat font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-primary text-white shadow-custom-medium hover:bg-gradient-primary-hover transition-all duration-300 font-montserrat font-semibold"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditEmployeeModal;