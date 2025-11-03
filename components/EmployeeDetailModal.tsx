import React, { useState, useEffect, useRef } from 'react';
import { CalculatedEmployee, Employee, CalculatedProject } from '../types';
import { XIcon, EditIcon, TrashIcon, BriefcaseIcon } from './Icons';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface EmployeeDetailModalProps {
  employee: CalculatedEmployee;
  projects: CalculatedProject[];
  onClose: () => void;
  onUpdateProjectHours: (employeeId: string, projectId: string, newAssignedHours: number) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, projects, onClose, onUpdateProjectHours, onEditEmployee, onDeleteEmployee }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.1 });
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: onClose });
  };

  const employeeProjects = employee.projects.map(ep => {
    const projectDetails = projects.find(p => p.id === ep.projectId);
    return { ...ep, ...projectDetails };
  });

  const [editingHours, setEditingHours] = useState<{ [projectId: string]: string }>({});

  const handleHoursChange = (projectId: string, value: string) => {
    setEditingHours(prev => ({ ...prev, [projectId]: value }));
  };

  const handleHoursSave = (projectId: string) => {
    const newHours = parseInt(editingHours[projectId], 10);
    if (!isNaN(newHours)) {
      onUpdateProjectHours(employee.id, projectId, newHours);
      setEditingHours(prev => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
    }
  };
  
  const chartData = employee.historicalData.map(d => ({
    month: d.month,
    Balance: d.consumedHours - d.assignedHours,
  }));

  const getBarColor = (value: number) => {
      if (value > 5) return '#3B82F6'; // Superado (Azul)
      if (value >= -5) return '#22C55E'; // Meta Cumplida (Verde)
      return '#F97316'; // Horas Pendientes (Naranja)
  };

  const totalAssignedHoursCurrentMonth = employee.recurringHours + employee.oneTimeHours;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="bg-surface border border-border rounded-3xl shadow-custom-strong w-[95vw] h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-modal-title"
      >
        <header className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src={employee.avatar} alt={employee.name} className="w-14 h-14 rounded-full" />
            <div>
              <h2 id="employee-modal-title" className="text-2xl font-montserrat font-bold text-text-primary">
                {employee.name}
              </h2>
              <p className="text-text-secondary font-open-sans">{employee.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEditEmployee(employee)} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Editar empleado">
              <EditIcon className="w-5 h-5 text-text-secondary" />
            </button>
            <button onClick={() => onDeleteEmployee(employee)} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Eliminar empleado">
              <TrashIcon className="w-5 h-5 text-red-500" />
            </button>
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Cerrar modal">
              <XIcon className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
        </header>
        
        <div className="p-6 overflow-y-auto flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-background p-4 rounded-xl border border-border text-center">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary">Ocupación Actual</h4>
                        <p className="text-3xl font-montserrat font-bold text-text-primary mt-1">{employee.occupancyRate}%</p>
                    </div>
                    <div className="bg-background p-4 rounded-xl border border-border text-center">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary">Horas Asignadas</h4>
                        <p className="text-3xl font-montserrat font-bold text-text-primary mt-1">{totalAssignedHoursCurrentMonth}h<span className="text-lg text-text-secondary">/{employee.totalHoursMonth}h</span></p>
                    </div>
                    <div className="bg-background p-4 rounded-xl border border-border text-center">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary">Balance Mensual</h4>
                        <p className={`text-3xl font-montserrat font-bold mt-1 ${employee.balanceHours < 0 ? 'text-red-500' : 'text-green-600'}`}>{employee.balanceHours}h</p>
                    </div>
                </div>
                <div>
                     <h3 className="text-lg font-montserrat font-bold text-text-primary my-4 flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5" />
                        Proyectos Asignados
                    </h3>
                    <div className="space-y-3 max-h-[calc(95vh-450px)] overflow-y-auto pr-2">
                        {employeeProjects.map(p => p && (
                        <div key={p.id} className="bg-background p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <p className="font-montserrat font-semibold text-text-primary">{p.name}</p>
                                <p className="text-sm text-text-secondary font-open-sans">{p.consumedHours}h / {p.assignedHours}h consumidas</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor={`hours-${p.id}`} className="text-sm font-medium text-text-secondary sr-only">Asignar:</label>
                                <input id={`hours-${p.id}`} type="number" value={editingHours[p.id] ?? p.assignedHours} onChange={(e) => handleHoursChange(p.id, e.target.value)} className="w-20 px-2 py-1 border border-border rounded-md text-center focus:ring-1 focus:ring-primary focus:border-primary" />
                                <button onClick={() => handleHoursSave(p.id)} className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-dark transition-colors" disabled={editingHours[p.id] === undefined}>Guardar</button>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-3">
                <h3 className="text-lg font-montserrat font-bold text-text-primary mb-4">Historial Mensual de Balance</h3>
                <div className="h-[calc(95vh-200px)] w-full bg-background p-4 rounded-xl border border-border">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} allowDecimals={false} unit="h" />
                            <Tooltip
                                cursor={{ fill: 'rgba(229, 229, 229, 0.2)' }}
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    fontFamily: "'Open Sans', sans-serif"
                                }}
                             />
                            <Legend verticalAlign="bottom" height={36} iconSize={10} formatter={(value, entry) => <span className="text-text-secondary text-xs">{value}</span>} />
                            <Bar dataKey="Balance" name="Balance de Horas">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getBarColor(entry.Balance)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center items-center gap-4 mt-2 text-xs text-text-secondary">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500"></div>Superado</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500"></div>Meta Cumplida</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-orange-500"></div>Horas Pendientes</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;
