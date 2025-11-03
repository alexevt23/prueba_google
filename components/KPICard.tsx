import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from './Icons';

interface KPICardProps {
  title: string;
  value: string;
  change?: number; // Optional change percentage
  changePeriod?: string; // e.g., "vs last month"
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, change, changePeriod }) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 shadow-custom-light flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-montserrat font-semibold text-text-secondary">{title}</h3>
        <p className="text-3xl font-montserrat font-bold text-text-primary mt-2">{value}</p>
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-4 text-xs font-open-sans">
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
          {changePeriod && <span className="text-text-secondary ml-2">{changePeriod}</span>}
        </div>
      )}
    </div>
  );
};
