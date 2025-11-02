import React, { useState } from 'react';
import { CalculatedProject, ProjectType } from '../types';
import ProjectDetailModal from './ProjectDetailModal';

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
  
  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs text-text-secondary font-semibold uppercase tracking-wider border-b border-border">
          <div className="col-span-4">Proyecto</div>
          <div className="col-span-2 text-center">Equipo</div>
          <div className="col-span-2 text-center">Horas Consumidas</div>
          <div className="col-span-4 text-right pr-14">Progreso</div>
        </div>
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
          {projects.map(project => (
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