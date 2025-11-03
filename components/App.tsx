import React, { useState, useMemo, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { CalculatedEmployee, CalculatedProject, DashboardData, Employee, Project, Task } from './types';
import EmployeeAvailability from './components/EmployeeAvailability';
import { ProjectOverview } from './components/ProjectOverview';
import AlertsDashboard from './components/AlertsDashboard';
import EmployeeDetailModal from './components/EmployeeDetailModal';
import ProjectDetailModal from './components/ProjectDetailModal';
import AddEditEmployeeModal from './components/AddEditEmployeeModal';
import AddEditProjectModal from './components/AddEditProjectModal';
import AddEditTaskModal from './components/AddEditTaskModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import EmployeeEvolution from './components/EmployeeEvolution';
import { TableIcon, UsersIcon, TrendingUpIcon } from './components/Icons';

type View = 'availability' | 'projects' | 'evolution';

function App() {
  const { data: initialData, loading } = useDashboardData();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [view, setView] = useState<View>('availability');
  
  const [selectedEmployee, setSelectedEmployee] = useState<CalculatedEmployee | null>(null);
  const [selectedProject, setSelectedProject] = useState<CalculatedProject | null>(null);

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTaskInfo, setEditingTaskInfo] = useState<{task: Task, projectId: string} | null>(null);

  const [deletingItem, setDeletingItem] = useState<{type: 'employee' | 'project' | 'task', data: any, context?: any} | null>(null);

  const [slackMessage, setSlackMessage] = useState<{ employeeName: string; message: string; } | null>(null);

  useEffect(() => {
    setDashboardData(initialData);
  }, [initialData]);

  const {
    employeesWithoutHours,
    projectsWithoutActivity,
    employeesOverloaded,
    employeesUnderutilized,
  } = useMemo(() => {
    const employees = dashboardData.employees;
    const projects = dashboardData.projects;

    const employeesWithoutHours = employees.filter(e => !e.hasLoggedHoursThisWeek);
    const projectsWithoutActivity = projects.filter(p => !p.hasActivityThisWeek);
    const employeesOverloaded = employees.filter(e => e.hasLoggedHoursThisWeek && e.lastWeekDailyAverage > 8 * 60);
    const employeesUnderutilized = employees.filter(e => e.hasLoggedHoursThisWeek && e.lastWeekDailyAverage < 6 * 60);
    
    return {
      employeesWithoutHours,
      projectsWithoutActivity,
      employeesOverloaded,
      employeesUnderutilized,
    };
  }, [dashboardData]);


  // Handlers for Modals
  const handleSelectEmployee = (employee: CalculatedEmployee) => setSelectedEmployee(employee);
  const handleSelectProject = (project: CalculatedProject) => setSelectedProject(project);
  const handleEditEmployee = (employee: Employee) => setEditingEmployee(employee);
  const handleEditProject = (project: Project) => setEditingProject(project);
  const handleEditTask = (projectId: string, task: Task) => setEditingTaskInfo({task, projectId});
  const handleDeleteEmployee = (employee: Employee) => setDeletingItem({ type: 'employee', data: employee });
  const handleDeleteProject = (project: Project) => setDeletingItem({ type: 'project', data: project });
  const handleDeleteTask = (projectId: string, task: Task) => setDeletingItem({type: 'task', data: task, context: { projectId }});

  const handleCloseModals = () => {
    setSelectedEmployee(null);
    setSelectedProject(null);
    setEditingEmployee(null);
    setEditingProject(null);
    setEditingTaskInfo(null);
    setDeletingItem(null);
    setSlackMessage(null);
  };

  // Data mutation handlers
  const handleSaveEmployee = (updatedEmployee: Employee) => {
    setDashboardData(prev => ({
        ...prev,
        employees: prev.employees.map(e => e.id === updatedEmployee.id ? { ...e, ...updatedEmployee} : e)
    }));
    handleCloseModals();
  };

  const handleSaveProject = (updatedProject: Project) => {
    setDashboardData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === updatedProject.id ? { ...p, ...updatedProject } : p)
    }));
    handleCloseModals();
  };
  
  const handleSaveTask = (projectId: string, updatedTask: Task) => {
    setDashboardData(prev => ({
        ...prev,
        projects: prev.projects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
                }
            }
            return p;
        })
    }));
    handleCloseModals();
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const { type, data, context } = deletingItem;

    if (type === 'employee') {
      setDashboardData(prev => {
        const newEmployees = prev.employees.filter(e => e.id !== data.id);
        const newProjects = prev.projects.map(p => ({ ...p, team: p.team.filter(m => m.id !== data.id)}));
        return { employees: newEmployees, projects: newProjects };
      });
    } else if (type === 'project') {
       setDashboardData(prev => {
        const newProjects = prev.projects.filter(p => p.id !== data.id);
        const newEmployees = prev.employees.map(e => ({...e, projects: e.projects.filter(p => p.projectId !== data.id)}));
        return { employees: newEmployees, projects: newProjects };
      });
    } else if (type === 'task') {
       setDashboardData(prev => ({
            ...prev,
            projects: prev.projects.map(p => {
                if (p.id === context.projectId) {
                    return { ...p, tasks: p.tasks.filter(t => t.id !== data.id) }
                }
                return p;
            })
        }));
    }
    handleCloseModals();
  }

  const handleUpdateProjectHours = (employeeId: string, projectId: string, newAssignedHours: number) => {
    setDashboardData(prev => {
      const newEmployees = prev.employees.map(e => {
        if (e.id === employeeId) {
          const newProjectsForEmp = e.projects.map(p => p.projectId === projectId ? {...p, assignedHours: newAssignedHours} : p);
          const totalAssigned = newProjectsForEmp.reduce((sum, p) => sum + p.assignedHours, 0);
          const balanceHours = e.totalHoursMonth - totalAssigned;
          const occupancyRate = e.totalHoursMonth > 0 ? (totalAssigned / e.totalHoursMonth) * 100 : 0;
          return {
            ...e,
            projects: newProjectsForEmp,
            balanceHours,
            occupancyRate: Math.round(occupancyRate),
          }
        }
        return e;
      });
      return {...prev, employees: newEmployees};
    });
  };

  const handleAssignEmployeeToProject = (projectId: string, employeeId: string, assignedHours: number) => {
    console.log(`Assigning ${employeeId} to ${projectId} for ${assignedHours}h`);
    alert("La asignación de empleados está deshabilitada en esta demostración.");
  }
  
  const handleSendSlackMessage = (employeeName: string) => {
    const employee = dashboardData.employees.find(e => e.name === employeeName);
    if (!employee) return;
    
    const workloadStatus = employee.lastWeekDailyAverage > (8 * 60) ? 'altas' : (employee.lastWeekDailyAverage < (6*60) ? 'bajas' : 'normales');
    const message = `Hola ${employeeName}, he visto que tu media de horas esta semana es de ${(employee.lastWeekDailyAverage / 60).toFixed(1)}h/día, lo cual es un poco ${workloadStatus}. ¿Cómo va todo? ¿Necesitas ayuda con algo?`;
    
    setSlackMessage({ employeeName, message });
  };


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'availability':
        return <EmployeeAvailability employees={dashboardData.employees} onSelectEmployee={handleSelectEmployee} onSendSlackMessage={handleSendSlackMessage} />;
      case 'projects':
        return <ProjectOverview projects={dashboardData.projects} onSelectProject={handleSelectProject} />;
      case 'evolution':
        return <EmployeeEvolution employees={dashboardData.employees} onSelectEmployee={handleSelectEmployee} />;
      default:
        return null;
    }
  };

  const ViewButton = ({ viewName, label, icon: Icon }: { viewName: View, label: string, icon: React.FC<any> }) => (
    <button
      onClick={() => setView(viewName)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-montserrat font-semibold text-sm transition-all duration-200
        ${view === viewName ? 'bg-gradient-primary text-white shadow-custom-medium' : 'bg-surface text-text-primary hover:bg-neutral-100'}`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
  );

  return (
    <div className="bg-background min-h-screen text-text-primary p-4 lg:p-8 font-sans">
      <main className="max-w-[95%] mx-auto space-y-6">
        <h1 className="text-4xl font-montserrat font-extrabold text-text-primary tracking-tight">Dashboard de Recursos</h1>
        
        <AlertsDashboard 
          employeesWithoutHours={employeesWithoutHours}
          projectsWithoutActivity={projectsWithoutActivity}
          employeesOverloaded={employeesOverloaded}
          employeesUnderutilized={employeesUnderutilized}
        />

        <div className="bg-surface border border-border rounded-xl p-6 shadow-custom-medium">
          <div className="flex flex-wrap items-center gap-4 mb-6 border-b border-border pb-6">
            <ViewButton viewName="availability" label="Disponibilidad de Equipo" icon={UsersIcon} />
            <ViewButton viewName="projects" label="Vista de Proyectos" icon={TableIcon} />
            <ViewButton viewName="evolution" label="Evolución del Equipo" icon={TrendingUpIcon} />
          </div>
          {renderView()}
        </div>

      </main>

      {selectedEmployee && <EmployeeDetailModal employee={selectedEmployee} projects={dashboardData.projects} onClose={handleCloseModals} onUpdateProjectHours={handleUpdateProjectHours} onEditEmployee={handleEditEmployee} onDeleteEmployee={handleDeleteEmployee} />}
      {selectedProject && <ProjectDetailModal project={selectedProject} onClose={handleCloseModals} onEditProject={handleEditProject} onAssignEmployeeToProject={handleAssignEmployeeToProject} onEditTask={handleEditTask} onDeleteProject={handleDeleteProject} onDeleteTask={handleDeleteTask} allEmployees={dashboardData.employees} />}
      {editingEmployee && <AddEditEmployeeModal employee={editingEmployee} onClose={handleCloseModals} onSave={handleSaveEmployee} />}
      {editingProject && <AddEditProjectModal project={editingProject} onClose={handleCloseModals} onSave={handleSaveProject} />}
      {editingTaskInfo && <AddEditTaskModal task={editingTaskInfo.task} projectId={editingTaskInfo.projectId} allEmployees={dashboardData.employees} onClose={handleCloseModals} onSave={handleSaveTask} />}
      {deletingItem && <ConfirmDeleteModal onClose={handleCloseModals} onConfirm={handleConfirmDelete} title={`Confirmar eliminación de ${deletingItem.type}`} message={`¿Estás seguro de que quieres eliminar este ${deletingItem.type}? Esta acción no se puede deshacer.`} />}
      {slackMessage && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={handleCloseModals}>
            <div className="bg-surface border border-border rounded-3xl shadow-custom-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="font-montserrat font-bold text-lg">Sugerencia de mensaje para {slackMessage.employeeName}</h3>
                <p className="bg-background p-4 rounded-lg my-4 whitespace-pre-wrap text-sm font-open-sans">{slackMessage.message}</p>
                <button onClick={handleCloseModals} className="w-full px-5 py-2 rounded-lg bg-gradient-primary text-white shadow-custom-medium hover:bg-gradient-primary-hover transition-all duration-300 font-montserrat font-semibold">Cerrar</button>
            </div>
        </div>
      )}

    </div>
  );
}

export default App;