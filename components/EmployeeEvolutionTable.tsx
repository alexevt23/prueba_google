import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalculatedEmployee } from '../types';
import { ChevronDownIcon } from './Icons';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { gsap } from 'gsap';

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

interface EmployeeEvolutionTableProps {
  employees: CalculatedEmployee[];
}

const ExpandedRowContent: React.FC<{ employee: CalculatedEmployee }> = ({ employee }) => {
    const chartData = useMemo(() => {
        const MINUTES_IN_MONTH = 168 * 60; // Standard monthly hours
        return employee.historicalData.map(d => ({
            month: d.month,
            ...d,
            balance: d.consumedHours - d.assignedHours,
            completionRate: d.assignedHours > 0 ? Math.round((d.consumedHours / d.assignedHours) * 100) : 0,
            fichajeRate: d.consumedHours > 0 ? Math.round((d.consumedHours / MINUTES_IN_MONTH) * 100) : 0,
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
                                <th className="px-4 py-2 text-right">%</th>
                            </tr>
                        </thead>
                        <tbody className="font-open-sans">
                            {chartData.map((d, i) => (
                                <tr key={i} className="border-b border-border last:border-b-0">
                                    <td className="px-4 py-2 font-medium text-text-primary">{d.month}</td>
                                    <td className="px-4 py-2 text-right">{formatMinutesToHM(d.assignedHours)}</td>
                                    <td className="px-4 py-2 text-right">{formatMinutesToHM(d.consumedHours)}</td>
                                    <td className={`px-4 py-2 text-right font-semibold ${d.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatMinutesToHM(d.balance)}</td>
                                    <td className="px-4 py-2 text-right">{d.completionRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-montserrat font-bold bg-background">
                             <tr>
                                <td className="px-4 py-2">Total</td>
                                <td className="px-4 py-2 text-right">{formatMinutesToHM(totalAssigned)}</td>
                                <td className="px-4 py-2 text-right">{formatMinutesToHM(totalConsumed)}</td>
                                <td className={`px-4 py-2 text-right ${totalBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatMinutesToHM(totalBalance)}</td>
                                <td className="px-4 py-2 text-right">{totalAssigned > 0 ? Math.round((totalConsumed/totalAssigned)*100) : 0}%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
           </div>
           <div className="space-y-6">
                <div>
                    <h4 className="font-montserrat font-bold text-text-primary mb-2">Evolución de Fichaje (%)</h4>
                    <div className="flex items-center justify-around p-4 bg-background rounded-lg">
                        {chartData.map((data, index) => {
                            const value = data.fichajeRate;
                            const getCircleColor = (val: number) => {
                                if (val >= 90) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' };
                                if (val >= 75) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' };
                                return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' };
                            };
                            const { bg, text, border } = getCircleColor(value);
                            return (
                                <div key={index} className="flex flex-col items-center gap-1.5 text-center">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-montserrat font-bold text-base border-2 shadow-sm transition-transform hover:scale-110 ${bg} ${text} ${border}`}>
                                        {value.toFixed(0)}
                                    </div>
                                    <span className="text-xs font-semibold text-text-secondary">{data.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="min-h-[200px]">
                    <h4 className="font-montserrat font-bold text-text-primary mb-2">Evolución de Finalización</h4>
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
        </div>
    );
};

type EmployeeEvolutionData = CalculatedEmployee & {
    avgCompletion: number;
    avgClockIn: number;
    avgUnconsumed: number;
};

const AnimatedTableRow: React.FC<{ employee: EmployeeEvolutionData; isExpanded: boolean; onToggle: () => void; }> = ({ employee, isExpanded, onToggle }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to(contentRef.current, {
            height: isExpanded ? 'auto' : 0,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => {
                if (isExpanded && contentRef.current) {
                    contentRef.current.style.height = 'auto';
                }
            }
        });
    }, [isExpanded]);

    return (
        <div>
            <div 
                onClick={onToggle}
                className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-primary-light transition-all duration-200 cursor-pointer"
            >
                <div className="col-span-1 flex justify-center">
                    <ChevronDownIcon className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <div className="col-span-3 flex items-center gap-3">
                    <p className="font-semibold text-text-primary font-montserrat">{employee.name}</p>
                </div>
                <div className="col-span-2 text-center font-open-sans">{employee.avgCompletion.toFixed(1)}%</div>
                <div className="col-span-2 text-center font-open-sans">{employee.avgClockIn.toFixed(1)}%</div>
                <div className="col-span-2 text-center font-open-sans">{employee.occupancyRate}%</div>
                <div className="col-span-2 text-center font-open-sans">{formatMinutesToHM(employee.avgUnconsumed)}</div>
            </div>
            <div ref={contentRef} className="overflow-hidden" style={{ height: 0 }}>
                <div className="border-t border-border">
                    <ExpandedRowContent employee={employee} />
                </div>
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

    const employeeData: EmployeeEvolutionData[] = useMemo(() => employees.map(emp => {
        const totalConsumed = emp.historicalData.reduce((sum, item) => sum + item.consumedHours, 0);
        const totalAssigned = emp.historicalData.reduce((sum, item) => sum + item.assignedHours, 0);
        const MINUTES_IN_MONTH = 168 * 60;
        
        const avgCompletion = totalAssigned > 0 ? (totalConsumed / totalAssigned) * 100 : 0;
        const avgClockIn = emp.historicalData.reduce((sum, item) => sum + (item.consumedHours > 0 ? (item.consumedHours / MINUTES_IN_MONTH) * 100 : 0), 0) / (emp.historicalData.length || 1);
        const avgUnconsumed = (totalAssigned - totalConsumed) / (emp.historicalData.length || 1);

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
            <div className="col-span-2 text-center whitespace-nowrap">Horas No Consumidas (Media)</div>
        </div>
        {/* Body */}
        <div className="divide-y divide-border">
            {employeeData.map(employee => (
                <AnimatedTableRow
                    key={employee.id}
                    employee={employee}
                    isExpanded={expandedRows.has(employee.id)}
                    onToggle={() => toggleRow(employee.id)}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeEvolutionTable;