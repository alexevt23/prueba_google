import React, { useState, useEffect, useRef } from 'react';
import { CalculatedProject, Project, Task, CalculatedEmployee, ProjectStatus } from '../types';
import { XIcon, EditIcon, TrashIcon, CalendarIcon, CheckSquareIcon } from './Icons';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface ProjectDetailModalProps {
  project: CalculatedProject;
  onClose: () => void;
  onEditProject: (project: Project) => void;
  onAssignEmployeeToProject: (projectId: string, employeeId: string, assignedHours: number) => void;
  onEditTask: (projectId: string, task: Task) => void;
  onDeleteProject: (project: Project) => void;
  onDeleteTask: (projectId: string, task: Task) => void;
  allEmployees: CalculatedEmployee[];
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, onEditProject, onAssignEmployeeToProject, onEditTask, onDeleteProject, onDeleteTask, allEmployees }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [assigningEmployee, setAssigningEmployee] = useState<{ id: string, hours: string }>({ id: '', hours: '20' });

  useEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.1 });
  }, []);

  const handleClose = () => {
    gsap.to(contentRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: onClose });
  };
  
  const handleAssign = () => {
    if (assigningEmployee.id && assigningEmployee.hours) {
      onAssignEmployeeToProject(project.id, assigningEmployee.id, parseInt(assigningEmployee.hours, 10));
      setAssigningEmployee({ id: '', hours: '20' });
    }
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.ON_TRACK: return 'bg-green-100 text-green-800';
        case ProjectStatus.AT_RISK: return 'bg-yellow-100 text-yellow-800';
        case ProjectStatus.OFF_TRACK: return 'bg-red-100 text-red-800';
        case ProjectStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const chartData = project.historicalData.map(d => ({
    month: d.month,
    Balance: d.consumedHours - d.assignedHours,
  }));

  const getBarColor = (value: number) => {
      if (value > 5) return '#3B82F6'; // Superado (Azul)
      if (value >= -5) return '#22C55E'; // Meta Cumplida (Verde)
      return '#F97316'; // Horas Pendientes (Naranja)
  };


  const availableEmployees = allEmployees.filter(e => !project.team.some(teamMember => teamMember.id === e.id));

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="bg-surface border border-border rounded-3xl shadow-custom-strong w-full max-w-5xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <header className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 id="project-modal-title" className="text-2xl font-montserrat font-bold text-text-primary">
              {project.name}
            </h2>
            <p className="text-text-secondary font-open-sans">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEditProject(project)} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Editar proyecto">
              <EditIcon className="w-5 h-5 text-text-secondary" />
            </button>
            <button onClick={() => onDeleteProject(project)} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Eliminar proyecto">
              <TrashIcon className="w-5 h-5 text-red-500" />
            </button>
            <button onClick={handleClose} className="p-2 rounded-full hover:bg-background transition-colors" aria-label="Cerrar modal">
              <XIcon className="w-6 h-6 text-text-secondary" />
            </button>
          </div>
        </header>

        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-montserrat font-bold text-text-primary">Historial Mensual de Balance</h3>
            <div className="h-64 w-full bg-background p-4 rounded-xl border border-border">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                        <Bar dataKey="Balance" name="Balance de Horas">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.Balance)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-background p-4 rounded-xl border border-border space-y-3">
                 <div className="flex items-center gap-2 text-sm">
                    <CheckSquareIcon className="w-5 h-5 text-primary" />
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getStatusColor(project.status)}`}>{project.status}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span>Vence: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                <div>
                    <h4 className="font-semibold text-text-primary mb-1">Progreso</h4>
                    <div className="w-full bg-neutral-200 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: `${project.progress}%`}}></div>
                    </div>
                    <p className="text-right text-sm font-bold text-primary mt-1">{project.progress}%</p>
                </div>
             </div>
             
             <div>
                <h3 className="text-lg font-montserrat font-bold text-text-primary mb-2">Equipo ({project.team.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {project.team.map(member => (
                        <div key={member.id} className="flex items-center gap-3 p-2 bg-background rounded-md border">
                            <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="font-semibold text-sm">{member.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
