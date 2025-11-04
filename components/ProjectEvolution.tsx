import React, { useMemo, useState } from 'react';
import { CalculatedProject, CalculatedEmployee } from '../types';
import { KPICard } from './KPICard';
import ProjectEvolutionCard from './ProjectEvolutionCard';
import ProjectEvolutionTable from './ProjectEvolutionTable';
import { ChartBarIcon, TableIcon } from './Icons';

interface ProjectEvolutionProps {
  projects: CalculatedProject[];
  employees: CalculatedEmployee[];
  onSelectProject: (project: CalculatedProject) => void;
}

const ProjectEvolution: React.FC<ProjectEvolutionProps> = ({ projects, employees, onSelectProject }) => {
    const [view, setView] = useState<'charts' | 'table'>('charts');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = useMemo(() => {
        return projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const { avgCompletionRate, onTrackPercentage, bestTracker } = useMemo(() => {
        if (projects.length === 0) {
            return { avgCompletionRate: 0, onTrackPercentage: 0, bestTracker: null };
        }

        const totalCompletion = projects.reduce((acc, p) => acc + p.progress, 0);
        const onTrackCount = projects.filter(p => p.status === 'En Curso').length;

        let bestEmployee: { name: string; score: number } | null = null;
        employees.forEach(emp => {
            const totalAssigned = emp.projects.reduce((sum, p) => sum + p.assignedHours, 0);
            const totalConsumed = emp.projects.reduce((sum, p) => sum + p.consumedHours, 0);
            if (totalAssigned > 0) {
                const completionRate = (totalConsumed / totalAssigned) * 100;
                // Una puntuación más baja es mejor (más cerca del 100%)
                const score = Math.abs(100 - completionRate); 
                if (!bestEmployee || score < bestEmployee.score) {
                    bestEmployee = { name: emp.name, score: score };
                }
            }
        });

        return {
            avgCompletionRate: totalCompletion / projects.length,
            onTrackPercentage: (onTrackCount / projects.length) * 100,
            bestTracker: bestEmployee?.name,
        };
    }, [projects, employees]);


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Finalización Promedio" value={`${avgCompletionRate.toFixed(1)}%`} />
                <KPICard title="Proyectos en Curso" value={`${onTrackPercentage.toFixed(1)}%`} />
                <KPICard title="Mejor Tracker de Horas" value={bestTracker || 'N/A'} />
            </div>

            <div>
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h3 className="text-xl font-montserrat font-bold text-text-primary">
                      Detalle de Evolución por Proyecto
                    </h3>
                    <div className="flex items-center gap-2">
                         <input
                            type="text"
                            placeholder="Buscar proyecto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface shadow-custom-light font-open-sans text-sm"
                        />
                        <button 
                            onClick={() => setView('charts')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${view === 'charts' ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-neutral-100 text-text-secondary'}`}
                            aria-label="Vista de Gráficos"
                        >
                            <ChartBarIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setView('table')}
                            className={`p-2 rounded-lg transition-colors duration-200 ${view === 'table' ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-neutral-100 text-text-secondary'}`}
                            aria-label="Vista de Tabla"
                        >
                            <TableIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {view === 'charts' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredProjects.map(project => (
                            <ProjectEvolutionCard key={project.id} project={project} onClick={() => onSelectProject(project)} />
                        ))}
                    </div>
                ) : (
                    <ProjectEvolutionTable projects={filteredProjects} />
                )}
            </div>
        </div>
    );
};

export default ProjectEvolution;
