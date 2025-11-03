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
    assignedHours: number; // in minutes
    consumedHours: number; // in minutes
}

export interface HistoricalData {
    month: string;
    assignedHours: number; // in minutes
    consumedHours: number; // in minutes
    goalCompletionRate: number;
}

export interface EmployeeProject {
  projectId: string;
  assignedHours: number; // in minutes
  consumedHours: number; // in minutes
}

export interface Employee {
  id: string;
  name: string;
  avatar?: string; // Explicitly made optional
  role?: string;    // Explicitly made optional
  totalHoursMonth: number; // in minutes
  projects: EmployeeProject[];
  historicalData: HistoricalData[];
  lastWeekHours: number[]; // in minutes
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
  recurringHours: number; // in minutes
  oneTimeHours: number; // in minutes
  balanceHours: number; // in minutes
  occupancyRate: number;
  hasLoggedHoursThisWeek: boolean;
  lastWeekDailyAverage: number; // in minutes
}

export interface CalculatedProject extends Project {
  team: CalculatedEmployee[];
  totalAssignedHours: number; // in minutes
  totalConsumedHours: number; // in minutes
  progress: number;
  hasActivityThisWeek: boolean;
}

// Fix: Add missing EmployeePerformanceData interface to resolve compilation error.
export interface EmployeePerformanceData extends CalculatedEmployee {
    totalConsumedHours: number;
    totalAssignedHours: number;
    overallCompletionRate: number;
}

export interface DashboardData {
    employees: CalculatedEmployee[];
    projects: CalculatedProject[];
}
