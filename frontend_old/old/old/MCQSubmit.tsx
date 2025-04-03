import React from 'react';
import { useChat } from '../hooks/useChat';
import '../assets/styles/MCQ.css';

const MCQSubmit: React.FC = () => {
  const { mcqAnswers, activeMCQ, submitMCQAnswers, loading } = useChat();
  
  // Check if all questions have been answered
  const allAnswered = mcqAnswers.every((answer: string) => answer !== '');
  const questionCount = activeMCQ ? activeMCQ.length : 0;
  const answeredCount = mcqAnswers.filter((answer: string) => answer !== '').length;
  
  return (
    <div className="mcq-submit">
      <div className="mcq-progress">
        {answeredCount} of {questionCount} questions answered
      </div>
      
      <button
        className="mcq-submit-button"
        onClick={submitMCQAnswers}
        disabled={!allAnswered || loading}
      >
        {loading ? 'Submitting...' : allAnswered ? 'Submit Answers' : 'Answer All Questions To Submit'}
      </button>
    </div>
  );
};

export default MCQSubmit;