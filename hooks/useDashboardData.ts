import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Keep for mock data generation if needed
import { 
    Employee, Project, ProjectType, DashboardData, CalculatedEmployee, 
    CalculatedProject, ProjectStatus, TaskStatus, Task, HistoricalData, EmployeeProject 
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
        const assignedHours = (Math.floor(Math.random() * 20) + 140) * 60; // 140-160 hours in minutes
        const consumedHours = Math.floor(assignedHours * (Math.random() * 0.3 + 0.8)); // 80-110% of assigned
        const goalCompletionRate = Math.floor(Math.random() * 11) + 90; // Random goal 90-100%
        return { month, assignedHours, consumedHours, goalCompletionRate };
    });
};

const generateLastWeekHours = (pattern: 'none' | 'normal' | 'over' | 'under'): number[] => {
    // Returns minutes per day
    const toMins = (h: number) => h * 60;
    switch(pattern) {
        case 'none': return [0, 0, 0, 0, 0];
        case 'under': return [toMins(Math.floor(Math.random()*2)+3), toMins(Math.floor(Math.random()*3)+3), toMins(Math.floor(Math.random()*3)+4), toMins(Math.floor(Math.random()*2)+4), toMins(Math.floor(Math.random()*2)+3)]; // 3-6 hours
        case 'over': return [toMins(Math.floor(Math.random()*2)+8), toMins(Math.floor(Math.random()*2)+9), toMins(8), toMins(Math.floor(Math.random()*3)+8), toMins(Math.floor(Math.random()*2)+9)]; // 8-11 hours
        default: return [toMins(8), toMins(7), toMins(8), toMins(9), toMins(8)]; // normal-ish
    }
}

const rawEmployeesData = [
  { id: 'e1', name: 'Ana García', role: 'Frontend Dev', totalHoursMonth: 160*60, projects: [ { projectId: 'p1'}, { projectId: 'p2'}, { projectId: 'p12'}, { projectId: 'p22'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e2', name: 'Carlos Rodríguez', role: 'Backend Dev', totalHoursMonth: 160*60, projects: [ { projectId: 'p1'}, { projectId: 'p3'}, { projectId: 'p15'} ], lastWeekHours: generateLastWeekHours('over')},
  { id: 'e3', name: 'Javier López', role: 'UI/UX Designer', totalHoursMonth: 160*60, projects: [ { projectId: 'p1'}, { projectId: 'p2'}, { projectId: 'p18'}, { projectId: 'p28'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e4', name: 'Sofía Martínez', role: 'Project Manager', totalHoursMonth: 160*60, projects: [ { projectId: 'p1'}, { projectId: 'p2'}, { projectId: 'p3'}, { projectId: 'p4'}, { projectId: 'p11'}, { projectId: 'p21'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e5', name: 'David Pérez', role: 'QA Engineer', totalHoursMonth: 160*60, projects: [ { projectId: 'p2'}, { projectId: 'p3'}, { projectId: 'p16'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e6', name: 'Lucía Fernández', role: 'DevOps Engineer', totalHoursMonth: 160*60, projects: [ { projectId: 'p5'}, { projectId: 'p6'} ], lastWeekHours: generateLastWeekHours('none')},
  { id: 'e7', name: 'Jorge González', role: 'Backend Dev', totalHoursMonth: 160*60, projects: [ { projectId: 'p3'}, { projectId: 'p7'}, { projectId: 'p17'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e8', name: 'Elena Sánchez', role: 'Frontend Dev', totalHoursMonth: 160*60, projects: [ { projectId: 'p8'}, { projectId: 'p18'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e9', name: 'Miguel Romero', role: 'Data Scientist', totalHoursMonth: 160*60, projects: [ { projectId: 'p9'}, { projectId: 'p19'} ], lastWeekHours: generateLastWeekHours('under')},
  { id: 'e10', name: 'Isabel Díaz', role: 'UI/UX Designer', totalHoursMonth: 160*60, projects: [ { projectId: 'p4'}, { projectId: 'p10'}, { projectId: 'p20'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e11', name: 'Ricardo Torres', role: 'QA Engineer', totalHoursMonth: 160*60, projects: [ { projectId: 'p5'}, { projectId: 'p11'}, { projectId: 'p21'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e12', name: 'Laura Navarro', role: 'Frontend Dev', totalHoursMonth: 160*60, projects: [ { projectId: 'p2'}, { projectId: 'p12'}, { projectId: 'p22'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e13', name: 'Adrián Ruiz', role: 'Backend Dev', totalHoursMonth: 160*60, projects: [ { projectId: 'p6'}, { projectId: 'p13'}, { projectId: 'p23'} ], lastWeekHours: generateLastWeekHours('under')},
  { id: 'e14', name: 'Carmen Gil', role: 'Project Manager', totalHoursMonth: 160*60, projects: [ { projectId: 'p5'}, { projectId: 'p10'}, { projectId: 'p15'}, { projectId: 'p20'}, { projectId: 'p25'}, { projectId: 'p30'} ], lastWeekHours: generateLastWeekHours('normal')},
  { id: 'e15', name: 'Pablo Moreno', role: 'DevOps Engineer', totalHoursMonth: 160*60, projects: [ { projectId: 'p7'}, { projectId: 'p14'}, { projectId: 'p24'} ], lastWeekHours: generateLastWeekHours('over')}
];


const generateTasksForProject = (projectId: string): Task[] => {
    const projectTeam = rawEmployeesData.filter(e => e.projects.some(p => p.projectId === projectId));
    if (projectTeam.length === 0) return [];
    
    let tasks: Task[] = [];
    projectTeam.forEach(member => {
        const taskCountForMember = Math.floor(Math.random() * 4) + 2; // 2 to 5 tasks
        const totalHoursForMember = (Math.floor(Math.random() * 40) + 10) * 60; // 10-50 hours in minutes for this member on this project
        let remainingHours = totalHoursForMember;
        
        for (let i = 0; i < taskCountForMember; i++) {
            let assignedHours = 0;
            if (i === taskCountForMember - 1) {
                assignedHours = remainingHours;
            } else {
                assignedHours = Math.floor((remainingHours / (taskCountForMember - i)) * (Math.random() * 0.4 + 0.4));
            }
            assignedHours = Math.round(assignedHours / 15) * 15; // Round to nearest 15 mins
            if (assignedHours <= 0 && remainingHours > 0) assignedHours = remainingHours;


            remainingHours -= assignedHours;
            if (assignedHours <= 0) continue;

            const consumedHoursRatio = Math.random();
            const consumedHours = Math.round((assignedHours * consumedHoursRatio) / 15) * 15;
            const status = consumedHours >= assignedHours ? TaskStatus.COMPLETED : (consumedHours > 0 ? TaskStatus.IN_PROGRESS : TaskStatus.TO_DO);
            
            tasks.push({
                id: `${projectId}-${member.id}-t${i + 1}`,
                name: `Task ${i + 1} for ${projectId}`,
                assignedTo: member.id,
                status,
                assignedHours,
                consumedHours,
            });
        }
    });

    return tasks;
};

const generateProjectHistoricalData = (): HistoricalData[] => {
    const months = getPastSixMonths();
    return months.map(month => {
        const assignedHours = (Math.floor(Math.random() * 100) + 150) * 60;
        const consumedHours = Math.floor(assignedHours * (Math.random() * 0.4 + 0.7)); // 70-110% of assigned
        const goalCompletionRate = 95; // Constant goal for projects.
        return { month, assignedHours, consumedHours, goalCompletionRate };
    });
};

let rawProjectsData: Omit<Project, 'tasks' | 'historicalData'>[] = [
  { id: 'p1', name: 'Platform Maintenance', type: ProjectType.RECURRING, description: "Ongoing maintenance and bug fixes for the main platform.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p2', name: 'New Feature Launch', type: ProjectType.ONE_TIME, description: "Launch of the new AI-powered analytics module.", deadline: "2024-08-15T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p3', name: 'API Integration', type: ProjectType.ONE_TIME, description: "Integration with a new third-party payment provider.", deadline: "2024-09-01T23:59:59Z", status: ProjectStatus.AT_RISK },
  { id: 'p4', name: 'Marketing Website', type: ProjectType.RECURRING, description: "Content updates and performance optimization for the marketing site.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p5', name: 'CI/CD Pipeline Migration', type: ProjectType.ONE_TIME, description: "Migrating the build and deployment pipeline to a new system.", deadline: "2024-07-30T23:59:59Z", status: ProjectStatus.COMPLETED },
  { id: 'p6', name: 'Database Optimization', type: ProjectType.ONE_TIME, description: "Optimizing slow queries and improving database performance.", deadline: "2024-09-20T23:59:59Z", status: ProjectStatus.OFF_TRACK },
  { id: 'p7', name: 'System Monitoring Setup', type: ProjectType.RECURRING, description: "Maintaining and improving system-wide monitoring and alerting.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p8', name: 'Mobile App UI Redesign', type: ProjectType.ONE_TIME, description: "A complete overhaul of the mobile application's user interface.", deadline: "2024-10-10T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p9', name: 'Sales Data Analysis', type: ProjectType.RECURRING, description: "Quarterly analysis of sales data to identify trends.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p10', name: 'Dashboard Component Library', type: ProjectType.ONE_TIME, description: "Creating a reusable component library for internal dashboards.", deadline: "2024-11-01T23:59:59Z", status: ProjectStatus.AT_RISK },
  { id: 'p11', name: 'Automated Testing Suite', type: ProjectType.ONE_TIME, description: "Building an end-to-end automated testing suite.", deadline: "2024-08-25T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p12', name: 'Q3 Feature Development', type: ProjectType.ONE_TIME, description: "Developing key features planned for the third quarter.", deadline: "2024-09-30T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p13', name: 'Legacy System Refactor', type: ProjectType.ONE_TIME, description: "Refactoring a critical part of the legacy codebase.", deadline: "2024-12-01T23:59:59Z", status: ProjectStatus.OFF_TRACK },
  { id: 'p14', name: 'Infrastructure Security Audit', type: ProjectType.RECURRING, description: "Regular security audits of the production infrastructure.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p15', name: 'User Authentication Microservice', type: ProjectType.ONE_TIME, description: "Creating a new microservice for user authentication.", deadline: "2024-08-10T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p16', name: 'Performance Load Testing', type: ProjectType.ONE_TIME, description: "Conducting load tests to ensure system scalability.", deadline: "2024-09-05T23:59:59Z", status: ProjectStatus.AT_RISK },
  { id: 'p17', name: 'Billing System Maintenance', type: ProjectType.RECURRING, description: "Routine maintenance for the customer billing system.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p18', name: 'Onboarding UX Improvement', type: ProjectType.ONE_TIME, description: "Improving the user experience for new customer onboarding.", deadline: "2024-10-15T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p19', name: 'Churn Prediction Model', type: ProjectType.ONE_TIME, description: "Developing a machine learning model to predict customer churn.", deadline: "2024-11-20T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p20', name: 'Content Management System', type: ProjectType.RECURRING, description: "Managing the internal Content Management System.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p21', name: 'Release Hotfix 2.4.1', type: ProjectType.ONE_TIME, description: "Urgent hotfix for a critical bug in production.", deadline: "2024-07-25T23:59:59Z", status: ProjectStatus.COMPLETED },
  { id: 'p22', name: 'A/B Testing Framework', type: ProjectType.ONE_TIME, description: "Building a framework for running A/B tests on the platform.", deadline: "2024-10-01T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p23', name: 'API Documentation Update', type: ProjectType.RECURRING, description: "Keeping the public API documentation up to date.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p24', name: 'Cloud Cost Optimization', type: ProjectType.RECURRING, description: "Regularly reviewing and optimizing cloud infrastructure costs.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p25', name: 'Client Demo Preparation', type: ProjectType.ONE_TIME, description: "Preparing a product demo for a major potential client.", deadline: "2024-08-05T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p26', name: 'Analytics Dashboard', type: ProjectType.ONE_TIME, description: "Creating a new analytics dashboard for the marketing team.", deadline: "2024-09-15T23:59:59Z", status: ProjectStatus.AT_RISK },
  { id: 'p27', name: 'Error Reporting Service', type: ProjectType.RECURRING, description: "Maintenance of the centralized error reporting service.", deadline: "2024-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p28', name: 'Design System Governance', type: ProjectType.RECURRING, description: "Governing and updating the company-wide design system.", deadline: "2022-12-31T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p29', name: 'Mobile App Push Notifications', type: ProjectType.ONE_TIME, description: "Implementing a push notification system for the mobile app.", deadline: "2024-09-10T23:59:59Z", status: ProjectStatus.ON_TRACK },
  { id: 'p30', name: 'Q4 Roadmap Planning', type: ProjectType.ONE_TIME, description: "Planning the product and engineering roadmap for the fourth quarter.", deadline: "2024-09-30T23:59:59Z", status: ProjectStatus.ON_TRACK }
];

const projectsWithoutActivityIds = ['p13', 'p26'];


export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({ employees: [], projects: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once to generate the mock data.
    
    // 1. Create projects and generate tasks for them first.
    const rawProjects: Project[] = rawProjectsData.map(p => ({
        ...p,
        tasks: generateTasksForProject(p.id),
        historicalData: generateProjectHistoricalData(),
    }));

    // 2. Create base employee structures
    const baseEmployees: Omit<Employee, 'projects'>[] = rawEmployeesData.map(e => ({
        id: e.id,
        name: e.name,
        avatar: undefined,
        role: e.role,
        totalHoursMonth: e.totalHoursMonth,
        historicalData: generateEmployeeHistoricalData(),
        lastWeekHours: e.lastWeekHours
    }));

    // 3. Connect employees to projects and calculate their hours from tasks
    const employeesWithHours: Employee[] = baseEmployees.map(emp => {
        const projectsForEmployee: EmployeeProject[] = [];
        
        rawProjects.forEach(p => {
            const tasksInProject = p.tasks.filter(t => t.assignedTo === emp.id);
            if(tasksInProject.length > 0) {
                const assignedHours = tasksInProject.reduce((sum, t) => sum + t.assignedHours, 0);
                const consumedHours = tasksInProject.reduce((sum, t) => sum + t.consumedHours, 0);
                projectsForEmployee.push({ projectId: p.id, assignedHours, consumedHours });
            }
        });
        
        return { ...emp, projects: projectsForEmployee };
    });

    // 4. Perform final calculations for employees
    const calculatedEmployees: CalculatedEmployee[] = employeesWithHours.map(emp => {
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
            lastWeekDailyAverage: Math.round(lastWeekDailyAverage),
        };
    });
    
    // 5. Perform final calculations for projects
    const calculatedProjects: CalculatedProject[] = rawProjects.map(proj => {
        const team = calculatedEmployees.filter(emp => emp.projects.some(p => p.projectId === proj.id));
        
        const totalAssignedHours = proj.tasks.reduce((sum, task) => sum + task.assignedHours, 0);
        const totalConsumedHours = proj.tasks.reduce((sum, task) => sum + task.consumedHours, 0);
      
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
    generateEmployeeHistoricalData, 
    generateProjectHistoricalData,
    generateLastWeekHours
  };
};