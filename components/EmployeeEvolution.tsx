import React, { useMemo, useState } from 'react';
import { CalculatedEmployee } from '../types';
import { KPICard } from './KPICard';
import EmployeeEvolutionTable from './EmployeeEvolutionTable';
import EmployeeEvolutionCard from './EmployeeEvolutionCard';
import { ChartBarIcon, TableIcon } from './Icons';

interface EmployeeEvolutionProps {
  employees: CalculatedEmployee[];
  onSelectEmployee: (employee: CalculatedEmployee) => void;
}

type EvolutionView = 'charts' | 'table';

const EmployeeEvolution: React.FC<EmployeeEvolutionProps> = ({ employees, onSelectEmployee }) => {
  const [view, setView] = useState<EvolutionView>('charts');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const { avgOccupancyRate, avgCompletionRate, topPerformer, lowPerformer } = useMemo(() => {
    if (employees.length === 0) {
      return {
        avgOccupancyRate: 0,
        avgCompletionRate: 0,
        topPerformer: null,
        lowPerformer: null,
      };
    }

    let totalOccupancy = 0;
    let totalCompletion = 0;
    let performers: { name: string; avgCompletion: number }[] = [];

    employees.forEach(emp => {
      totalOccupancy += emp.occupancyRate;

      const avgCompletion = emp.historicalData.reduce((acc, month) => {
        const rate = month.assignedHours > 0 ? (month.consumedHours / month.assignedHours) * 100 : 0;
        return acc + rate;
      }, 0) / (emp.historicalData.length || 1);
      
      totalCompletion += avgCompletion;
      performers.push({ name: emp.name, avgCompletion });
    });

    performers.sort((a, b) => b.avgCompletion - a.avgCompletion);

    return {
      avgOccupancyRate: totalOccupancy / employees.length,
      avgCompletionRate: totalCompletion / employees.length,
      topPerformer: performers[0],
      lowPerformer: performers[performers.length - 1],
    };
  }, [employees]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Ocupación Promedio" value={`${avgOccupancyRate.toFixed(1)}%`} />
        <KPICard title="Finalización Promedio (6m)" value={`${avgCompletionRate.toFixed(1)}%`} />
        <KPICard title="Mejor Rendimiento (6m)" value={topPerformer?.name || 'N/A'} />
        <KPICard title="Menor Rendimiento (6m)" value={lowPerformer?.name || 'N/A'} />
      </div>
      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
            <h3 className="text-xl font-montserrat font-bold text-text-primary">
              Detalle de Evolución por Empleado
            </h3>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary bg-surface shadow-custom-light font-open-sans text-sm"
                />
                <button 
                    onClick={() => setView('charts')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${view === 'charts' ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-neutral-100 text-text-secondary'}`}
                    aria-label="Vista de Gráficos"
                >
                    <ChartBarIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setView('table')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${view === 'table' ? 'bg-primary text-white shadow-md' : 'bg-background hover:bg-neutral-100 text-text-secondary'}`}
                    aria-label="Vista de Tabla"
                >
                    <TableIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        {view === 'charts' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredEmployees.map(employee => (
                    <EmployeeEvolutionCard key={employee.id} employee={employee} onClick={() => onSelectEmployee(employee)} />
                ))}
            </div>
        ) : (
            <EmployeeEvolutionTable employees={filteredEmployees} />
        )}

      </div>
    </div>
  );
};

export default EmployeeEvolution;