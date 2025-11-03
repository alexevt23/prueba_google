import React, { useEffect, useRef, useState } from 'react';
import { CalculatedProject, Project, Task, CalculatedEmployee, ProjectStatus, TaskStatus } from '../types';
import { XIcon, EditIcon, TrashIcon, ChevronDownIcon } from './Icons';
import { gsap } from 'gsap';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Helper to format minutes into h:mm string
function formatMinutesToHM(minutes: number): string {
  if (isNaN(minutes) || minutes === null) {
    return '0:00';
  }
  const isNegative = minutes < 0;
  const absMinutes = Math.abs(minutes);
  const h = Math.floor(absMinutes / 60);
  const m = Math.round(absMinutes % 60);
  const mFormatted = m < 10 ? `0${m}` : m;
  return `${isNegative ? '-' : ''}${h}:${mFormatted}`;
}

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

const getTaskStatusClasses = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
        case TaskStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
        case TaskStatus.TO_DO: return 'bg-neutral-200 text-neutral-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const TeamMemberRow: React.FC<{
    member: any;
    tasks: Task[];
    isExpanded: boolean;
    onToggle: () => void;
}> = ({ member, tasks, isExpanded, onToggle }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to(contentRef.current, {
            height: isExpanded ? 'auto' : 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: () => {
              if (isExpanded && contentRef.current) {
                contentRef.current.style.height = 'auto';
              }
            }
        });
    }, [isExpanded]);

    return (
        <div className="border-b border-border last:border-b-0">
            <div
                onClick={onToggle}
                className="grid grid-cols-[36px_1fr] md:grid-cols-[36px_4fr_4fr_4fr] gap-4 items-center px-4 py-3 hover:bg-background cursor-pointer transition-colors"
                role="button"
                aria-expanded={isExpanded}
            >
                <div className="flex justify-center items-center">
                    <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <div className="col-start-2 md:col-start-auto">
                  <p className="font-semibold text-sm text-text-primary">{member.name}</p>
                </div>
                <span className="hidden md:block text-sm font-open-sans text-text-secondary text-center">{formatMinutesToHM(member.consumedHours)} / {formatMinutesToHM(member.assignedHours)}</span>
                <div className="hidden md:flex items-center gap-2">
                    <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${member.progress}%` }}></div>
                    </div>
                    <span className="text-sm font-open-sans text-text-secondary w-10 text-right">{member.progress}%</span>
                </div>
            </div>
            <div ref={contentRef} className="overflow-hidden" style={{ height: 0 }}>
                <div className="bg-primary-light/40 px-6 py-4 border-t border-blue-100 ml-[36px]">
                    {tasks.length > 0 ? (
                        <>
                            <h5 className="font-montserrat font-semibold text-sm text-text-primary mb-3">Tareas Asignadas</h5>
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-text-secondary uppercase">
                                    <span>Tarea</span>
                                    <span className="text-right">Horas (Cons/Asig)</span>
                                    <span className="text-right">Estado</span>
                                </div>
                                {tasks.map(task => (
                                    <div key={task.id} className="grid grid-cols-3 gap-2 items-center bg-surface p-2 rounded-lg border border-border text-sm">
                                        <span className="font-open-sans text-text-primary truncate">{task.name}</span>
                                        <span className="font-mono text-text-secondary text-right text-xs">
                                            {formatMinutesToHM(task.consumedHours)} / {formatMinutesToHM(task.assignedHours)}
                                        </span>
                                        <div className="flex justify-end">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTaskStatusClasses(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                         <p className="text-sm text-text-secondary italic">No hay tareas asignadas a este miembro en el proyecto.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose, onEditProject, onAssignEmployeeToProject, onEditTask, onDeleteProject, onDeleteTask, allEmployees }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const chartData = project.historicalData.map(d => ({
    month: d.month,
    'Horas Consumidas': d.consumedHours,
    'Horas Asignadas': d.assignedHours,
  }));

  useEffect(() => {
    gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    gsap.fromTo(contentRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.1 });
  }, []);
  
  const toggleRow = (memberId: string) => {
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(memberId)) {
            newSet.delete(memberId);
        } else {
            newSet.add(memberId);
        }
        return newSet;
    });
  };

  const handleClose = () => {
    gsap.to(contentRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' });
    gsap.to(modalRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in', onComplete: onClose });
  };
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.ON_TRACK: return 'bg-green-100 text-green-800';
        case ProjectStatus.AT_RISK: return 'bg-yellow-100 text-yellow-800';
        case ProjectStatus.OFF_TRACK: return 'bg-red-100 text-red-800';
        case ProjectStatus.COMPLETED: return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const teamData = project.team.map(member => {
    const projectData = member.projects.find(p => p.projectId === project.id);
    const assignedHours = projectData?.assignedHours || 0;
    const consumedHours = projectData?.consumedHours || 0;
    const progress = assignedHours > 0 ? Math.round((consumedHours / assignedHours) * 100) : 0;
    const progressPercentage = Math.min(100, progress); // Cap progress at 100%
    return {
        id: member.id,
        name: member.name,
        assignedHours,
        consumedHours,
        progress: progressPercentage,
    };
  });

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

        <main className="p-6 overflow-y-auto space-y-6">
            {/* KPIs & Progress Section */}
            <section className="bg-background p-6 rounded-xl border border-border shadow-sm">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary mb-1">Horas Asignadas</h4>
                        <p className="text-3xl font-montserrat font-bold text-text-primary">{formatMinutesToHM(project.totalAssignedHours)}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary mb-1">Horas Consumidas</h4>
                        <p className="text-3xl font-montserrat font-bold text-text-primary">{formatMinutesToHM(project.totalConsumedHours)}</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary mb-1">Estado</h4>
                        <span className={`px-2 py-1 rounded-md text-sm font-bold ${getStatusColor(project.status)}`}>{project.status}</span>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <h4 className="text-sm font-montserrat font-semibold text-text-secondary mb-1">Vencimiento</h4>
                        <p className="font-semibold text-text-primary text-lg">{new Date(project.deadline).toLocaleDateString()}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-montserrat font-bold text-text-primary mb-2">Progreso General</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-full bg-neutral-200 rounded-full h-2.5 shadow-inner">
                            <div className="bg-primary h-2.5 rounded-full" style={{width: `${project.progress}%`}}></div>
                        </div>
                        <p className="text-right text-lg font-bold text-primary font-montserrat">{project.progress}%</p>
                    </div>
                </div>
            </section>

            {/* Team Table Section */}
            <section className="bg-background p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-montserrat font-bold text-text-primary mb-4">Equipo ({project.team.length})</h3>
                <div className="bg-surface border border-border rounded-xl">
                    <div className="grid grid-cols-[36px_1fr] md:grid-cols-[36px_4fr_4fr_4fr] gap-4 px-4 py-3 bg-background rounded-t-xl font-montserrat text-xs text-text-secondary uppercase">
                        <div />
                        <div className="col-start-2 md:col-start-auto">MIEMBRO</div>
                        <div className="hidden md:block text-center">HORAS (CONSUMIDAS / ASIGNADAS)</div>
                        <div className="hidden md:block">PROGRESO</div>
                    </div>
                    <div>
                        {teamData.map(member => (
                             <TeamMemberRow
                                key={member.id}
                                member={member}
                                tasks={project.tasks.filter(t => t.assignedTo === member.id)}
                                isExpanded={expandedRows.has(member.id)}
                                onToggle={() => toggleRow(member.id)}
                             />
                           ))}
                    </div>
                </div>
            </section>

            {/* Chart Section */}
            <section className="bg-background p-6 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-montserrat font-bold text-text-primary">Historial Mensual</h3>
                </div>
                <div className="h-64 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} allowDecimals={false} tickFormatter={(value) => `${Math.round(value / 60)}h`} />
                            <Tooltip
                                cursor={{ fill: 'rgba(229, 229, 229, 0.2)' }}
                                contentStyle={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #E5E5E5',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    fontFamily: "'Open Sans', sans-serif"
                                }}
                                formatter={(value: number) => formatMinutesToHM(value)}
                            />
                            <Legend wrapperStyle={{fontSize: "12px", fontFamily: "'Montserrat', sans-serif"}}/>
                            <Bar dataKey="Horas Consumidas" fill="#3B82F6" barSize={40} radius={[4, 4, 0, 0]} />
                            <Line type="monotone" dataKey="Horas Asignadas" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetailModal;