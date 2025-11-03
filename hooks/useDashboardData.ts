import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Keep for mock data generation if needed
import { 
    Employee, Project, ProjectType, DashboardData, CalculatedEmployee, 
    CalculatedProject, ProjectStatus, TaskStatus, Task, HistoricalData 
} from '../types';

const getPastSixMonths = (): string[] => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const today = new Date();
    const pastSixMonths: string[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        pastSixMonths.push(months[d.getMonth()]);
    }
    return pastSixMonths;
};

const generateEmployeeHistoricalData = (): HistoricalData[] => {
    const months = getPastSixMonths();
    return months.map(month => {
        const assignedHours = Math.floor(Math.random() * 20) + 140; // 140-160
        const consumedHours = Math.floor(assignedHours * (Math.random() * 0.3 + 0.8)); // 80-110% of assigned
        return { month, assignedHours, consumedHours };
    });
};

const generateLastWeekHours = (pattern: 'none' | 'normal' | 'over' | 'under'): number[] => {
    switch(pattern) {
        case 'none': return [0, 0, 0, 0, 0];
        case 'under': return [Math.floor(Math.random()*2)+3, Math.floor(Math.random()*3)+3, Math.floor(Math.random()*3)+4, Math.floor(Math.random()*2)+4, Math.floor(Math.random()*2)+3]; // 3-6 hours
        case 'over': return [Math.floor(Math.random()*2)+8, Math.floor(Math.random()*2)+9, 8, Math.floor(Math.random()*3)+8, Math.floor(Math.random()*2)+9]; // 8-11 hours
        default: return [8, 7, 8, 9, 8]; // normal-ish
    }
}

const rawEmployees = [
  { id: 'e1', name: 'Ana García', avatar: 'https://i.pravatar.cc/150?u=e1', role: 'Frontend Dev', totalHoursMonth: 160, projects: [
    { projectId: 'p1', assignedHours: 40, consumedHours: 35 }, { projectId: 'p2', assignedHours: 80, consumedHours: 70 },
    { projectId: 'p12', assignedHours: 30, consumedHours: 15 }, { projectId: 'p22', assignedHours: 20, consumedHours: 25 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e2', name: 'Carlos Rodríguez', avatar: 'https://i.pravatar.cc/150?u=e2', role: 'Backend Dev', totalHoursMonth: 160, projects: [
    { projectId: 'p1', assignedHours: 40, consumedHours: 40 }, { projectId: 'p3', assignedHours: 90, consumedHours: 85 },
    { projectId: 'p15', assignedHours: 35, consumedHours: 40 },
  ], lastWeekHours: generateLastWeekHours('over')},
  { id: 'e3', name: 'Javier López', avatar: 'https://i.pravatar.cc/150?u=e3', role: 'UI/UX Designer', totalHoursMonth: 160, projects: [
    { projectId: 'p1', assignedHours: 20, consumedHours: 15 }, { projectId: 'p2', assignedHours: 60, consumedHours: 20 },
    { projectId: 'p18', assignedHours: 50, consumedHours: 30 }, { projectId: 'p28', assignedHours: 25, consumedHours: 10 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e4', name: 'Sofía Martínez', avatar: 'https://i.pravatar.cc/150?u=e4', role: 'Project Manager', totalHoursMonth: 160, projects: [
    { projectId: 'p1', assignedHours: 10, consumedHours: 8 }, { projectId: 'p2', assignedHours: 10, consumedHours: 9 },
    { projectId: 'p3', assignedHours: 10, consumedHours: 10 }, { projectId: 'p4', assignedHours: 10, consumedHours: 5 },
    { projectId: 'p11', assignedHours: 15, consumedHours: 15 }, { projectId: 'p21', assignedHours: 15, consumedHours: 10 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e5', name: 'David Pérez', avatar: 'https://i.pravatar.cc/150?u=e5', role: 'QA Engineer', totalHoursMonth: 160, projects: [
    { projectId: 'p2', assignedHours: 40, consumedHours: 38 }, { projectId: 'p3', assignedHours: 70, consumedHours: 75 },
    { projectId: 'p16', assignedHours: 50, consumedHours: 45 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e6', name: 'Lucía Fernández', avatar: 'https://i.pravatar.cc/150?u=e6', role: 'DevOps Engineer', totalHoursMonth: 160, projects: [
    { projectId: 'p5', assignedHours: 80, consumedHours: 70 }, { projectId: 'p6', assignedHours: 80, consumedHours: 90 },
  ], lastWeekHours: generateLastWeekHours('none')},
  { id: 'e7', name: 'Jorge González', avatar: 'https://i.pravatar.cc/150?u=e7', role: 'Backend Dev', totalHoursMonth: 160, projects: [
    { projectId: 'p3', assignedHours: 60, consumedHours: 50 }, { projectId: 'p7', assignedHours: 70, consumedHours: 65 },
    { projectId: 'p17', assignedHours: 25, consumedHours: 25 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e8', name: 'Elena Sánchez', avatar: 'https://i.pravatar.cc/150?u=e8', role: 'Frontend Dev', totalHoursMonth: 160, projects: [
    { projectId: 'p8', assignedHours: 100, consumedHours: 80 }, { projectId: 'p18', assignedHours: 50, consumedHours: 40 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e9', name: 'Miguel Romero', avatar: 'https://i.pravatar.cc/150?u=e9', role: 'Data Scientist', totalHoursMonth: 160, projects: [
    { projectId: 'p9', assignedHours: 120, consumedHours: 110 }, { projectId: 'p19', assignedHours: 30, consumedHours: 10 },
  ], lastWeekHours: generateLastWeekHours('under')},
  { id: 'e10', name: 'Isabel Díaz', avatar: 'https://i.pravatar.cc/150?u=e10', role: 'UI/UX Designer', totalHoursMonth: 160, projects: [
    { projectId: 'p4', assignedHours: 40, consumedHours: 40 }, { projectId: 'p10', assignedHours: 90, consumedHours: 50 },
    { projectId: 'p20', assignedHours: 20, consumedHours: 20 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e11', name: 'Ricardo Torres', avatar: 'https://i.pravatar.cc/150?u=e11', role: 'QA Engineer', totalHoursMonth: 160, projects: [
    { projectId: 'p5', assignedHours: 30, consumedHours: 25 }, { projectId: 'p11', assignedHours: 60, consumedHours: 60 },
    { projectId: 'p21', assignedHours: 60, consumedHours: 55 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e12', name: 'Laura Navarro', avatar: 'https://i.pravatar.cc/150?u=e12', role: 'Frontend Dev', totalHoursMonth: 160, projects: [
    { projectId: 'p2', assignedHours: 40, consumedHours: 40 }, { projectId: 'p12', assignedHours: 80, consumedHours: 75 },
    { projectId: 'p22', assignedHours: 30, consumedHours: 10 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e13', name: 'Adrián Ruiz', avatar: 'https://i.pravatar.cc/150?u=e13', role: 'Backend Dev', totalHoursMonth: 160, projects: [
    { projectId: 'p6', assignedHours: 70, consumedHours: 80 }, { projectId: 'p13', assignedHours: 70, consumedHours: 60 },
    { projectId: 'p23', assignedHours: 20, consumedHours: 15 },
  ], lastWeekHours: generateLastWeekHours('under')},
  { id: 'e14', name: 'Carmen Gil', avatar: 'https://i.pravatar.cc/150?u=e14', role: 'Project Manager', totalHoursMonth: 160, projects: [
    { projectId: 'p5', assignedHours: 10, consumedHours: 10 }, { projectId: 'p10', assignedHours: 15, consumedHours: 12 },
    { projectId: 'p15', assignedHours: 15, consumedHours: 15 }, { projectId: 'p20', assignedHours: 10, consumedHours: 8 },
    { projectId: 'p25', assignedHours: 10, consumedHours: 5 }, { projectId: 'p30', assignedHours: 10, consumedHours: 10 },
  ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e15', name: 'Pablo Moreno', avatar: 'https://i.pravatar.cc/150?u=e15', role: 'DevOps Engineer', totalHoursMonth: 160, projects: [
    { projectId: 'p7', assignedHours: 50, consumedHours: 50 }, { projectId: 'p14', assignedHours: 80, consumedHours: 80 },
    { projectId: 'p24', assignedHours: 30, consumedHours: 35 },
  ], lastWeekHours: generateLastWeekHours('over')}
].map(e => ({ ...e, historicalData: generateEmployeeHistoricalData() }));

const generateTasksForProject = (projectId: string, employees: Employee[]): Task[] => {
    const taskCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 tasks
    const projectTeam = employees.filter(e => e.projects.some(p => p.projectId === projectId)).map(e => e.id);
    if (projectTeam.length === 0) return [];
    
    return Array.from({ length: taskCount }, (_, i) => {
        const statuses = [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS, TaskStatus.TO_DO];
        return {
            id: `${projectId}-t${i + 1}-${uuidv4()}`, // Ensure unique ID for tasks
            name: `Task ${i + 1} for ${projectId}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            assignedTo: projectTeam[Math.floor(Math.random() * projectTeam.length)]
        };
    });
};

const generateProjectHistoricalData = (): HistoricalData[] => {
    const months = getPastSixMonths();
    return months.map(month => {
        const assignedHours = Math.floor(Math.random() * 100) + 150;
        const consumedHours = Math.floor(assignedHours * (Math.random() * 0.4 + 0.7)); // 70-110% of assigned
        return { month, assignedHours, consumedHours };
    });
};

// Temporarily define rawProjects here to use rawEmployees for task generation
let rawProjects: Project[] = [
  { id: 'p1', name: 'Platform Maintenance', type: ProjectType.RECURRING, description: "Ongoing maintenance and bug fixes for the main platform.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p2', name: 'New Feature Launch', type: ProjectType.ONE_TIME, description: "Launch of the new AI-powered analytics module.", deadline: "2024-08-15T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p3', name: 'API Integration', type: ProjectType.ONE_TIME, description: "Integration with a new third-party payment provider.", deadline: "2024-09-01T23:59:59Z", status: ProjectStatus.AT_RISK, tasks: [], historicalData: [] },
  { id: 'p4', name: 'Marketing Website', type: ProjectType.RECURRING, description: "Content updates and performance optimization for the marketing site.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p5', name: 'CI/CD Pipeline Migration', type: ProjectType.ONE_TIME, description: "Migrating the build and deployment pipeline to a new system.", deadline: "2024-07-30T23:59:59Z", status: ProjectStatus.COMPLETED, tasks: [], historicalData: [] },
  { id: 'p6', name: 'Database Optimization', type: ProjectType.ONE_TIME, description: "Optimizing slow queries and improving database performance.", deadline: "2024-09-20T23:59:59Z", status: ProjectStatus.OFF_TRACK, tasks: [], historicalData: [] },
  { id: 'p7', name: 'System Monitoring Setup', type: ProjectType.RECURRING, description: "Maintaining and improving system-wide monitoring and alerting.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p8', name: 'Mobile App UI Redesign', type: ProjectType.ONE_TIME, description: "A complete overhaul of the mobile application's user interface.", deadline: "2024-10-10T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p9', name: 'Sales Data Analysis', type: ProjectType.RECURRING, description: "Quarterly analysis of sales data to identify trends.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p10', name: 'Dashboard Component Library', type: ProjectType.ONE_TIME, description: "Creating a reusable component library for internal dashboards.", deadline: "2024-11-01T23:59:59Z", status: ProjectStatus.AT_RISK, tasks: [], historicalData: [] },
  { id: 'p11', name: 'Automated Testing Suite', type: ProjectType.ONE_TIME, description: "Building an end-to-end automated testing suite.", deadline: "2024-08-25T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p12', name: 'Q3 Feature Development', type: ProjectType.ONE_TIME, description: "Developing key features planned for the third quarter.", deadline: "2024-09-30T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p13', name: 'Legacy System Refactor', type: ProjectType.ONE_TIME, description: "Refactoring a critical part of the legacy codebase.", deadline: "2024-12-01T23:59:59Z", status: ProjectStatus.OFF_TRACK, tasks: [], historicalData: [] },
  { id: 'p14', name: 'Infrastructure Security Audit', type: ProjectType.RECURRING, description: "Regular security audits of the production infrastructure.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p15', name: 'User Authentication Microservice', type: ProjectType.ONE_TIME, description: "Creating a new microservice for user authentication.", deadline: "2024-08-10T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p16', name: 'Performance Load Testing', type: ProjectType.ONE_TIME, description: "Conducting load tests to ensure system scalability.", deadline: "2024-09-05T23:59:59Z", status: ProjectStatus.AT_RISK, tasks: [], historicalData: [] },
  { id: 'p17', name: 'Billing System Maintenance', type: ProjectType.RECURRING, description: "Routine maintenance for the customer billing system.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p18', name: 'Onboarding UX Improvement', type: ProjectType.ONE_TIME, description: "Improving the user experience for new customer onboarding.", deadline: "2024-10-15T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p19', name: 'Churn Prediction Model', type: ProjectType.ONE_TIME, description: "Developing a machine learning model to predict customer churn.", deadline: "2024-11-20T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p20', name: 'Content Management System', type: ProjectType.RECURRING, description: "Managing the internal Content Management System.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p21', name: 'Release Hotfix 2.4.1', type: ProjectType.ONE_TIME, description: "Urgent hotfix for a critical bug in production.", deadline: "2024-07-25T23:59:59Z", status: ProjectStatus.COMPLETED, tasks: [], historicalData: [] },
  { id: 'p22', name: 'A/B Testing Framework', type: ProjectType.ONE_TIME, description: "Building a framework for running A/B tests on the platform.", deadline: "2024-10-01T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p23', name: 'API Documentation Update', type: ProjectType.RECURRING, description: "Keeping the public API documentation up to date.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p24', name: 'Cloud Cost Optimization', type: ProjectType.RECURRING, description: "Regularly reviewing and optimizing cloud infrastructure costs.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p25', name: 'Client Demo Preparation', type: ProjectType.ONE_TIME, description: "Preparing a product demo for a major potential client.", deadline: "2024-08-05T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p26', name: 'Analytics Dashboard', type: ProjectType.ONE_TIME, description: "Creating a new analytics dashboard for the marketing team.", deadline: "2024-09-15T23:59:59Z", status: ProjectStatus.AT_RISK, tasks: [], historicalData: [] },
  { id: 'p27', name: 'Error Reporting Service', type: ProjectType.RECURRING, description: "Maintenance of the centralized error reporting service.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p28', name: 'Design System Governance', type: ProjectType.RECURRING, description: "Governing and updating the company-wide design system.", deadline: "2022-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p29', name: 'Mobile App Push Notifications', type: ProjectType.ONE_TIME, description: "Implementing a push notification system for the mobile app.", deadline: "2024-09-10T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] },
  { id: 'p30', name: 'Q4 Roadmap Planning', type: ProjectType.ONE_TIME, description: "Planning the product and engineering roadmap for the fourth quarter.", deadline: "2024-09-30T23:59:59Z", status: ProjectStatus.ON_TRACK, tasks: [], historicalData: [] }
];

// Now map projects to generate tasks, ensuring employees exist
rawProjects = rawProjects.map(p => ({
    ...p,
    tasks: generateTasksForProject(p.id, rawEmployees),
    historicalData: generateProjectHistoricalData(),
}));

const projectsWithoutActivityIds = ['p13', 'p26'];


export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({ employees: [], projects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recalculate everything to ensure consistency after tasks are generated using rawEmployees
    const calculatedEmployees: CalculatedEmployee[] = rawEmployees.map(emp => {
      const recurringHours = emp.projects
        .filter(p => rawProjects.find(rp => rp.id === p.projectId)?.type === ProjectType.RECURRING)
        .reduce((sum, p) => sum + p.assignedHours, 0);
      
      const oneTimeHours = emp.projects
        .filter(p => rawProjects.find(rp => rp.id === p.projectId)?.type === ProjectType.ONE_TIME)
        .reduce((sum, p) => sum + p.assignedHours, 0);
      
      const totalAssigned = recurringHours + oneTimeHours;
      const balanceHours = emp.totalHoursMonth - totalAssigned;
      const occupancyRate = emp.totalHoursMonth > 0 ? (totalAssigned / emp.totalHoursMonth) * 100 : 0;
      
      const totalLastWeekHours = emp.lastWeekHours.reduce((sum, h) => sum + h, 0);
      const lastWeekDailyAverage = totalLastWeekHours / (emp.lastWeekHours.length || 1);

      return {
        ...emp,
        recurringHours,
        oneTimeHours,
        balanceHours,
        occupancyRate: Math.min(100, Math.round(occupancyRate)),
        hasLoggedHoursThisWeek: totalLastWeekHours > 0,
        lastWeekDailyAverage: parseFloat(lastWeekDailyAverage.toFixed(1)),
      };
    });

    const calculatedProjects: CalculatedProject[] = rawProjects.map(proj => {
      const team = calculatedEmployees.filter(emp => emp.projects.some(p => p.projectId === proj.id));
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
        hasActivityThisWeek: !projectsWithoutActivityIds.includes(proj.id),
      };
    });
    
    setData({ employees: calculatedEmployees, projects: calculatedProjects });
    setLoading(false);
  }, []);

  return { 
    data, 
    loading, 
    // Expose these for App.tsx to use when adding new items
    generateEmployeeHistoricalData, 
    generateProjectHistoricalData,
    generateLastWeekHours
  };
};
