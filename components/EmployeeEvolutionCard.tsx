import React, { useMemo } from 'react';
import { CalculatedEmployee } from '../types';
import { BarChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface EmployeeEvolutionCardProps {
    employee: CalculatedEmployee;
    onClick: () => void;
}

const EmployeeEvolutionCard: React.FC<EmployeeEvolutionCardProps> = ({ employee, onClick }) => {
    
    const chartData = useMemo(() => {
        return employee.historicalData.map(d => {
            const finalizacion = d.assignedHours > 0 ? Math.round((d.consumedHours / d.assignedHours) * 100) : 0;
            // Simulate a "clock-in" rate based on a standard 168h month for the trend line
            const fichaje = d.consumedHours > 0 ? Math.round((d.consumedHours / 168) * 100) : 0;
            return {
                month: d.month,
                'Finalización': finalizacion,
                'Fichaje': fichaje,
            };
        });
    }, [employee.historicalData]);
    
    const { finalizacionMedia, fichajeMedio } = useMemo(() => {
        if (chartData.length === 0) return { finalizacionMedia: 0, fichajeMedio: 0 };
        const totalFinalizacion = chartData.reduce((acc, item) => acc + item['Finalización'], 0);
        const totalFichaje = chartData.reduce((acc, item) => acc + item['Fichaje'], 0);
        return {
            finalizacionMedia: totalFinalizacion / chartData.length,
            fichajeMedio: totalFichaje / chartData.length,
        };
    }, [chartData]);
    
    const getBarColor = (value: number) => {
        if (value > 100) return '#3B82F6'; // Superado (Azul)
        if (value >= 80) return '#22C55E'; // Cumplido (Verde)
        return '#F97316'; // No cumplido (Naranja)
    };

    return (
        <div 
            className="bg-surface border border-border rounded-xl p-4 shadow-custom-light hover:shadow-custom-medium transition-shadow duration-200 cursor-pointer flex flex-col"
            onClick={onClick}
        >
            <div className="flex items-center gap-3 mb-4">
                <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full" />
                <div>
                    <h4 className="font-montserrat font-bold text-text-primary">{employee.name}</h4>
                    <p className="text-sm text-text-secondary font-open-sans">{employee.role}</p>
                </div>
            </div>
            
            <div className="flex-grow h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} unit="%" domain={[0, 'dataMax + 20']} />
                        <Tooltip
                            cursor={{ fill: 'rgba(229, 229, 229, 0.2)' }}
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid #E5E5E5',
                                borderRadius: '0.75rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                                fontFamily: "'Open Sans', sans-serif"
                            }}
                        />
                        <Bar yAxisId="left" dataKey="Finalización" name="Finalización">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry['Finalización'])} />
                            ))}
                        </Bar>
                        <Line yAxisId="left" type="monotone" dataKey="Fichaje" stroke="#F97316" strokeWidth={2} name="Fichaje" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-1">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-text-secondary">Finalización Media:</span>
                    <span className="font-bold font-montserrat text-text-primary">{finalizacionMedia.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-text-secondary">Fichaje Medio:</span>
                    <span className="font-bold font-montserrat text-text-primary">{fichajeMedio.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
};

export default EmployeeEvolutionCard;
