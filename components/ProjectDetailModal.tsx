import React from 'react';
import { CalculatedProject, Employee, ProjectStatus, TaskStatus } from '../types';
import { CalendarIcon, CheckSquareIcon, UsersIcon, XIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const styles = {
    [ProjectStatus.ON_TRACK]: 'bg-green-100 text-green-800',
    [ProjectStatus.AT_RISK]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.OFF_TRACK]: 'bg-red-100 text-red-800',
    [ProjectStatus.COMPLETED]: 'bg-blue-100 text-blue-800',
  };
  return <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
    const styles = {
      [TaskStatus.TO_DO]: 'bg-slate-200 text-slate-700',
      [TaskStatus.IN_PROGRESS]: 'bg-sky-100 text-sky-800',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
  };

const ProjectDetailModal: React.FC<{ project: CalculatedProject; onClose: () => void }> = ({ project, onClose }) => {
    
    const getEmployeeById = (id: string): Employee | undefined => {
        return project.team.find(e => e.id === id);
    }

  return (
    <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-start justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{project.name}</h2>
            <p className="text-text-secondary text-sm mt-1">{project.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors">
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Estado</h4>
                    <StatusBadge status={project.status} />
                </div>
                <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Fecha Límite</h4>
                    <p className="text-text-primary font-semibold flex items-center justify-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(project.deadline).toLocaleDateString()}
                    </p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Equipo</h4>
                    <p className="text-text-primary font-semibold flex items-center justify-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        {project.team.length} Miembros
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <CheckSquareIcon className="w-5 h-5 text-primary" />
                        Desglose de Tareas
                    </h3>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 border-t border-border pt-4">
                        {project.tasks.map(task => {
                            const assignee = getEmployeeById(task.assignedTo);
                            return (
                                <div key={task.id} className="bg-background p-3 rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="text-text-primary text-sm">{task.name}</p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs text-text-secondary">{assignee?.name || 'Sin asignar'}</span>
                                        </div>
                                    </div>
                                    <TaskStatusBadge status={task.status} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Historial Mensual de Horas</h3>
                    <div className="h-[300px] border-t border-border pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={project.historicalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(100, 116, 139, 0.05)'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                                <Legend wrapperStyle={{fontSize: "14px", paddingTop: '10px'}} />
                                <Bar dataKey="assignedHours" name="Asignadas" fill="#4338CA" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="consumedHours" name="Consumidas" fill="#A5B4FC" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetailModal;