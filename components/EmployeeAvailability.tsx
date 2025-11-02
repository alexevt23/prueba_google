import React, { useState } from 'react';
import { CalculatedEmployee, CalculatedProject, HistoricalData } from '../types';
import { EyeIcon, SortAscIcon, SortDescIcon, SortIcon } from './Icons';
import EmployeeDetailModal from './EmployeeDetailModal';

interface EmployeeAvailabilityProps {
  employees: CalculatedEmployee[];
  projects: CalculatedProject[];
  onUpdateEmployeeProjectHours: (employeeId: string, projectId: string, newAssignedHours: number) => void;
}

type SortColumn = 'name' | 'assignedHoursTotal' | 'balanceHours' | 'occupancyRate' | null;
type SortDirection = 'asc' | 'desc' | null;

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const getColor = () => {
    if (value > 90) return 'bg-red-500';
    if (value > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div className={`${getColor()} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  );
};

const HistoricalHeatmap: React.FC<{ data: HistoricalData[] }> = ({ data }) => {
    // balance = consumedHours - assignedHours
    const getColorForBalance = (balance: number): string => {
        if (balance > 5) return 'bg-red-500';     // Horas Adicionales
        if (balance >= -5) return 'bg-green-400'; // Meta Cumplida
        return 'bg-blue-400';                    // Horas Pendientes
    };

    const getStatusText = (balance: number): string => {
        if (balance > 5) return 'Horas Adicionales';
        if (balance >= -5) return 'Meta Cumplida';
        return 'Horas Pendientes';
    };

    return (
        <div className="flex items-center justify-center gap-1 h-full py-1">
            {data.map((monthData, index) => {
                const balance = monthData.consumedHours - monthData.assignedHours;
                const statusText = getStatusText(balance);
                const tooltipText = `${monthData.month}\nEstado: ${statusText}\nBalance: ${balance > 0 ? '+' : ''}${balance}h\nAsignadas: ${monthData.assignedHours}h\nConsumidas: ${monthData.consumedHours}h`;
                return (
                    <div 
                        key={index}
                        className={`w-4 h-7 rounded-sm transition-transform hover:scale-110 ${getColorForBalance(balance)}`}
                        title={tooltipText}
                    ></div>
                );
            })}
        </div>
    );
};

const EmployeeRow: React.FC<{ employee: CalculatedEmployee; onSelect: () => void; }> = ({ employee, onSelect }) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-3 border-b border-border last:border-b-0 hover:bg-background transition-colors">
      <div className="col-span-3">
        <p className="font-semibold text-text-primary">{employee.name}</p>
      </div>
      <div className="col-span-2 text-center">
        <p className="font-mono text-sm text-text-primary">{employee.recurringHours}h / {employee.oneTimeHours}h</p>
        <p className="text-xs text-text-secondary">Rec. / Puntual</p>
      </div>
      <div className="col-span-1 text-center">
         <p className={`font-mono text-sm font-medium ${employee.balanceHours < 0 ? 'text-red-600' : 'text-green-600'}`}>{employee.balanceHours}h</p>
         <p className="text-xs text-text-secondary">Balance</p>
      </div>
      <div className="col-span-3 flex items-center gap-3">
        <ProgressBar value={employee.occupancyRate} />
        <span className="font-mono text-sm w-12 text-right text-text-primary">{employee.occupancyRate}%</span>
      </div>
      <div className="col-span-2">
          <HistoricalHeatmap data={employee.historicalData} />
      </div>
      <div className="col-span-1 flex justify-end">
         <button onClick={onSelect} className="p-2 rounded-full hover:bg-slate-200 transition-colors" aria-label={`Ver detalles de ${employee.name}`}>
            <EyeIcon className="w-5 h-5 text-text-secondary" />
         </button>
      </div>
    </div>
  );
};

const EmployeeAvailability: React.FC<EmployeeAvailabilityProps> = ({ employees, projects, onUpdateEmployeeProjectHours }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<CalculatedEmployee | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null); // Reset sort
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') return <SortAscIcon className="w-4 h-4 text-primary" />;
      if (sortDirection === 'desc') return <SortDescIcon className="w-4 h-4 text-primary" />;
    }
    return <SortIcon className="w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const sortedEmployees = React.useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return employees;
    }

    return [...employees].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortColumn) {
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'assignedHoursTotal':
          valA = a.recurringHours + a.oneTimeHours;
          valB = b.recurringHours + b.oneTimeHours;
          break;
        case 'balanceHours':
          valA = a.balanceHours;
          valB = b.balanceHours;
          break;
        case 'occupancyRate':
          valA = a.occupancyRate;
          valB = b.occupancyRate;
          break;
        default:
          return 0;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [employees, sortColumn, sortDirection]);
  
  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs text-text-secondary font-semibold uppercase tracking-wider border-b border-border">
          <button 
            className="col-span-3 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('name')}
          >
            Empleado {getSortIcon('name')}
          </button>
          <button 
            className="col-span-2 text-center flex items-center justify-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('assignedHoursTotal')}
          >
            Horas Asignadas {getSortIcon('assignedHoursTotal')}
          </button>
          <button 
            className="col-span-1 text-center flex items-center justify-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('balanceHours')}
          >
            Balance {getSortIcon('balanceHours')}
          </button>
          <button 
            className="col-span-3 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors"
            onClick={() => handleSort('occupancyRate')}
          >
            Tasa de Ocupación {getSortIcon('occupancyRate')}
          </button>
          <div className="col-span-2 text-center">
            <span className="block">Historial (6m)</span>
            <div className="flex justify-center items-center gap-1 mt-1.5" aria-label="Leyenda del historial">
                <div className="w-2 h-2 rounded-full bg-red-500" title="Horas Adicionales"></div>
                <div className="w-2 h-2 rounded-full bg-green-400" title="Meta Cumplida"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400" title="Horas Pendientes"></div>
            </div>
          </div>
          <div className="col-span-1"></div>
        </div>
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {sortedEmployees.map(employee => (
            <EmployeeRow 
                key={employee.id} 
                employee={employee} 
                onSelect={() => setSelectedEmployee(employee)}
            />
            ))}
        </div>
      </div>
      {selectedEmployee && (
        <EmployeeDetailModal
            employee={selectedEmployee}
            projects={projects}
            onClose={() => setSelectedEmployee(null)}
            onUpdateProjectHours={onUpdateEmployeeProjectHours}
        />
      )}
    </>
  );
};

export default EmployeeAvailability;