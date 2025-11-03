import { GoogleGenAI } from "@google/genai";
import { DashboardData } from '../types';

// Fix: Check if API_KEY is defined before initializing
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("API_KEY environment variable not set.");
}

// Fix: Initialize GoogleGenAI with the apiKey
const ai = new GoogleGenAI({ apiKey: apiKey! });
const model = "gemini-2.5-flash";

export const getAIInsights = async (
    dashboardData: DashboardData, 
    topic: 'overloaded' | 'underutilized' | 'risky_projects' | 'slack_message' | 'general_summary',
    extraContext?: any
): Promise<string> => {
    
    const stringifiedData = JSON.stringify({
        employees: dashboardData.employees.map(e => ({
            name: e.name,
            occupancyRate: e.occupancyRate,
            balanceHours: e.balanceHours,
            lastWeekDailyAverage: e.lastWeekDailyAverage
        })),
        projects: dashboardData.projects.map(p => ({
            name: p.name,
            status: p.status,
            progress: p.progress,
            teamSize: p.team.length
        }))
    });

    let prompt = `
        Eres un asistente de gestión de proyectos analizando datos de un dashboard.
        Los datos son: ${stringifiedData}.
        Responde en español, de forma concisa y profesional. No uses Markdown.
    `;
    
    switch (topic) {
        case 'overloaded':
            prompt += "Identifica los 3 empleados con mayor riesgo de sobrecarga (mayor tasa de ocupación y promedio de horas diario). Sugiere una acción para cada uno.";
            break;
        case 'underutilized':
            prompt += "Identifica los 3 empleados más infrautilizados (menor tasa de ocupación y balance de horas positivo). Sugiere cómo reasignarlos.";
            break;
        case 'risky_projects':
            prompt += "Identifica los 3 proyectos con más riesgo (estado 'En Riesgo' o 'Retrasado' y bajo progreso). Sugiere una acción prioritaria para cada uno.";
            break;
        case 'slack_message':
            prompt += `Redacta un mensaje de Slack amigable y profesional para ${extraContext?.employeeName} preguntando cómo va su semana y si necesita ayuda, ya que sus horas registradas son ${extraContext?.workload > 8 ? 'altas' : 'bajas'} (${extraContext?.workload.toFixed(1)}h/día en promedio).`;
            break;
        case 'general_summary':
        default:
            prompt += "Proporciona un resumen ejecutivo de 2-3 frases sobre la salud general del equipo y los proyectos.";
            break;
    }

    try {
        // Fix: Use ai.models.generateContent to call the Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        // Fix: Extract text from response using the .text property
        return response.text;
    } catch (error) {
        console.error("Error fetching AI insights:", error);
        return "Hubo un error al contactar a la IA. Por favor, inténtalo de nuevo más tarde.";
    }
};
