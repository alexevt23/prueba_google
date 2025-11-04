import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalculatedProject } from '../types';
import { ChevronDownIcon } from './Icons';
import { ComposedChart, Bar, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { gsap } from 'gsap';

function formatMinutesToHM(minutes: number): string {
    if (isNaN(minutes)) return '0:00';
    const h = Math.floor(Math.abs(minutes) / 60);
    const m = Math.round(Math.abs(minutes) % 60);
    return `${h}:${m < 10 ? '0' : ''}${m}`;
}

const ExpandedRowContent: React.FC<{ project: CalculatedProject }> = ({ project }) => {
    const chartData = useMemo(() => {
        return project.historicalData.map(d => ({
            month: d.month,
            'Horas Consumidas': d.consumedHours,
            'Horas Asignadas': d.assignedHours,
        }));
    }, [project.historicalData]);
    
    return (
        <div className="bg-primary-light/40 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
           <div>
                <h4 className="font-montserrat font-bold text-text-primary mb-2">Desglose (6 Meses)</h4>
                <div className="overflow-x-auto bg-surface rounded-lg border border-border">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-background">
                            <tr>
                                <th className="px-4 py-2">Mes</th>
                                <th className="px-4 py-2 text-right">Asignadas</th>
                                <th className="px-4 py-2 text-right">Consumidas</th>
                                <th className="px-4 py-2 text-right">Progreso</th>
                            </tr>
                        </thead>
                        <tbody className="font-open-sans">
                            {chartData.map((d, i) => (
                                <tr key={i} className="border-b border-border last:border-b-0">
                                    <td className="px-4 py-2 font-medium text-text-primary">{d.month}</td>
                                    <td className="px-4 py-2 text-right">{formatMinutesToHM(d['Horas Asignadas'])}</td>
                                    <td className="px-4 py-2 text-right">{formatMinutesToHM(d['Horas Consumidas'])}</td>
                                    <td className="px-4 py-2 text-right">{d['Horas Asignadas'] > 0 ? Math.round((d['Horas Consumidas'] / d['Horas Asignadas']) * 100) : 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           </div>
           <div className="min-h-[200px] bg-surface rounded-lg border border-border p-4">
                <h4 className="font-montserrat font-bold text-text-primary mb-2">Evolución de Horas</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value/60)}h`} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '0.5rem' }} formatter={(value: number) => formatMinutesToHM(value)} />
                        <Legend wrapperStyle={{fontSize: "11px"}} iconSize={8} />
                        <Bar dataKey="Horas Consumidas" fill="#3B82F6" barSize={15} />
                        <Line type="monotone" dataKey="Horas Asignadas" stroke="#EF4444" dot={false} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
           </div>
        </div>
    );
};

type ProjectEvolutionData = CalculatedProject & {
    avgCompletion: number;
};

const AnimatedTableRow: React.FC<{ project: ProjectEvolutionData; isExpanded: boolean; onToggle: () => void; }> = ({ project, isExpanded, onToggle }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            gsap.to(contentRef.current, {
                height: isExpanded ? 'auto' : 0,
                duration: 0.5,
                ease: 'power2.inOut',
                onComplete: () => {
                    if(isExpanded && contentRef.current) {
                        contentRef.current.style.height = 'auto';
                    }
                }
            });
        }
    }, [isExpanded]);

    const statusClasses: { [key: string]: string } = {
        'En Curso': 'bg-green-100 text-green-800',
        'En Riesgo': 'bg-yellow-100 text-yellow-800',
        'Retrasado': 'bg-red-100 text-red-800',
        'Completado': 'bg-blue-100 text-blue-800',
        'Pendiente': 'bg-gray-100 text-gray-800'
    };

    return (
        <div>
            <div 
                onClick={onToggle}
                className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-primary-light transition-all duration-200 cursor-pointer"
            >
                <div className="col-span-1 flex justify-center">
                    <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <div className="col-span-3">
                    <p className="font-semibold text-text-primary font-montserrat truncate">{project.name}</p>
                </div>
                <div className="col-span-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${statusClasses[project.status]}`}>{project.status}</span>
                </div>
                <div className="col-span-2 text-center font-open-sans">{project.team.length}</div>
                <div className="col-span-2 text-center font-open-sans">{project.avgCompletion.toFixed(1)}%</div>
                <div className="col-span-2 text-center font-open-sans">{project.progress}%</div>
            </div>
            <div ref={contentRef} className="overflow-hidden" style={{ height: 0 }}>
                <div className="border-t border-border">
                    <ExpandedRowContent project={project} />
                </div>
            </div>
        </div>
    );
};

const ProjectEvolutionTable: React.FC<{ projects: CalculatedProject[] }> = ({ projects }) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (projectId: string) => {
        const newSet = new Set(expandedRows);
        newSet.has(projectId) ? newSet.delete(projectId) : newSet.add(projectId);
        setExpandedRows(newSet);
    };

    const projectData: ProjectEvolutionData[] = useMemo(() => projects.map(p => {
        const totalConsumed = p.historicalData.reduce((sum, item) => sum + item.consumedHours, 0);
        const totalAssigned = p.historicalData.reduce((sum, item) => sum + item.assignedHours, 0);
        const avgCompletion = totalAssigned > 0 ? (totalConsumed / totalAssigned) * 100 : 0;
        return { ...p, avgCompletion };
    }), [projects]);

  return (
    <div className="overflow-x-auto">
      <div className="border border-border rounded-xl shadow-custom-medium bg-surface">
        <div className="grid grid-cols-12 gap-4 px-3 py-3 text-xs text-text-secondary font-montserrat font-semibold uppercase tracking-wider border-b-2 border-border bg-background rounded-t-xl">
            <div className="col-span-1"></div>
            <div className="col-span-3">Proyecto</div>
            <div className="col-span-2">Estado Actual</div>
            <div className="col-span-2 text-center">Equipo</div>
            <div className="col-span-2 text-center">Finalización (6m)</div>
            <div className="col-span-2 text-center">Progreso Actual</div>
        </div>
        <div className="divide-y divide-border">
            {projectData.map(project => (
                <AnimatedTableRow
                    key={project.id}
                    project={project}
                    isExpanded={expandedRows.has(project.id)}
                    onToggle={() => toggleRow(project.id)}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectEvolutionTable;
