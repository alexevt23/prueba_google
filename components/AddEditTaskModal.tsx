import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, CalculatedEmployee } from '../types';
import { XIcon } from './Icons';
import { gsap } from 'gsap';

interface AddEditTaskModalProps {
  task: Task; // Always a Task object for editing
  projectId: string;
  allEmployees: CalculatedEmployee[]; // All employees for assignment dropdown
  onClose: () => void;
  onSave: (projectId: string, data: Task) => void; // Always expects a Task object
}

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({ task, projectId, allEmployees, onClose, onSave }) => {
  const [name, setName] = useState(task.name);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);
  const [status, setStatus] = useState<TaskStatus>(task.status);

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
    if (task) {
      setName(task.name);
      setAssignedTo(task.assignedTo);
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: Task = {
      ...task, // Keep existing ID and other properties
      name,
      assignedTo,
      status,
    };

    onSave(projectId, taskData); // Always editing existing task
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
            Editar Tarea
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
            <label htmlFor="taskName" className="block text-sm font-montserrat font-medium text-text-secondary mb-1">
              Nombre de la Tarea
            </label>
            <input
              type="text"
              id="taskName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-custom-light font-open-sans"
              required
            />
          </div>
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-montserrat font-medium text-text-secondary mb-1">
              Asignado a
            </label>
            <select
              id="assignedTo"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface shadow-custom-light font-open-sans"
              required
            >
              <option value="" disabled>Selecciona un empleado</option>
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="taskStatus" className="block text-sm font-montserrat font-medium text-text-secondary mb-1">
              Estado de la Tarea
            </label>
            <select
              id="taskStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface shadow-custom-light font-open-sans"
              required
            >
              {Object.values(TaskStatus).map((taskStatus) => (
                <option key={taskStatus} value={taskStatus}>
                  {taskStatus}
                </option>
              ))}
            </select>
          </div>
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

export default AddEditTaskModal;