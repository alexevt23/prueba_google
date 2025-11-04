import React, { useMemo } from 'react';
import { CalculatedProject } from '../types';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProjectEvolutionCardProps {
    project: CalculatedProject;
    onClick: () => void;
}

const ProjectEvolutionCard: React.FC<ProjectEvolutionCardProps> = ({ project, onClick }) => {

    const chartData = useMemo(() => {
        return project.historicalData.map(d => ({
            month: d.month,
            'Horas Consumidas': d.consumedHours,
            'Horas Asignadas': d.assignedHours,
        }));
    }, [project.historicalData]);
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'En Curso': return 'text-green-600';
            case 'En Riesgo': return 'text-yellow-600';
            case 'Retrasado': return 'text-red-600';
            case 'Completado': return 'text-blue-600';
            default: return 'text-text-secondary';
        }
    };

    return (
        <div 
            className="bg-surface border border-border rounded-xl p-4 shadow-custom-light hover:shadow-custom-medium hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col"
            onClick={onClick}
        >
            <div className="mb-4">
                <h4 className="font-montserrat font-bold text-text-primary text-lg truncate">{project.name}</h4>
                 <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Estado Actual:</span>
                        <span className={`font-bold font-montserrat ${getStatusColor(project.status)}`}>{project.status}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Progreso Actual:</span>
                        <span className="font-bold font-montserrat text-text-primary">{project.progress}%</span>
                    </div>
                </div>
            </div>

            <div className="w-full flex-grow" style={{ height: '180px' }}>
                 <h5 className="font-montserrat font-semibold text-xs text-text-secondary text-center mb-1">Evolución de Horas</h5>
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 5 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 60)}h`} />
                        <Tooltip
                            cursor={{ fill: 'rgba(229, 229, 229, 0.2)' }}
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #E5E5E5',
                                borderRadius: '0.75rem',
                                fontFamily: "'Open Sans', sans-serif"
                            }}
                            formatter={(value: number) => [`${Math.floor(value / 60)}h ${value % 60}m`, '']}
                        />
                        <Legend wrapperStyle={{fontSize: "11px", fontFamily: "'Montserrat', sans-serif"}} iconSize={8}/>
                        <Bar dataKey="Horas Consumidas" fill="#3B82F6" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="Horas Asignadas" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                 </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProjectEvolutionCard;
