export enum ProjectType {
  RECURRING = 'Recurrente',
  ONE_TIME = 'Puntual',
}

export enum ProjectStatus {
    ON_TRACK = 'En Curso',
    AT_RISK = 'En Riesgo',
    OFF_TRACK = 'Retrasado',
    COMPLETED = 'Completado',
    PENDING = 'Pendiente' // Added for new projects
}

export enum TaskStatus {
    COMPLETED = 'Completado',
    IN_PROGRESS = 'En Progreso',
    TO_DO = 'Pendiente',
}

export interface Task {
    id: string;
    name: string;
    status: TaskStatus;
    assignedTo: string; // Employee ID
}

export interface HistoricalData {
    month: string;
    assignedHours: number;
    consumedHours: number;
}

export interface EmployeeProject {
  projectId: string;
  assignedHours: number;
  consumedHours: number;
}

export interface Employee {
  id: string;
  name: string;
  avatar?: string; // Explicitly made optional
  role?: string;    // Explicitly made optional
  totalHoursMonth: number; // Explicitly required now
  projects: EmployeeProject[];
  historicalData: HistoricalData[];
  lastWeekHours: number[];
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  deadline: string; // ISO date string
  status: ProjectStatus;
  tasks: Task[];
  historicalData: HistoricalData[];
}

// Interfaces for creating new items (ID is not required yet)
// Removed NewEmployeeData, NewProjectData, NewTaskData as add functionality is removed.

export interface CalculatedEmployee extends Employee {
  recurringHours: number;
  oneTimeHours: number;
  balanceHours: number;
  occupancyRate: number;
  hasLoggedHoursThisWeek: boolean;
  lastWeekDailyAverage: number;
}

export interface CalculatedProject extends Project {
  team: CalculatedEmployee[];
  totalAssignedHours: number;
  totalConsumedHours: number;
  progress: number;
  hasActivityThisWeek: boolean;
}

export interface DashboardData {
    employees: CalculatedEmployee[];
    projects: CalculatedProject[];
}

export interface EmployeePerformanceData extends CalculatedEmployee {
    overallCompletionRate: number;
    totalAssignedHours: number;
    totalConsumedHours: number;
}