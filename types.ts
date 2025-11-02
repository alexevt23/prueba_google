export enum ProjectType {
  RECURRING = 'Recurrente',
  ONE_TIME = 'Puntual',
}

export enum ProjectStatus {
    ON_TRACK = 'En Curso',
    AT_RISK = 'En Riesgo',
    OFF_TRACK = 'Retrasado',
    COMPLETED = 'Completado',
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
  avatar: string;
  role: string;
  totalHoursMonth: number;
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