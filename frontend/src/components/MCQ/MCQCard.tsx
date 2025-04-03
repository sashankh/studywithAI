import React, { useState, useRef } from 'react';
import { MCQQuiz, MCQSubmission, MCQEvaluation } from '../../types';
import MCQQuestion from './MCQQuestion';
import MCQResult from './MCQResult';
import { submitMCQAnswers } from '../../services/api';
import './MCQCard.css';

interface MCQCardProps {
  quiz: MCQQuiz;
  onComplete?: () => void; // Callback for when quiz is completed
  initiallyMinimized?: boolean;
}

const MCQCard: React.FC<MCQCardProps> = ({ 
  quiz, 
  onComplete,
  initiallyMinimized = false
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<MCQEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(initiallyMinimized);
  
  // Use a ref to track if completion has been signaled to prevent multiple calls
  const completionSignaled = useRef(false);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    // Check if all questions have been answered
    const allAnswered = quiz.questions.every(
      (question) => selectedOptions[question.id]
    );

    if (!allAnswered) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare submission data
      const submissions: MCQSubmission[] = quiz.questions.map((question) => ({
        questionId: question.id,
        selectedOptionId: selectedOptions[question.id],
        question: question // Include the full question object
      }));

      // Submit answers to the API
      const result = await submitMCQAnswers(submissions);
      setEvaluation(result);
      
      // Signal completion only once
      if (onComplete && !completionSignaled.current) {
        completionSignaled.current = true;
        // Small delay to ensure UI updates before signaling completion
        setTimeout(() => onComplete(), 100);
      }
    } catch (error) {
      console.error('Failed to submit MCQ answers:', error);
      alert('Failed to submit answers. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip quiz function
  const handleSkipQuiz = () => {
    if (onComplete && !completionSignaled.current) {
      completionSignaled.current = true;
      onComplete();
    }
    setIsMinimized(true);
  };

  // If we have evaluation results, show the results component
  if (evaluation) {
    return (
      <div className={`mcq-card ${isMinimized ? 'minimized' : ''}`}>
        {isMinimized ? (
          <div className="minimized-results">
            <h3 className="mcq-title-minimized">
              Quiz Results: {quiz.topic} - Score: {evaluation.score}/{evaluation.total} ({evaluation.percentage}%)
              <button 
                className="expand-button"
                onClick={() => setIsMinimized(false)}
              >
                Show Details
              </button>
            </h3>
          </div>
        ) : (
          <>
            <h2 className="mcq-title">Quiz Results: {quiz.topic}</h2>
            <MCQResult evaluation={evaluation} />
            <div className="button-container">
              <button 
                className="retry-button"
                onClick={() => {
                  setEvaluation(null);
                  setSelectedOptions({});
                }}
              >
                Retry Quiz
              </button>
              <button 
                className="minimize-button"
                onClick={() => setIsMinimized(true)}
              >
                Minimize Results
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mcq-card">
      <h2 className="mcq-title">Quiz: {quiz.topic}</h2>
      {quiz.questions.map((question) => (
        <MCQQuestion
          key={question.id}
          question={question}
          selectedOptionId={selectedOptions[question.id] || null}
          onSelectOption={handleSelectOption}
          disabled={isSubmitting}
          showResult={false}
        />
      ))}
      <div className="button-container">
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answers'}
        </button>
        {/* Allow user to skip quiz */}
        <button 
          className="skip-button"
          onClick={handleSkipQuiz}
          disabled={isSubmitting}
        >
          Skip Quiz
        </button>
      </div>
    </div>
  );
};

export default MCQCard;