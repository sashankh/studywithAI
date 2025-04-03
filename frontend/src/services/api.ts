import { Message, MCQQuiz, MCQEvaluation, MCQSubmission } from '../types';

const API_URL = '/api'; // Update with your actual API URL if needed

export async function sendMessage(message: string): Promise<Message> {
  try {
    console.log(`Sending message to ${API_URL}/chat:`, message);
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      throw new Error('Failed to send message');
    }
    
    const data = await response.json();
    console.log('Received response:', data);
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function requestMCQs(topic: string, numQuestions: number = 4): Promise<MCQQuiz> {
  try {
    console.log(`Requesting MCQs from ${API_URL}/mcq/generate:`, { topic, numQuestions });
    const response = await fetch(`${API_URL}/mcq/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, num_questions: numQuestions }),
    });
    
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      throw new Error('Failed to get MCQs');
    }
    
    const data = await response.json();
    console.log('Received MCQs:', data);
    return data;
  } catch (error) {
    console.error('Error getting MCQs:', error);
    throw error;
  }
}

export async function submitMCQAnswers(submissions: MCQSubmission[]): Promise<MCQEvaluation> {
  try {
    // Extract the proper data for submission to backend
    const formattedQuestions = submissions.map(submission => {
      // Get the question data
      const question = submission.question;
      
      // Convert options from array to object format expected by backend
      const optionsObj: Record<string, string> = {};
      question.options.forEach(option => {
        optionsObj[option.id] = option.text;
      });
      
      // Return the formatted question object
      return {
        question: question.question,
        options: optionsObj,
        correct_answer: question.correctAnswerId,
        explanation: question.explanation
      };
    });
    
    // Extract selected option IDs and create a mapping of option IDs to their text values
    const answers = submissions.map(s => s.selectedOptionId);
    
    // Create a mapping to help translate option IDs back to text values
    const optionMappings = submissions.map(submission => {
      const optionTextMap: Record<string, string> = {};
      submission.question.options.forEach(option => {
        optionTextMap[option.id] = option.text;
      });
      
      return {
        questionId: submission.questionId,
        selectedOptionId: submission.selectedOptionId,
        selectedOptionText: optionTextMap[submission.selectedOptionId] || "Unknown option",
        correctOptionId: submission.question.correctAnswerId,
        correctOptionText: optionTextMap[submission.question.correctAnswerId || ""] || "Unknown option"
      };
    });
    
    console.log(`Submitting MCQ answers to ${API_URL}/mcq/evaluate:`, {
      questions: formattedQuestions,
      answers,
      optionMappings
    });
    
    const response = await fetch(`${API_URL}/mcq/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        questions: formattedQuestions, 
        answers,
        optionMappings
      }),
    });
    
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      throw new Error('Failed to submit MCQ answers');
    }
    
    const data = await response.json();
    console.log('Received evaluation:', data);
    
    // Transform option IDs to text in the results if needed
    if (data.results) {
      data.results = data.results.map((result: any, index: number) => {
        // If userAnswer or correctAnswer are just IDs, replace with the text values
        if (optionMappings[index]) {
          const mapping = optionMappings[index];
          
          if (!result.userAnswer || result.userAnswer.length <= 2) {
            result.userAnswer = mapping.selectedOptionText;
          }
          
          if (!result.correctAnswer || result.correctAnswer.length <= 2) {
            result.correctAnswer = mapping.correctOptionText;
          }
        }
        
        // Fix property naming issue - ensure isCorrect is properly set
        // Backend might be using is_correct (snake_case) while frontend expects isCorrect (camelCase)
        if (result.is_correct !== undefined && result.isCorrect === undefined) {
          result.isCorrect = result.is_correct;
        }
        
        // Double check the boolean value to ensure it's actually a boolean
        if (typeof result.isCorrect === 'string') {
          result.isCorrect = result.isCorrect.toLowerCase() === 'true';
        }
        
        return result;
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting MCQ answers:', error);
    throw error;
  }
}