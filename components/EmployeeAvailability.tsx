import React, { useState } from 'react';
import { CalculatedEmployee, HistoricalData } from '../types';
import { SortAscIcon, SortDescIcon, SortIcon, SlackIcon } from './Icons';

interface EmployeeAvailabilityProps {
  employees: CalculatedEmployee[];
  onSelectEmployee: (employee: CalculatedEmployee) => void;
  onSendSlackMessage: (employeeName: string) => void;
}

// Helper to format minutes into h:mm string
function formatMinutesToHM(minutes: number): string {
  if (isNaN(minutes) || minutes === null) {
    return '0:00';
  }
  const isNegative = minutes < 0;
  const absMinutes = Math.abs(minutes);
  const h = Math.floor(absMinutes / 60);
  const m = Math.round(absMinutes % 60);
  const mFormatted = m < 10 ? `0${m}` : m;
  return `${isNegative ? '-' : ''}${h}:${mFormatted}`;
}

type SortColumn = 'name' | 'totalAssignedHours' | 'totalConsumedHours' | 'completionRate' | 'balanceHours' | 'occupancyRate' | null;
type SortDirection = 'asc' | 'desc' | null;

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const getProgressColor = (val: number, type: 'occupancy' | 'completion') => {
    if (type === 'occupancy') {
        if (val > 90) return 'bg-red-500';
        if (val > 75) return 'bg-yellow-500';
        return 'bg-green-500';
    } else { // completion
        if (val < 70) return 'bg-red-500';
        if (val < 90) return 'bg-yellow-500';
        return 'bg-green-500';
    }
  };
  
  const color = getProgressColor(value, 'occupancy');

  return (
    <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner">
      <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  );
};


const HistoricalHeatmap: React.FC<{ data: HistoricalData[] }> = ({ data }) => {
    const getColorForBalance = (balance: number): string => {
        if (balance > 5 * 60) return 'bg-red-500'; // Over 5 hours
        if (balance >= -5 * 60) return 'bg-green-500'; // Within +/- 5 hours
        return 'bg-blue-500'; // Under 5 hours
    };

    const getStatusText = (balance: number): string => {
        if (balance > 5 * 60) return 'Horas Adicionales';
        if (balance >= -5 * 60) return 'Meta Cumplida';
        return 'Horas Pendientes';
    };

    return (
        <div className="flex items-center justify-center gap-1 h-full py-1">
            {data.map((monthData, index) => {
                const balance = monthData.consumedHours - monthData.assignedHours;
                const statusText = getStatusText(balance);
                const tooltipText = `${monthData.month}\nEstado: ${statusText}\nBalance: ${formatMinutesToHM(balance)}\nAsignadas: ${formatMinutesToHM(monthData.assignedHours)}\nConsumidas: ${formatMinutesToHM(monthData.consumedHours)}`;
                return (
                    <div 
                        key={index}
                        className={`w-4 h-7 rounded-sm shadow-custom-light transition-transform hover:scale-105 ${getColorForBalance(balance)}`}
                        title={tooltipText}
                    ></div>
                );
            })}
        </div>
    );
};

const EmployeeRow: React.FC<{ 
    employee: CalculatedEmployee; 
    onSelect: (employee: CalculatedEmployee) => void; 
    onSendSlackMessage: (employeeName: string) => void;
}> = ({ employee, onSelect, onSendSlackMessage }) => {

  const totalAssignedHours = employee.recurringHours + employee.oneTimeHours;
  const totalConsumedHours = employee.projects.reduce((sum, p) => sum + p.consumedHours, 0);
  const completionRate = totalAssignedHours > 0 ? Math.round((totalConsumedHours / totalAssignedHours) * 100) : 0;

  return (
    <div 
        className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-border last:border-b-0 hover:bg-primary-light transition-all duration-200 cursor-pointer shadow-custom-light mb-2"
        onClick={() => onSelect(employee)}
        role="button"
        tabIndex={0}
        aria-label={`Ver detalles de ${employee.name}`}
    >
      <div className="col-span-3 flex items-center gap-3">
        <p className="font-semibold text-text-primary font-montserrat">{employee.name}</p>
        <button
            onClick={(e) => { e.stopPropagation(); onSendSlackMessage(employee.name); }}
            className="p-1 rounded-full text-blue-700 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label={`Enviar mensaje a ${employee.name} por Slack`}
        >
            <SlackIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="col-span-1 text-center font-open-sans text-sm">{formatMinutesToHM(totalAssignedHours)}</div>
      <div className="col-span-1 text-center font-open-sans text-sm">{formatMinutesToHM(totalConsumedHours)}</div>
      <div className="col-span-2 flex items-center gap-2">
        <ProgressBar value={completionRate} />
        <span className="font-open-sans text-sm w-10 text-right">{completionRate}%</span>
      </div>
       <div className="col-span-1 text-center">
         <p className={`font-open-sans text-sm font-medium ${employee.balanceHours < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatMinutesToHM(employee.balanceHours)}</p>
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <ProgressBar value={employee.occupancyRate} />
        <span className="font-open-sans text-sm w-10 text-right">{employee.occupancyRate}%</span>
      </div>
      <div className="col-span-2 flex justify-center">
          <HistoricalHeatmap data={employee.historicalData} />
      </div>
    </div>
  );
};

const EmployeeAvailability: React.FC<EmployeeAvailabilityProps> = ({ employees, onSelectEmployee, onSendSlackMessage }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
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
    if (!sortColumn || !sortDirection) return employees;

    return [...employees].sort((a, b) => {
      let valA: any, valB: any;
      
      const calcA = {
        totalAssigned: a.recurringHours + a.oneTimeHours,
        totalConsumed: a.projects.reduce((sum, p) => sum + p.consumedHours, 0),
      };
      const calcB = {
        totalAssigned: b.recurringHours + b.oneTimeHours,
        totalConsumed: b.projects.reduce((sum, p) => sum + p.consumedHours, 0),
      };

      switch (sortColumn) {
        case 'name': valA = a.name; valB = b.name; break;
        case 'totalAssignedHours': valA = calcA.totalAssigned; valB = calcB.totalAssigned; break;
        case 'totalConsumedHours': valA = calcA.totalConsumed; valB = calcB.totalConsumed; break;
        case 'completionRate': 
            valA = calcA.totalAssigned > 0 ? (calcA.totalConsumed / calcA.totalAssigned) : 0;
            valB = calcB.totalAssigned > 0 ? (calcB.totalConsumed / calcB.totalAssigned) : 0;
            break;
        case 'balanceHours': valA = a.balanceHours; valB = b.balanceHours; break;
        case 'occupancyRate': valA = a.occupancyRate; valB = b.occupancyRate; break;
        default: return 0;
      }
      if (typeof valA === 'string') return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      if (typeof valA === 'number') return sortDirection === 'asc' ? valA - valB : valB - valA;
      return 0;
    });
  }, [employees, sortColumn, sortDirection]);
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-3 py-3 text-xs text-text-secondary font-montserrat font-semibold uppercase tracking-wider border-b-2 border-border mb-4">
        <button className="col-span-3 flex items-center gap-1 group" onClick={() => handleSort('name')}>Empleado {getSortIcon('name')}</button>
        <button className="col-span-1 text-center flex items-center justify-center gap-1 group" onClick={() => handleSort('totalAssignedHours')}>Asignadas {getSortIcon('totalAssignedHours')}</button>
        <button className="col-span-1 text-center flex items-center justify-center gap-1 group" onClick={() => handleSort('totalConsumedHours')}>Consumidas {getSortIcon('totalConsumedHours')}</button>
        <button className="col-span-2 flex items-center gap-1 group" onClick={() => handleSort('completionRate')}>Finalización Mes {getSortIcon('completionRate')}</button>
        <button className="col-span-1 text-center flex items-center justify-center gap-1 group" onClick={() => handleSort('balanceHours')}>Balance {getSortIcon('balanceHours')}</button>
        <button className="col-span-2 flex items-center gap-1 group" onClick={() => handleSort('occupancyRate')}>Ocupación {getSortIcon('occupancyRate')}</button>
        <div className="col-span-2 text-center">
          <span className="block">Historial (6m)</span>
          <div className="flex justify-center items-center gap-1 mt-1.5" aria-label="Leyenda del historial">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" title="Horas Adicionales"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" title="Meta Cumplida"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" title="Horas Pendientes"></div>
          </div>
        </div>
      </div>
      <div className="pr-2">
        {sortedEmployees.map(employee => (
          <EmployeeRow 
              key={employee.id} 
              employee={employee} 
              onSelect={onSelectEmployee}
              onSendSlackMessage={onSendSlackMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeAvailability;