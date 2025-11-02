import React, { useState, useEffect } from 'react';
import { CalculatedEmployee, CalculatedProject, ProjectType, HistoricalData } from '../types';
import { XIcon, ChartBarIcon, ChevronDownIcon } from './Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine, Cell } from 'recharts';

interface EmployeeDetailModalProps {
  employee: CalculatedEmployee;
  projects: CalculatedProject[];
  onClose: () => void;
  onUpdateProjectHours: (employeeId: string, projectId:string, newAssignedHours: number) => void;
}

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

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, projects, onClose, onUpdateProjectHours }) => {
  const [editedHours, setEditedHours] = useState<Record<string, string>>({});
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const initialHours = employee.projects.reduce((acc, p) => {
        acc[p.projectId] = String(p.assignedHours);
        return acc;
    }, {} as Record<string, string>);
    setEditedHours(initialHours);
  }, [employee]);

  const getProjectById = (id: string): CalculatedProject | undefined => {
    return projects.find(p => p.id === id);
  }
  
  const handleToggleExpand = (projectId: string) => {
    setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
  };

  const handleHourChange = (projectId: string, value: string) => {
    setEditedHours(prev => ({ ...prev, [projectId]: value }));
  };

  const handleHourUpdate = (projectId: string) => {
    const value = editedHours[projectId];
    const newHours = parseInt(value, 10);
    const originalHours = employee.projects.find(p => p.projectId === projectId)?.assignedHours;

    if (!isNaN(newHours) && newHours >= 0) {
      if (newHours !== originalHours) {
        onUpdateProjectHours(employee.id, projectId, newHours);
      }
    } else {
      setEditedHours(prev => ({...prev, [projectId]: String(originalHours)}));
    }
  };

  const chartDataWithBalance = getBalanceData(employee.historicalData);

  return (
    <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
    >
      <div 
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{employee.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background transition-colors">
            <XIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-1">Ocupación</h4>
                    <p className="text-2xl font-bold text-text-primary">{employee.occupancyRate}%</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-1">Horas Asignadas</h4>
                    <p className="text-2xl font-bold text-text-primary">{employee.recurringHours}h / {employee.oneTimeHours}h</p>
                </div>
                <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-text-secondary mb-1">Balance Mensual</h4>
                    <p className={`text-2xl font-bold ${employee.balanceHours < 0 ? 'text-red-600' : 'text-green-600'}`}>{employee.balanceHours}h</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">Proyectos Asignados</h3>
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 border-t border-border pt-4">
                        {employee.projects.map(empProject => {
                            const project = getProjectById(empProject.projectId);
                            if (!project) return null;
                            const isExpanded = expandedProjectId === project.id;

                            return (
                                <div key={project.id} className="bg-background rounded-lg transition-all duration-300">
                                    <div className="p-3 flex items-center justify-between gap-2">
                                        <div className="flex-grow">
                                            <p className="text-text-primary font-semibold text-sm">{project.name}</p>
                                            <span className={`mt-1 text-xs px-2 py-0.5 rounded-full self-start ${project.type === ProjectType.RECURRING ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                                {project.type}
                                            </span>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    value={editedHours[project.id] || ''}
                                                    onChange={(e) => handleHourChange(project.id, e.target.value)}
                                                    onBlur={() => handleHourUpdate(project.id)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLElement).blur(); } }}
                                                    className="w-16 bg-surface border border-border rounded-md p-1 text-center font-mono focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                                                />
                                                <span className="text-sm text-text-secondary w-12 text-left">/ {empProject.consumedHours}h</span>
                                            </div>
                                            <p className="text-xs text-text-secondary mt-1">Asig. / Cons.</p>
                                        </div>
                                        <button onClick={() => handleToggleExpand(project.id)} className="p-1 rounded-full hover:bg-slate-200 flex-shrink-0">
                                            <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                     {isExpanded && (
                                       <div className="border-t border-border mx-3 mb-3 pt-3">
                                           <h4 className="text-xs font-bold uppercase text-text-secondary mb-2 px-1">Equipo del Proyecto</h4>
                                           <div className="space-y-2">
                                               {project.team.map(teamMember => {
                                                   const memberProjectData = teamMember.projects.find(p => p.projectId === project.id);
                                                   if (!memberProjectData) return null;
                                                   const consumed = memberProjectData.consumedHours;
                                                   const assigned = memberProjectData.assignedHours;
                                                   const progress = assigned > 0 ? Math.min(100, Math.round((consumed / assigned) * 100)) : 0;
                                                   
                                                   return (
                                                     <div key={teamMember.id} className="flex items-center px-1 py-1">
                                                       <div className="flex-grow">
                                                         <div className="flex justify-between items-center">
                                                            <p className="text-sm text-text-primary">{teamMember.name}</p>
                                                            <p className="text-xs font-mono text-text-secondary">{consumed}h / {assigned}h</p>
                                                         </div>
                                                         <div className="flex items-center gap-2 mt-1">
                                                           <div className="w-full bg-slate-200 rounded-full h-1.5">
                                                             <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                                           </div>
                                                           <span className="text-xs font-mono text-text-secondary w-8 text-right">{progress}%</span>
                                                         </div>
                                                       </div>
                                                     </div>
                                                   );
                                               })}
                                           </div>
                                       </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-primary" />
                        Historial Mensual de Balance
                    </h3>
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

export default EmployeeDetailModal;