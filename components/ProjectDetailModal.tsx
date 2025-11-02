import React from 'react';
import { CalculatedProject, Employee, ProjectStatus, TaskStatus, HistoricalData } from '../types';
import { CalendarIcon, CheckSquareIcon, UsersIcon, XIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine, Cell } from 'recharts';

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

// Helper function to calculate balance and determine color
const getBalanceData = (historicalData: HistoricalData[]) => {
    return historicalData.map(d => {
      const balance = d.consumedHours - d.assignedHours;
      let color = '';
      let status = '';
      let description = '';
  
      if (balance > 5) { 
        color = '#EF4444'; 
        status = 'Horas Adicionales'; 
        description = 'Se consumieron más horas de las asignadas (superó el objetivo).';
      } // Red-500
      else if (balance >= -5) { 
        color = '#34D399'; 
        status = 'Meta Cumplida'; 
        description = 'Las horas consumidas están muy cerca de las asignadas (cumplió el objetivo).';
      } // Green-400
      else { 
        color = '#60A5FA'; 
        status = 'Horas Pendientes'; 
        description = 'Se consumieron menos horas de las asignadas (quedaron horas pendientes).';
      } // Blue-400
  
      return { ...d, balance, color, status, description };
    });
  };

  // Custom Tooltip for the balance chart
  const CustomBalanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Get the full data object for the month
      return (
        <div className="bg-surface border border-border rounded-lg p-3 text-sm shadow-md">
          <p className="font-semibold text-text-primary">{label}</p>
          <p className="text-text-secondary mt-1">Estado: {data.status}</p>
          <p className="text-text-secondary">{data.description}</p>
          <p className={`font-mono ${data.balance > 0 ? 'text-red-500' : (data.balance < 0 ? 'text-blue-500' : 'text-green-500')}`}>
              Balance: {data.balance > 0 ? '+' : ''}{data.balance}h
          </p>
          <p className="text-text-secondary">Asignadas: {data.assignedHours}h</p>
          <p className="text-text-secondary">Consumidas: {data.consumedHours}h</p>
        </div>
      );
    }
    return null;
  };

const ProjectDetailModal: React.FC<{ project: CalculatedProject; onClose: () => void }> = ({ project, onClose }) => {
    
    const getEmployeeById = (id: string): Employee | undefined => {
        return project.team.find(e => e.id === id);
    }

    const chartDataWithBalance = getBalanceData(project.historicalData);

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
                    <h3 className="text-lg font-bold text-text-primary mb-4">Historial Mensual de Balance</h3>
                    <div className="h-[300px] border-t border-border pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataWithBalance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(100, 116, 139, 0.05)'}} content={CustomBalanceTooltip} />
                                <ReferenceLine y={0} stroke="#64748B" strokeDasharray="3 3" />
                                <Bar dataKey="balance" name="Balance de Horas">
                                    {
                                        chartDataWithBalance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary mt-4 justify-center">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Horas Adicionales</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400"></span> Meta Cumplida</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Horas Pendientes</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetailModal;