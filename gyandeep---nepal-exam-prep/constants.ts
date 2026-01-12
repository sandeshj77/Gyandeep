
import { Question, Difficulty, QuizSettings } from './types';

export const EXAM_CATEGORIES = [
  { id: 'loksewa', name: 'लोकसेवा तयारी (Loksewa)', icon: '📜' },
  { id: 'banking', name: 'Banking & Finance', icon: '🏦' },
  { id: 'english', name: 'English Grammar', icon: '📖' },
  { id: 'gk', name: 'सामान्य ज्ञान (GK)', icon: '🌍' },
  { id: 'iq', name: 'IQ & Reasoning', icon: '🧩' },
  { id: 'math', name: 'Math / Quantitative', icon: '🔢' },
  { id: 'current_affairs', name: 'Current Affairs', icon: '📰' },
];

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  questionsPerQuiz: 10,
  timeLimitPerQuestion: 30,
  showTimer: true
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    category: 'gk',
    question: 'Where is the birthplace of Gautama Buddha?',
    options: ['Sarnath, India', 'Lumbini, Nepal', 'Bodh Gaya, India', 'Kushinagar, India'],
    correctAnswer: 1,
    explanation: 'Siddhartha Gautama, the Lord Buddha, was born in 623 B.C. in the famous gardens of Lumbini, which soon became a place of pilgrimage.',
    difficulty: 'Easy',
    hint: 'It is a UNESCO World Heritage Site in the Rupandehi District.'
  },
  {
    id: 'n1',
    category: 'gk',
    question: 'नेपालको सबैभन्दा लामो नदी कुन हो?',
    options: ['कोशी', 'गण्डकी', 'कर्णाली', 'बागमती'],
    correctAnswer: 2,
    explanation: 'कर्णाली नेपालको सबैभन्दा लामो नदी हो।',
    difficulty: 'Easy'
  },
  {
    id: '3',
    category: 'loksewa',
    question: 'नेपालको वर्तमान संविधान कहिले जारी भएको हो?',
    options: ['२०७२ असोज ३', '२०७० माघ १', '२०७२ भदौ १', '२०७३ असोज ३'],
    correctAnswer: 0,
    explanation: 'नेपालको संविधान २०७२ साल असोज ३ गते जारी भएको हो।',
    difficulty: 'Medium'
  },
  {
    id: '4',
    category: 'iq',
    question: 'If CAT is coded as 3120, how is DOG coded?',
    options: ['4157', '4151', '5168', '3157'],
    correctAnswer: 0,
    explanation: 'C=3, A=1, T=20. Similarly, D=4, O=15, G=7. So, DOG = 4157.',
    difficulty: 'Medium'
  }
];

export const MOTIVATIONAL_QUOTES = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Loksewa is not just a job, it's a service to the nation. Keep pushing!",
  "मिहिनेत नै सफलताको कडी हो।",
  "Your dedication today determines your rank tomorrow.",
  "लक्ष्यमा पुग्न निरन्तर प्रयास आवश्यक छ।"
];
