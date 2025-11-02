import React, { useState } from 'react';
import { CalculatedProject, ProjectType } from '../types';
import ProjectDetailModal from './ProjectDetailModal';
import { SortAscIcon, SortDescIcon, SortIcon } from './Icons';

type SortColumn = 'name' | 'teamSize' | 'totalConsumedHours' | 'progress' | null;
type SortDirection = 'asc' | 'desc' | null;

const ProjectRow: React.FC<{ project: CalculatedProject, onSelect: () => void }> = ({ project, onSelect }) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-3 border-b border-border last:border-b-0 hover:bg-background transition-colors cursor-pointer" onClick={onSelect}>
      <div className="col-span-4 flex flex-col">
        <p className="font-semibold text-text-primary truncate">{project.name}</p>
        <span className={`mt-1 text-xs px-2 py-0.5 rounded-full self-start ${project.type === ProjectType.RECURRING ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'}`}>
          {project.type === ProjectType.RECURRING ? 'Recurrente' : 'Puntual'}
        </span>
      </div>
      <div className="col-span-2 text-center">
        <p className="font-mono text-sm text-text-primary">{project.team.length} Miembros</p>
      </div>
      <div className="col-span-2 text-center">
        <p className="font-mono text-sm text-text-secondary">{project.totalConsumedHours}h / {project.totalAssignedHours}h</p>
      </div>
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
        </div>
        <span className="font-mono text-sm w-10 text-right text-text-primary">{project.progress}%</span>
      </div>
    </div>
  );
};

const ProjectOverview: React.FC<{ projects: CalculatedProject[] }> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<CalculatedProject | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null); // Reset sort
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
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
    if (!sortColumn || !sortDirection) {
      return projects;
    }

    return [...projects].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortColumn) {
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'teamSize':
          valA = a.team.length;
          valB = b.team.length;
          break;
        case 'totalConsumedHours':
          valA = a.totalConsumedHours;
          valB = b.totalConsumedHours;
          break;
        case 'progress':
          valA = a.progress;
          valB = b.progress;
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - a;
      }
      return 0;
    });
  }, [projects, sortColumn, sortDirection]);
  
  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs text-text-secondary font-semibold uppercase tracking-wider border-b border-border">
          <button 
            className="col-span-4 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('name')}
          >
            Proyecto {getSortIcon('name')}
          </button>
          <button 
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('teamSize')}
          >
            Equipo {getSortIcon('teamSize')}
          </button>
          <button 
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('totalConsumedHours')}
          >
            Horas Consumidas {getSortIcon('totalConsumedHours')}
          </button>
          <button 
            className="col-span-4 text-right pr-14 flex items-center justify-end gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('progress')}
          >
            Progreso {getSortIcon('progress')}
          </button>
        </div>
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          {sortedProjects.map(project => (
            <ProjectRow key={project.id} project={project} onSelect={() => setSelectedProject(project)} />
          ))}
        </div>
      </div>
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </>
  );
};

export default ProjectOverview;