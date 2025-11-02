import React, { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import EmployeeAvailability from './components/EmployeeAvailability';
import ProjectOverview from './components/ProjectOverview';
import AlertsDashboard from './components/AlertsDashboard';
import { BriefcaseIcon, UsersIcon, SearchIcon } from './components/Icons';
import { DashboardData, ProjectType, CalculatedEmployee, CalculatedProject } from './types';

const App: React.FC = () => {
  const { data: initialData, loading } = useDashboardData();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'employees' | 'projects'>('employees');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  
  useEffect(() => {
    if(initialData) {
        setDashboardData(initialData);
    }
  }, [initialData]);

  const handleUpdateEmployeeProjectHours = (employeeId: string, projectId: string, newAssignedHours: number) => {
    setDashboardData(prevData => {
      if (!prevData) return null;

      const employeeMap: Map<string, CalculatedEmployee> = new Map(prevData.employees.map(e => [e.id, JSON.parse(JSON.stringify(e))]));
      const projectMap: Map<string, CalculatedProject> = new Map(prevData.projects.map(p => [p.id, JSON.parse(JSON.stringify(p))]));

      const employeeToUpdate = employeeMap.get(employeeId);
      if (!employeeToUpdate) return prevData;

      const projectAssignment = employeeToUpdate.projects.find(p => p.projectId === projectId);
      if (!projectAssignment) return prevData;
      
      projectAssignment.assignedHours = newAssignedHours;
      
      const recurringHours = employeeToUpdate.projects
        .filter(p => projectMap.get(p.projectId)?.type === ProjectType.RECURRING)
        .reduce((sum, p) => sum + p.assignedHours, 0);
      const oneTimeHours = employeeToUpdate.projects
        .filter(p => projectMap.get(p.projectId)?.type === ProjectType.ONE_TIME)
        .reduce((sum, p) => sum + p.assignedHours, 0);
      
      const totalAssigned = recurringHours + oneTimeHours;
      employeeToUpdate.recurringHours = recurringHours;
      employeeToUpdate.oneTimeHours = oneTimeHours;
      employeeToUpdate.balanceHours = employeeToUpdate.totalHoursMonth - totalAssigned;
      employeeToUpdate.occupancyRate = employeeToUpdate.totalHoursMonth > 0 ? Math.min(100, Math.round((totalAssigned / employeeToUpdate.totalHoursMonth) * 100)) : 0;

      const updatedEmployees = Array.from(employeeMap.values());

      const updatedProjects = Array.from(projectMap.values()).map(proj => {
        const team = updatedEmployees.filter(emp => emp.projects.some(p => p.projectId === proj.id));
        const totalAssignedHours = team.reduce((sum, emp) => {
          const projectHours = emp.projects.find(p => p.projectId === proj.id)?.assignedHours || 0;
          return sum + projectHours;
        }, 0);
        
        const totalConsumedHours = team.reduce((sum, emp) => {
          const projectHours = emp.projects.find(p => p.projectId === proj.id)?.consumedHours || 0;
          return sum + projectHours;
        }, 0);
        
        const progress = totalAssignedHours > 0 ? (totalConsumedHours / totalAssignedHours) * 100 : 0;
        
        return {
            ...proj,
            team,
            totalAssignedHours,
            totalConsumedHours,
            progress: Math.min(100, Math.round(progress)),
        };
      });

      return { employees: updatedEmployees, projects: updatedProjects };
    });
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-text-secondary">Cargando Dashboard...</p>
      </div>
    );
  }

  const OVERLOAD_THRESHOLD = 8;
  const UNDERUTILIZED_THRESHOLD = 6;

  const employeesWithoutHours = dashboardData.employees.filter(e => !e.hasLoggedHoursThisWeek);
  const projectsWithoutActivity = dashboardData.projects.filter(p => !p.hasActivityThisWeek);
  const employeesOverloaded = dashboardData.employees.filter(e => e.lastWeekDailyAverage > OVERLOAD_THRESHOLD);
  const employeesUnderutilized = dashboardData.employees.filter(e => e.hasLoggedHoursThisWeek && e.lastWeekDailyAverage < UNDERUTILIZED_THRESHOLD);

  const hasAlerts = employeesWithoutHours.length > 0 || projectsWithoutActivity.length > 0 || employeesOverloaded.length > 0 || employeesUnderutilized.length > 0;

  const filteredEmployees = dashboardData.employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const filteredProjects = dashboardData.projects.filter(project =>
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Dashboard de Equipo</h1>
          <p className="text-text-secondary mt-1">Monitorea la carga de trabajo, el progreso de los proyectos y las alertas.</p>
        </header>

        {hasAlerts && (
          <div className="mb-8">
            <AlertsDashboard
              employeesWithoutHours={employeesWithoutHours}
              projectsWithoutActivity={projectsWithoutActivity}
              employeesOverloaded={employeesOverloaded}
              employeesUnderutilized={employeesUnderutilized}
            />
          </div>
        )}

        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none ${activeTab === 'employees' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <UsersIcon className="w-5 h-5" />
            Empleados
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none ${activeTab === 'projects' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <BriefcaseIcon className="w-5 h-5" />
            Proyectos
          </button>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            {activeTab === 'employees' && (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-text-secondary" />
                </span>
                <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="w-full max-w-xs pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            )}
            {activeTab === 'projects' && (
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="w-5 h-5 text-text-secondary" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar proyecto..."
                        value={projectSearchTerm}
                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                        className="w-full max-w-xs pl-10 pr-4 py-2 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                </div>
            )}
          </div>
          <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border shadow-sm">
              {activeTab === 'employees' && (
                <EmployeeAvailability 
                    employees={filteredEmployees} 
                    projects={dashboardData.projects}
                    onUpdateEmployeeProjectHours={handleUpdateEmployeeProjectHours}
                />
              )}
              {activeTab === 'projects' && (
                <ProjectOverview projects={filteredProjects} />
              )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;