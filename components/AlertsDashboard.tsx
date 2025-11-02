import React from 'react';
import { CalculatedEmployee, CalculatedProject, ProjectType } from '../types';
import { UsersIcon, BriefcaseIcon, AlertTriangleIcon, ClockIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';

interface AlertsDashboardProps {
    employeesWithoutHours: CalculatedEmployee[];
    projectsWithoutActivity: CalculatedProject[];
    employeesOverloaded: CalculatedEmployee[];
    employeesUnderutilized: CalculatedEmployee[];
}

const EmployeeAlertCard: React.FC<{ employee: CalculatedEmployee }> = ({ employee }) => (
    <div className="bg-surface p-3 rounded-lg border border-border flex items-center">
        <p className="font-semibold text-sm text-text-primary">{employee.name}</p>
    </div>
);

const ProjectAlertCard: React.FC<{ project: CalculatedProject }> = ({ project }) => (
    <div className="bg-surface p-3 rounded-lg border border-border">
        <p className="font-semibold text-sm text-text-primary truncate">{project.name}</p>
        <span className={`mt-2 text-xs px-2 py-0.5 rounded-full self-start inline-block ${project.type === ProjectType.RECURRING ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'}`}>
            {project.type}
        </span>
    </div>
);

const WorkloadAlertCard: React.FC<{ employee: CalculatedEmployee; type: 'over' | 'under' }> = ({ employee, type }) => {
    const isOver = type === 'over';
    return (
        <div className="bg-surface p-3 rounded-lg border border-border flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isOver ? 'bg-red-100' : 'bg-yellow-100'}`}>
                {isOver ? <TrendingUpIcon className="w-5 h-5 text-red-600" /> : <TrendingDownIcon className="w-5 h-5 text-yellow-600" />}
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-text-primary text-sm">{employee.name}</p>
            </div>
            <div className="text-right">
                <p className={`font-mono font-bold text-base ${isOver ? 'text-red-500' : 'text-yellow-500'}`}>{employee.lastWeekDailyAverage.toFixed(1)}h</p>
                <p className="text-xs text-text-secondary">prom./día</p>
            </div>
        </div>
    );
};


const AlertsDashboard: React.FC<AlertsDashboardProps> = ({ 
    employeesWithoutHours, 
    projectsWithoutActivity,
    employeesOverloaded,
    employeesUnderutilized
}) => {
    const inactivityAlerts = [
        ...(employeesWithoutHours.length > 0 ? [{
            title: 'Empleados sin Horas',
            icon: UsersIcon,
            items: employeesWithoutHours,
            render: (item: any) => <EmployeeAlertCard key={item.id} employee={item} />
        }] : []),
        ...(projectsWithoutActivity.length > 0 ? [{
            title: 'Proyectos sin Actividad',
            icon: BriefcaseIcon,
            items: projectsWithoutActivity,
            render: (item: any) => <ProjectAlertCard key={item.id} project={item} />
        }] : [])
    ];
    
    const workloadAlerts = [
        ...(employeesOverloaded.length > 0 ? [{
            title: 'Posible Sobrecarga (>8h/día)',
            icon: TrendingUpIcon,
            items: employeesOverloaded,
            render: (item: any) => <WorkloadAlertCard key={item.id} employee={item} type="over"/>
        }] : []),
        ...(employeesUnderutilized.length > 0 ? [{
            title: 'Posible Baja Actividad (<6h/día)',
            icon: TrendingDownIcon,
            items: employeesUnderutilized,
            render: (item: any) => <WorkloadAlertCard key={item.id} employee={item} type="under"/>
        }] : [])
    ];
    
    return (
        <div className="bg-red-50/50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {inactivityAlerts.map(({ title, icon: Icon, items, render }) => (
                    <div key={title} className="bg-surface/50 rounded-lg p-4">
                        <h3 className="font-bold text-text-primary flex items-center gap-2 mb-3">
                            <Icon className="w-5 h-5 text-text-secondary" />
                            {title}
                        </h3>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                            {items.map(render)}
                        </div>
                    </div>
                ))}
                {workloadAlerts.map(({ title, icon: Icon, items, render }) => (
                     <div key={title} className="bg-surface/50 rounded-lg p-4">
                        <h3 className="font-bold text-text-primary flex items-center gap-2 mb-3">
                           <Icon className="w-5 h-5 text-text-secondary" />
                           <span className="text-sm">{title}</span>
                        </h3>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                            {items.map(render)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsDashboard;