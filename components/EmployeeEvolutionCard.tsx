import React, { useMemo } from 'react';
import { CalculatedEmployee } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Scatter } from 'recharts';

interface EmployeeEvolutionCardProps {
    employee: CalculatedEmployee;
    onClick: () => void;
}

// Custom shape for the goal marker. A short, thick horizontal line.
const GoalMarker = (props: any) => {
  const { cx, cy, payload } = props;
  const BAR_WIDTH = 20;
  // Make the marker slightly wider than the bar for better visibility
  const markerWidth = BAR_WIDTH + 4; 
  
  // Recharts might pass undefined coordinates during render cycle, guard against it.
  if (cx === undefined || cy === undefined || payload.Meta === undefined) {
    return null;
  }
  
  return (
    <line
      x1={cx - markerWidth / 2}
      y1={cy}
      x2={cx + markerWidth / 2}
      y2={cy}
      stroke="#EF4444"
      strokeWidth={3}
      strokeLinecap="round"
    />
  );
};


const EmployeeEvolutionCard: React.FC<EmployeeEvolutionCardProps> = ({ employee, onClick }) => {
    
    const chartData = useMemo(() => {
        const MINUTES_IN_MONTH = 168 * 60; // Standard monthly hours in minutes
        return employee.historicalData.map(d => {
            const finalizacion = d.assignedHours > 0 ? Math.round((d.consumedHours / d.assignedHours) * 100) : 0;
            const fichaje = d.consumedHours > 0 ? Math.round((d.consumedHours / MINUTES_IN_MONTH) * 100) : 0;
            return {
                month: d.month,
                'Finalización': finalizacion,
                'Fichaje': fichaje,
                'Meta': d.goalCompletionRate,
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

    const getKpiColor = (value: number) => {
        if (value >= 90) return 'text-green-600';
        if (value >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const BAR_WIDTH = 20;

    return (
        <div 
            className="bg-surface border border-border rounded-xl p-4 shadow-custom-light hover:shadow-custom-medium hover:border-primary/50 transition-all duration-200 cursor-pointer flex flex-col"
            onClick={onClick}
        >
            <div className="mb-4">
                <h4 className="font-montserrat font-bold text-text-primary text-lg">{employee.name}</h4>
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Finalización Media:</span>
                        <span className={`font-bold font-montserrat ${getKpiColor(finalizacionMedia)}`}>{finalizacionMedia.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-text-secondary">Fichaje Medio:</span>
                        <span className={`font-bold font-montserrat ${getKpiColor(fichajeMedio)}`}>{fichajeMedio.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
            
            {/* Fichaje Chart */}
            <div className="w-full flex-grow flex flex-col" style={{ minHeight: '120px' }}>
                <h5 className="font-montserrat font-semibold text-xs text-text-secondary text-center mb-2">Evolución de Fichaje (%)</h5>
                <div className="flex-grow flex items-center justify-around px-1">
                    {chartData.map((data, index) => {
                        const value = data['Fichaje'];
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

            <div className="border-t border-border my-4"></div>

            {/* Main Chart */}
            <div className="w-full" style={{ height: '160px' }}>
                <h5 className="font-montserrat font-semibold text-xs text-text-secondary text-center mb-1">Evolución de Finalización</h5>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 15, right: 20, left: -25, bottom: 5 }}>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} interval={0} />
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
                        
                        <Bar yAxisId="left" dataKey="Finalización" name="Finalización" barSize={BAR_WIDTH}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry['Finalización'])} />
                            ))}
                        </Bar>
                        
                        <Scatter yAxisId="left" dataKey="Meta" name="Meta" fill="#EF4444" shape={<GoalMarker />} />

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EmployeeEvolutionCard;