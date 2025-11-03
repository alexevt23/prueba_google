import React, { useState } from 'react';
import { EmployeePerformanceData, HistoricalData } from '../types';
import { SortAscIcon, SortDescIcon, SortIcon, EyeIcon } from './Icons';

interface EmployeePerformanceProps {
  data: EmployeePerformanceData[];
  onSelectEmployee: (employee: EmployeePerformanceData) => void;
}

type SortColumn = 'name' | 'overallCompletionRate' | 'occupancyRate' | null;
type SortDirection = 'asc' | 'desc' | null;

const CompletionProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const getColor = () => {
    if (value < 50) return 'bg-red-500';
    if (value < 85) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  return (
    <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner">
      <div className={`${getColor()} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
    </div>
  );
};

const OccupancyProgressBar: React.FC<{ value: number }> = ({ value }) => {
    const getColor = () => {
      if (value > 95) return 'bg-red-500';
      if (value > 80) return 'bg-yellow-500';
      return 'bg-green-500';
    };
    return (
      <div className="w-full bg-neutral-200 rounded-full h-2 shadow-inner">
        <div className={`${getColor()} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    );
  };

const HistoricalHeatmap: React.FC<{ data: HistoricalData[] }> = ({ data }) => {
    const getColorForBalance = (balance: number): string => {
        if (balance > 5) return 'bg-red-500';
        if (balance >= -5) return 'bg-green-500';
        return 'bg-blue-500';
    };
    return (
        <div className="flex items-center justify-center gap-1 h-full py-1">
            {data.map((monthData, index) => {
                const balance = monthData.consumedHours - monthData.assignedHours;
                return <div key={index} className={`w-4 h-7 rounded-sm shadow-custom-light ${getColorForBalance(balance)}`}></div>;
            })}
        </div>
    );
};

const EmployeePerformanceRow: React.FC<{ 
    employee: EmployeePerformanceData; 
    onSelect: (employee: EmployeePerformanceData) => void; 
}> = ({ employee, onSelect }) => {
  return (
    <div 
        className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg border border-border last:border-b-0 hover:bg-primary-light transition-all duration-200 shadow-custom-light mb-2"
        role="row"
    >
      <div className="col-span-3">
        <p className="font-semibold text-text-primary font-montserrat">{employee.name}</p>
        <p className="text-xs text-text-secondary font-open-sans">{employee.totalConsumedHours}h / {employee.totalAssignedHours}h consumidas</p>
      </div>
      <div className="col-span-3 flex items-center gap-3">
        <CompletionProgressBar value={employee.overallCompletionRate} />
        <span className="font-open-sans text-sm w-12 text-right text-text-primary">{employee.overallCompletionRate}%</span>
      </div>
      <div className="col-span-3 flex items-center gap-3">
        <OccupancyProgressBar value={employee.occupancyRate} />
        <span className="font-open-sans text-sm w-12 text-right text-text-primary">{employee.occupancyRate}%</span>
      </div>
      <div className="col-span-2 flex justify-center">
          <HistoricalHeatmap data={employee.historicalData} />
      </div>
      <div className="col-span-1 flex justify-end">
        <button 
            onClick={() => onSelect(employee)} 
            className="p-2 rounded-full hover:bg-neutral-200 transition-colors" 
            aria-label={`Ver detalles de ${employee.name}`}
        >
          <EyeIcon className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};

const EmployeePerformance: React.FC<EmployeePerformanceProps> = ({ data, onSelectEmployee }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('overallCompletionRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let valA: any, valB: any;
      switch (sortColumn) {
        case 'name': valA = a.name; valB = b.name; break;
        case 'overallCompletionRate': valA = a.overallCompletionRate; valB = b.overallCompletionRate; break;
        case 'occupancyRate': valA = a.occupancyRate; valB = b.occupancyRate; break;
        default: return 0;
      }
      if (typeof valA === 'string') return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      if (typeof valA === 'number') return sortDirection === 'asc' ? valA - valB : valB - valA;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-3 py-3 text-xs text-text-secondary font-montserrat font-semibold uppercase tracking-wider border-b-2 border-border mb-4">
        <button className="col-span-3 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('name')}>Empleado {getSortIcon('name')}</button>
        <button className="col-span-3 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('overallCompletionRate')}>Tasa de Finalización {getSortIcon('overallCompletionRate')}</button>
        <button className="col-span-3 flex items-center gap-1 cursor-pointer group hover:text-text-primary transition-colors" onClick={() => handleSort('occupancyRate')}>Tasa de Ocupación {getSortIcon('occupancyRate')}</button>
        <div className="col-span-2 text-center">Historial (6m)</div>
        <div className="col-span-1 text-right">Acciones</div>
      </div>
      <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {sortedData.map(employee => (
          <EmployeePerformanceRow 
              key={employee.id} 
              employee={employee} 
              onSelect={onSelectEmployee}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeePerformance;