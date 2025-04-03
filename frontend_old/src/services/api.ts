import { ChatResponse, MCQQuestion, MCQEvaluation } from '../types/chat';

// Use import.meta.env correctly for Vite environment variables
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

export const getChatResponse = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw error;
  }
};

export const generateMCQs = async (topic: string): Promise<{questions: MCQQuestion[]}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-mcqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating MCQs:', error);
    throw error;
  }
};

export const evaluateMCQs = async (
  questions: MCQQuestion[],
  userAnswers: string[]
): Promise<MCQEvaluation> => {
  try {
    const response = await fetch(`${API_BASE_URL}/evaluate-mcqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questions, answers: userAnswers }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error evaluating MCQs:', error);
    throw error;
  }
};