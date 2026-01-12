
import { GoogleGenAI, Type } from "@google/genai";
import { Question, UserAnswer, AIAnalysisReport, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePerformance = async (
  questions: Question[],
  userAnswers: UserAnswer[]
): Promise<AIAnalysisReport | null> => {
  const performanceData = userAnswers.map((ua) => {
    const q = questions.find(item => item.id === ua.questionId);
    return {
      question: q?.question,
      category: q?.category,
      difficulty: q?.difficulty,
      isCorrect: ua.selectedOption === q?.correctAnswer,
      timeTaken: ua.timeTaken,
      skipped: ua.selectedOption === null
    };
  });

  const prompt = `Analyze the following Nepal competitive exam performance data and provide a detailed study report. 
  Data: ${JSON.stringify(performanceData)}
  Provide the analysis in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeManagement: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivationalMessage: { type: Type.STRING }
          },
          required: ["strengths", "weaknesses", "patterns", "timeManagement", "actionPlan", "motivationalMessage"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};

export const generateAIQuestions = async (
  topic: string,
  count: number = 5,
  difficulty: Difficulty = 'Medium'
): Promise<Question[]> => {
  const prompt = `Generate ${count} Multiple Choice Questions for a Nepal competitive exam (like Loksewa Aayog) about the topic: "${topic}". 
  The questions should be in the specified difficulty: ${difficulty}. 
  Include questions in both English and Nepali (Devanagari) where appropriate.
  Output in strictly valid JSON format matching the GyanDeep schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { type: Type.INTEGER, description: "Index 0-3" },
              explanation: { type: Type.STRING },
              hint: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              category: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation", "difficulty"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((r: any) => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9),
      category: r.category || topic.toLowerCase().replace(/\s+/g, '_')
    }));
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};
