export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Extended Message type that can include MCQ quiz data
export interface MCQMessage extends Message {
  mcqQuiz?: MCQQuiz;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: (Message | MCQMessage)[];
}

export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  correctAnswerId?: string;
  explanation?: string;
}

export interface MCQQuiz {
  id: string;
  topic: string;
  questions: MCQQuestion[];
}

export interface MCQSubmission {
  questionId: string;
  selectedOptionId: string;
  question: MCQQuestion; // Add the full question object
}

export interface MCQResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface MCQEvaluation {
  score: number;
  total: number;
  percentage: number;
  results: MCQResult[];
}