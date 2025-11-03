import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CalculatedProject, ProjectType, ProjectStatus } from '../types';
import { ChevronDownIcon } from './Icons';
import { gsap } from 'gsap';

interface ProjectOverviewProps {
  projects: CalculatedProject[];
  onSelectProject: (project: CalculatedProject) => void;
}

interface ProjectRowProps {
    project: CalculatedProject;
    onSelect: (project: CalculatedProject) => void;
}

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

const getStatusClasses = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.ON_TRACK: return { dot: 'bg-green-500', tag: 'bg-green-100 text-green-800' };
        case ProjectStatus.AT_RISK: return { dot: 'bg-yellow-500', tag: 'bg-yellow-100 text-yellow-800' };
        case ProjectStatus.OFF_TRACK: return { dot: 'bg-red-500', tag: 'bg-red-100 text-red-800' };
        case ProjectStatus.COMPLETED: return { dot: 'bg-blue-500', tag: 'bg-blue-100 text-blue-800' };
        default: return { dot: 'bg-gray-400', tag: 'bg-gray-100 text-gray-800' };
    }
}

const ProjectListHeader = () => (
    <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs text-text-secondary font-montserrat font-semibold uppercase tracking-wider border-b-2 border-border mb-2">
        <div className="col-span-3">Proyecto</div>
        <div className="col-span-2">Manager</div>
        <div className="col-span-2">Vencimiento</div>
        <div className="col-span-1 text-center">Miembros</div>
        <div className="col-span-2 text-center">Horas</div>
        <div className="col-span-2 text-center">Progreso</div>
    </div>
);


const ProjectRow: React.FC<ProjectRowProps> = ({ project, onSelect }) => {
  const projectManager = project.team.find(member => member.role === 'Project Manager')?.name || 'N/A';
  const formattedDeadline = new Date(project.deadline).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const statusStyle = getStatusClasses(project.status);

  return (
    <div 
      className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border bg-background border-border last:border-b-0 hover:bg-primary-light/50 transition-colors duration-200 shadow-sm cursor-pointer"
      onClick={() => onSelect(project)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${project.name}`}
    >
      {/* Project Name & Status */}
      <div className="col-span-3 flex flex-col">
        <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusStyle.dot}`} title={`Estado: ${project.status}`}></div>
            <p className="font-montserrat font-semibold text-text-primary text-base truncate">{project.name}</p>
        </div>
        <div className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full self-start ${statusStyle.tag}`}>
            {project.status}
        </div>
      </div>
      
      {/* Manager */}
      <div className="col-span-2">
        <p className="font-open-sans text-sm text-text-primary truncate">{projectManager}</p>
      </div>

      {/* Deadline */}
      <div className="col-span-2">
        <p className="font-open-sans text-sm text-text-primary">{formattedDeadline}</p>
      </div>

      {/* Team Members */}
      <div className="col-span-1 text-center">
        <p className="font-montserrat text-sm text-text-primary font-semibold">{project.team.length}</p>
      </div>

      {/* Hours */}
      <div className="col-span-2 text-center">
        <p className="font-open-sans text-sm text-text-primary">{formatMinutesToHM(project.totalConsumedHours)} / {formatMinutesToHM(project.totalAssignedHours)}</p>
      </div>

      {/* Progress */}
      <div className="col-span-2 flex items-center gap-2">
        <div className="w-full bg-neutral-200 rounded-full h-1.5 shadow-inner">
          <div className={`bg-primary h-1.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
        </div>
        <span className="font-open-sans text-xs w-8 text-right text-text-primary">{project.progress}%</span>
      </div>
    </div>
  );
};


interface ProjectCategoryPanelProps {
    title: string;
    projects: CalculatedProject[];
    count: number;
    isOpen: boolean;
    onToggle: () => void;
    onSelectProject: (project: CalculatedProject) => void;
}

const ProjectCategoryPanel: React.FC<ProjectCategoryPanelProps> = ({ title, projects, count, isOpen, onToggle, onSelectProject }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            gsap.to(contentRef.current, {
                height: isOpen ? 'auto' : 0,
                duration: 0.4,
                ease: 'power2.inOut',
            });
        }
    }, [isOpen]);

    return (
        <div className="bg-surface border border-border rounded-xl shadow-custom-light overflow-hidden transition-shadow hover:shadow-custom-medium">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-left hover:bg-background/50 transition-colors"
                aria-expanded={isOpen}
                aria-controls={`panel-${title.replace(/\s+/g, '-')}`}
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-montserrat font-bold text-lg text-text-primary">{title}</h3>
                    <span className="bg-primary-light text-primary font-semibold text-xs px-2.5 py-1 rounded-full">{count}</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div id={`panel-${title.replace(/\s+/g, '-')}`} ref={contentRef} className="overflow-hidden" style={{ height: 0 }}>
                <div className="p-4 pt-0">
                    <div className="border-t border-border pt-4">
                        <ProjectListHeader />
                        <div className="space-y-2 mt-2">
                            {projects.length > 0 ? projects.map(project => (
                                <ProjectRow key={project.id} project={project} onSelect={onSelectProject} />
                            )) : (
                                <p className="text-text-secondary text-center py-4">No hay proyectos que coincidan con la búsqueda.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projects, onSelectProject }) => {
  const [openPanel, setOpenPanel] = useState<'recurring' | 'one-time' | null>('recurring');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects;
    return projects.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [projects, searchTerm]);

  const recurringProjects = filteredProjects.filter(p => p.type === ProjectType.RECURRING);
  const oneTimeProjects = filteredProjects.filter(p => p.type === ProjectType.ONE_TIME);

  const togglePanel = (panel: 'recurring' | 'one-time') => {
      setOpenPanel(prev => (prev === panel ? null : panel));
  };

  return (
    <div className="space-y-4">
        <div className="mb-4">
            <input
                type="text"
                placeholder="Buscar proyecto por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface shadow-custom-light font-open-sans text-sm"
                aria-label="Buscar proyectos"
            />
        </div>
        <ProjectCategoryPanel
            title="Proyectos Recurrentes"
            projects={recurringProjects}
            count={recurringProjects.length}
            isOpen={openPanel === 'recurring'}
            onToggle={() => togglePanel('recurring')}
            onSelectProject={onSelectProject}
        />
        <ProjectCategoryPanel
            title="Proyectos Puntuales"
            projects={oneTimeProjects}
            count={oneTimeProjects.length}
            isOpen={openPanel === 'one-time'}
            onToggle={() => togglePanel('one-time')}
            onSelectProject={onSelectProject}
        />
    </div>
  );
};