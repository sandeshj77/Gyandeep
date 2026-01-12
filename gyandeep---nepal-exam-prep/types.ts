
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Question {
  id: string;
  category: string;
  subCategory?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0-3
  explanation: string;
  hint?: string;
  difficulty: Difficulty;
  reference?: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number | null; // null if skipped
  timeTaken: number; // seconds
}

export interface QuizResult {
  id: string;
  quizId: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpent: number;
  date: string;
  answers: UserAnswer[];
}

export interface UserProfile {
  name: string;
  email: string;
  examPreference: string;
  totalQuizzes: number;
  accuracy: number;
  rank: number;
  streak: number;
  maxStreak: number;
  badges: string[];
  isAdmin: boolean;
  timeSpent: number; // In minutes
  lastActive: string;
}

export interface AIAnalysisReport {
  strengths: string[];
  weaknesses: string[];
  patterns: string[];
  timeManagement: string;
  actionPlan: string[];
  motivationalMessage: string;
}

export interface QuizSettings {
  questionsPerQuiz: number;
  timeLimitPerQuestion: number; // in seconds
  showTimer: boolean;
}
