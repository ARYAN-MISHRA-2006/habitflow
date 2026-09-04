import { Habit, HabitLog, UserInsight } from '../types';
import { generateUserInsights } from '../utils/insightsGenerator';

export interface AIInsightRequest {
  habits: Habit[];
  logs: HabitLog[];
  userGoalSummary?: string;
}

export async function fetchAIInsights(request: AIInsightRequest): Promise<{ insights: UserInsight[]; aiAnalysisText: string }> {
  // Generate empirical data insights
  const baseInsights = generateUserInsights(request.habits, request.logs);

  // Modular AI Service layer - ready to connect to Google Gemini / Supabase Edge Functions
  // Simulated intelligent analysis fallback
  const totalHabits = request.habits.length;
  const completedLogsCount = request.logs.filter(l => l.completed).length;

  const aiAnalysisText = `Based on your ${completedLogsCount} total completed activities across ${totalHabits} habits:

• Strongest Category: Your health & study habits demonstrate highest resilience.
• Weekly Rhythm: Mid-week momentum is strong, with Friday evenings showing minor drops.
• Recommendation: Stagger hard cognitive habits (e.g. DSA Practice) early in the day, leaving lighter wellness habits (e.g. Meditate, Water) for the evening.`;

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        insights: baseInsights,
        aiAnalysisText,
      });
    }, 600);
  });
}
