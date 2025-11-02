import React, { useState } from 'react';
import { CalculatedEmployee, CalculatedProject, HistoricalData } from '../types';
import { EyeIcon } from './Icons';
import EmployeeDetailModal from './EmployeeDetailModal';

interface EmployeeAvailabilityProps {
  employees: CalculatedEmployee[];
  projects: CalculatedProject[];
  onUpdateEmployeeProjectHours: (employeeId: string, projectId: string, newAssignedHours: number) => void;
}

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
    const getColorForBalance = (balance: number): string => {
        if (balance < -15) return 'bg-red-400';
        if (balance < -5) return 'bg-yellow-300';
        if (balance <= 5) return 'bg-green-300';
        if (balance <= 15) return 'bg-sky-200';
        return 'bg-sky-400';
    };

    return (
        <div className="flex items-center justify-center gap-1 h-full py-1">
            {data.map((monthData, index) => {
                const balance = monthData.consumedHours - monthData.assignedHours;
                const tooltipText = `${monthData.month} | Balance: ${balance > 0 ? '+' : ''}${balance}h\nAsignadas: ${monthData.assignedHours}h\nConsumidas: ${monthData.consumedHours}h`;
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
  
  return (
    <>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs text-text-secondary font-semibold uppercase tracking-wider border-b border-border">
          <div className="col-span-3">Empleado</div>
          <div className="col-span-2 text-center">Horas Asignadas</div>
          <div className="col-span-1 text-center">Balance</div>
          <div className="col-span-3">Tasa de Ocupación</div>
          <div className="col-span-2 text-center">
            <span className="block">Historial (6m)</span>
            <div className="flex justify-center items-center gap-1 mt-1.5" aria-label="Leyenda del historial">
                <div className="w-2 h-2 rounded-full bg-red-400" title="Sobrecarga"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-300" title="Ligera Sobrecarga"></div>
                <div className="w-2 h-2 rounded-full bg-green-300" title="Balanceado"></div>
                <div className="w-2 h-2 rounded-full bg-sky-200" title="Baja Carga"></div>
                <div className="w-2 h-2 rounded-full bg-sky-400" title="Muy Baja Carga"></div>
            </div>
          </div>
          <div className="col-span-1"></div>
        </div>
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {employees.map(employee => (
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