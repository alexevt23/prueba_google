import React, { useState, useMemo } from 'react';
import { CalculatedEmployee } from '../types';
import { ChevronDownIcon } from './Icons';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { gsap } from 'gsap';

interface EmployeeEvolutionTableProps {
  employees: CalculatedEmployee[];
}

const ExpandedRowContent: React.FC<{ employee: CalculatedEmployee }> = ({ employee }) => {
    const chartData = useMemo(() => {
        return employee.historicalData.map(d => ({
            month: d.month,
            ...d,
            balance: d.consumedHours - d.assignedHours,
            completionRate: d.assignedHours > 0 ? Math.round((d.consumedHours / d.assignedHours) * 100) : 0,
        }));
    }, [employee.historicalData]);

    const getBarColor = (value: number) => {
        if (value > 100) return '#3B82F6'; // Superado (Azul)
        if (value >= 80) return '#22C55E'; // Cumplido (Verde)
        return '#F97316'; // No cumplido (Naranja)
    };
    
    const totalAssigned = chartData.reduce((sum, item) => sum + item.assignedHours, 0);
    const totalConsumed = chartData.reduce((sum, item) => sum + item.consumedHours, 0);
    const totalBalance = totalConsumed - totalAssigned;

    return (
        <div className="bg-primary-light grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
           <div>
            <h4 className="font-montserrat font-bold text-text-primary mb-2">Desglose (6 Meses)</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-background">
                            <tr>
                                <th className="px-4 py-2">Mes</th>
                                <th className="px-4 py-2 text-right">Asignadas</th>
                                <th className="px-4 py-2 text-right">Consumidas</th>
                                <th className="px-4 py-2 text-right">Balance</th>
                                <th className="px-4 py-2 text-right">Finalización</th>
                            </tr>
                        </thead>
                        <tbody className="font-open-sans">
                            {chartData.map((d, i) => (
                                <tr key={i} className="border-b border-border last:border-b-0">
                                    <td className="px-4 py-2 font-medium text-text-primary">{d.month}</td>
                                    <td className="px-4 py-2 text-right">{d.assignedHours}h</td>
                                    <td className="px-4 py-2 text-right">{d.consumedHours}h</td>
                                    <td className={`px-4 py-2 text-right font-semibold ${d.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{d.balance}h</td>
                                    <td className="px-4 py-2 text-right">{d.completionRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-montserrat font-bold bg-background">
                             <tr>
                                <td className="px-4 py-2">Total</td>
                                <td className="px-4 py-2 text-right">{totalAssigned}h</td>
                                <td className="px-4 py-2 text-right">{totalConsumed}h</td>
                                <td className={`px-4 py-2 text-right ${totalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>{totalBalance}h</td>
                                <td className="px-4 py-2 text-right">{totalAssigned > 0 ? Math.round((totalConsumed/totalAssigned)*100) : 0}%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
           </div>
            <div className="min-h-[200px]">
                <h4 className="font-montserrat font-bold text-text-primary mb-2">Gráfico de Finalización</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '0.5rem' }} />
                        <Bar dataKey="completionRate" name="Finalización">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.completionRate)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const EmployeeEvolutionTable: React.FC<EmployeeEvolutionTableProps> = ({ employees }) => {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (employeeId: string) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(employeeId)) {
            newSet.delete(employeeId);
        } else {
            newSet.add(employeeId);
        }
        setExpandedRows(newSet);
    };

    const employeeData = useMemo(() => employees.map(emp => {
        const totalConsumed = emp.historicalData.reduce((sum, item) => sum + item.consumedHours, 0);
        const totalAssigned = emp.historicalData.reduce((sum, item) => sum + item.assignedHours, 0);
        
        const avgCompletion = totalAssigned > 0 ? (totalConsumed / totalAssigned) * 100 : 0;
        const avgClockIn = emp.historicalData.reduce((sum, item) => sum + (item.consumedHours > 0 ? (item.consumedHours / 168) * 100 : 0), 0) / (emp.historicalData.length || 1);
        const avgUnconsumed = totalAssigned - totalConsumed / (emp.historicalData.length || 1);

        return {
            ...emp,
            avgCompletion,
            avgClockIn,
            avgUnconsumed,
        };
  }), [employees]);

  return (
    <div className="overflow-x-auto">
      <div className="border border-border rounded-xl shadow-custom-medium">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-3 py-3 text-xs text-text-secondary font-montserrat font-semibold uppercase tracking-wider border-b-2 border-border bg-surface rounded-t-xl">
            <div className="col-span-1"></div>
            <div className="col-span-3">Empleado</div>
            <div className="col-span-2 text-center">Finalización Media</div>
            <div className="col-span-2 text-center">Fichaje Medio</div>
            <div className="col-span-2 text-center">Ocupación Actual</div>
            <div className="col-span-2 text-center">Horas No Consumidas (Media)</div>
        </div>
        {/* Body */}
        <div className="divide-y divide-border">
            {employeeData.map(employee => (
            <div key={employee.id}>
                <div 
                    onClick={() => toggleRow(employee.id)}
                    className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-primary-light transition-all duration-200 cursor-pointer"
                >
                    <div className="col-span-1 flex justify-center">
                        <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${expandedRows.has(employee.id) ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                        <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full" />
                        <p className="font-semibold text-text-primary font-montserrat">{employee.name}</p>
                    </div>
                    <div className="col-span-2 text-center font-open-sans">{employee.avgCompletion.toFixed(1)}%</div>
                    <div className="col-span-2 text-center font-open-sans">{employee.avgClockIn.toFixed(1)}%</div>
                    <div className="col-span-2 text-center font-open-sans">{employee.occupancyRate}%</div>
                    <div className="col-span-2 text-center font-open-sans">{employee.avgUnconsumed.toFixed(1)}h</div>
                </div>
                {expandedRows.has(employee.id) && (
                    <div className="border-t border-border">
                        <ExpandedRowContent employee={employee} />
                    </div>
                )}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeEvolutionTable;
