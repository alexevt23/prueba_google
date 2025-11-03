import React, { useState } from 'react';
import { CalculatedProject, ProjectType } from '../types';
import { SortAscIcon, SortDescIcon, SortIcon, EyeIcon } from './Icons'; 

type SortColumn = 'name' | 'teamSize' | 'totalConsumedHours' | 'progress' | null;
type SortDirection = 'asc' | 'desc' | null;

interface ProjectOverviewProps {
  projects: CalculatedProject[];
  onSelectProject: (project: CalculatedProject) => void;
}

const ProjectRow: React.FC<{ project: CalculatedProject, onSelect: (project: CalculatedProject) => void }> = ({ project, onSelect }) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-border last:border-b-0 hover:bg-primary-light transition-colors duration-200 shadow-custom-light mb-2">
      <div className="col-span-3 flex flex-col items-start">
        <p className="font-montserrat font-semibold text-text-primary text-base">{project.name}</p>
        <span className={`mt-1 text-xs px-2 py-0.5 rounded-full self-start inline-block shadow-sm font-open-sans ${project.type === ProjectType.RECURRING ? 'bg-blue-50 text-blue-800' : 'bg-indigo-50 text-indigo-800'}`}>
            {project.type}
        </span>
      </div>
      <div className="col-span-2 text-center">
        <p className="font-montserrat text-sm text-text-primary font-semibold">{project.team.length} {project.team.length === 1 ? 'miembro' : 'miembros'}</p>
      </div>
      <div className="col-span-2 text-center">
        <p className="font-open-sans text-sm text-text-primary">{project.totalConsumedHours}h / {project.totalAssignedHours}h</p>
        <p className="text-xs text-text-secondary font-open-sans">Cons. / Asig.</p>
      </div>
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner">
          <div className={`bg-primary h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
        </div>
        <span className="font-open-sans text-sm w-12 text-right text-text-primary">{project.progress}%</span>
      </div>
      <div className="col-span-3 flex justify-end">
        <button onClick={() => onSelect(project)} className="p-2 rounded-full hover:bg-neutral-200 transition-colors" aria-label={`Ver detalles de ${project.name}`}>
          <EyeIcon className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};


export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projects, onSelectProject }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') return <SortAscIcon className="w-4 h-4 text-primary" />;
      if (sortDirection === 'desc') return <SortDescIcon className="w-4 h-4 text-primary" />;
    }
    return <SortIcon className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const sortedProjects = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return projects;

    return [...projects].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortColumn) {
        case 'name': valA = a.name; valB = b.name; break;
        case 'teamSize': valA = a.team.length; valB = b.team.length; break;
        case 'totalConsumedHours': valA = a.totalConsumedHours; valB = b.totalConsumedHours; break;
        case 'progress': valA = a.progress; valB = b.progress; break;
        default: return 0;
      }
      if (typeof valA === 'string') return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      if (typeof valA === 'number') return sortDirection === 'asc' ? valA - valB : valB - valA;
      return 0;
    });
  }, [projects, sortColumn, sortDirection]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-3 py-3 text-xs text-text-secondary font-montserrat font-semibold uppercase tracking-wider border-b-2 border-border mb-4">
        <button className="col-span-3 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('name')}>Proyecto {getSortIcon('name')}</button>
        <button className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('teamSize')}>Equipo {getSortIcon('teamSize')}</button>
        <button className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('totalConsumedHours')}>Horas Consumidas {getSortIcon('totalConsumedHours')}</button>
        <button className="col-span-2 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('progress')}>Progreso {getSortIcon('progress')}</button>
        <div className="col-span-3"></div>
      </div>
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {sortedProjects.map(project => (
          <ProjectRow key={project.id} project={project} onSelect={onSelectProject} />
        ))}
      </div>
    </div>
  );
};
