import React from 'react';
import { CalculatedEmployee, CalculatedProject, ProjectType } from '../types';
import { UsersIcon, BriefcaseIcon, TrendingUpIcon, TrendingDownIcon } from './Icons';

interface AlertsDashboardProps {
    employeesWithoutHours: CalculatedEmployee[];
    projectsWithoutActivity: CalculatedProject[];
    employeesOverloaded: CalculatedEmployee[];
    employeesUnderutilized: CalculatedEmployee[];
}

const EmployeeAlertCard: React.FC<{ employee: CalculatedEmployee }> = ({ employee }) => (
    <div className="bg-surface p-3 rounded-lg border border-border flex items-center shadow-custom-light hover:shadow-custom-medium transition-shadow duration-200">
        <p className="font-montserrat font-semibold text-sm text-text-primary">{employee.name}</p>
    </div>
);

const ProjectAlertCard: React.FC<{ project: CalculatedProject }> = ({ project }) => (
    <div className="bg-surface p-3 rounded-lg border border-border shadow-custom-light hover:shadow-custom-medium transition-shadow duration-200">
        <p className="font-montserrat font-semibold text-sm text-text-primary truncate">{project.name}</p>
        <span className={`mt-2 text-xs px-2 py-0.5 rounded-full shadow-sm self-start inline-block font-open-sans ${project.type === ProjectType.RECURRING ? 'bg-blue-50 text-blue-800' : 'bg-indigo-50 text-indigo-800'}`}> {/* Updated color classes */}
            {project.type}
        </span>
    </div>
);

const WorkloadAlertCard: React.FC<{ employee: CalculatedEmployee; type: 'over' | 'under' }> = ({ employee, type }) => {
    const isOver = type === 'over';
    return (
        <div className="bg-surface p-3 rounded-lg border border-border flex items-center gap-3 shadow-custom-light hover:shadow-custom-medium transition-shadow duration-200">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isOver ? 'bg-red-100' : 'bg-yellow-100'}`}>
                {isOver ? <TrendingUpIcon className="w-5 h-5 text-red-600" /> : <TrendingDownIcon className="w-5 h-5 text-yellow-600" />}
            </div>
            <div className="flex-grow">
                <p className="font-montserrat font-semibold text-text-primary text-sm">{employee.name}</p>
            </div>
            <div className="text-right">
                <p className={`font-open-sans font-bold text-base font-montserrat ${isOver ? 'text-red-500' : 'text-yellow-500'}`}>{employee.lastWeekDailyAverage.toFixed(1)}h</p> {/* font-mono removed */}
                <p className="text-xs text-text-secondary font-open-sans">prom./día</p>
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
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-xl shadow-custom-medium"> {/* Updated bg and border */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {inactivityAlerts.map(({ title, icon: Icon, items, render }) => (
                    <div key={title} className="bg-surface rounded-xl p-4 border border-border"> {/* Updated bg */}
                        <h3 className="font-montserrat font-bold text-text-primary flex items-center gap-3 mb-4">
                            <Icon className="w-6 h-6 text-text-secondary" />
                            {title}
                        </h3>
                        <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                            {items.map(render)}
                        </div>
                    </div>
                ))}
                {workloadAlerts.map(({ title, icon: Icon, items, render }) => (
                     <div key={title} className="bg-surface rounded-xl p-4 border border-border"> {/* Updated bg */}
                        <h3 className="font-montserrat font-bold text-text-primary flex items-center gap-3 mb-4">
                           <Icon className="w-6 h-6 text-text-secondary" />
                           <span className="text-base">{title}</span>
                        </h3>
                        <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                            {items.map(render)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsDashboard;