export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  evaluation?: MCQEvaluation;
  isStatusMessage?: boolean;  // Indicates if this is a status message like "Thinking..." or "Generating questions..."
  mcq?: MCQQuestion[];  // Adding mcq property for multiple-choice questions
}

export interface MCQOption {
  [key: string]: string;
}

export interface MCQQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}

export interface MCQResult {
  question: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

export interface MCQEvaluation {
  score: number;
  total: number;
  percentage: number;
  results: MCQResult[];
}

export interface ChatResponse {
  message: string;
  requires_mcq: boolean;
  mcq_topic?: string;
}