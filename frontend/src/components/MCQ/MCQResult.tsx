import React from 'react';
import { MCQEvaluation } from '../../types';
import './MCQResult.css';

interface MCQResultProps {
  evaluation: MCQEvaluation;
}

const MCQResult: React.FC<MCQResultProps> = ({ evaluation }) => {
  const { score, total, percentage, results } = evaluation;
  
  // Determine the score category for styling
  const getScoreCategory = () => {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  };

  return (
    <div className="mcq-result">
      <div className={`score-summary ${getScoreCategory()}`}>
        <div className="score-display">
          <span className="score">{score}</span>
          <span className="total">/{total}</span>
        </div>
        <div className="percentage">{percentage}%</div>
        <div className="score-message">
          {percentage >= 80 && 'Excellent work!'}
          {percentage >= 60 && percentage < 80 && 'Good job!'}
          {percentage >= 40 && percentage < 60 && 'Not bad, keep practicing!'}
          {percentage < 40 && 'Keep studying, you can do better!'}
        </div>
      </div>
      
      <div className="results-breakdown">
        <h3>Question Breakdown</h3>
        {results.map((result, index) => {
          // Transform answer IDs to the actual text values
          // For example, if answer is "a", convert to the actual option text
          const userAnswerText = result.userAnswer;
          const correctAnswerText = result.correctAnswer;
          
          return (
            <div 
              key={index} 
              className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="question-text">
                <span className="question-number">Q{index + 1}:</span> {result.question}
              </div>
              <div className="answer-info">
                <div className="user-answer">
                  <span className="label">Your answer:</span> 
                  <span className="answer-text">{userAnswerText}</span>
                </div>
                {!result.isCorrect && (
                  <div className="correct-answer">
                    <span className="label">Correct answer:</span> 
                    <span className="answer-text">{correctAnswerText}</span>
                  </div>
                )}
              </div>
              {result.explanation && (
                <div className="explanation">
                  <span className="label">Explanation:</span> {result.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MCQResult;