import React, { useState, useCallback } from 'react';
import { getAIInsights } from '../services/geminiService';
import { DashboardData } from '../types';
import { SparklesIcon } from './Icons';

interface AIInsightsProps {
  dashboardData: DashboardData;
}

const AIInsights: React.FC<AIInsightsProps> = ({ dashboardData }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const fetchInsight = useCallback(async (topic: 'overloaded' | 'underutilized' | 'risky_projects' | 'general_summary') => {
    setIsLoading(true);
    setActiveTopic(topic);
    try {
      const result = await getAIInsights(dashboardData, topic);
      setInsight(result);
    } catch (error) {
      console.error('Failed to get AI insight:', error);
      setInsight('Error al generar el análisis. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [dashboardData]);
  
  const insightOptions = [
      { key: 'general_summary', label: 'Resumen General' },
      { key: 'risky_projects', label: 'Proyectos en Riesgo' },
      { key: 'overloaded', label: 'Equipos Sobrecargados' },
      { key: 'underutilized', label: 'Equipos Infrautilizados' },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-custom-medium">
      <h2 className="text-xl font-montserrat font-bold text-text-primary flex items-center gap-3">
        <SparklesIcon className="w-6 h-6 text-primary" />
        Análisis con IA
      </h2>
      
      <div className="flex flex-wrap gap-3 my-4">
        {insightOptions.map(opt => (
            <button
                key={opt.key}
                onClick={() => fetchInsight(opt.key as any)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg font-montserrat font-semibold transition-all duration-200
                    ${activeTopic === opt.key ? 'bg-gradient-primary text-white shadow-custom-medium' : 'bg-background hover:bg-neutral-100 text-text-primary border border-border'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {opt.label}
            </button>
        ))}
      </div>
      
      <div className="bg-background rounded-lg p-4 min-h-[100px] text-sm text-text-primary font-open-sans border border-border">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-3 text-text-secondary">Analizando...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{insight || 'Selecciona un tema para obtener un análisis de la IA.'}</p>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
