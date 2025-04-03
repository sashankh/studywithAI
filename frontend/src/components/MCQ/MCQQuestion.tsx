import React from 'react';
import { MCQQuestion as MCQQuestionType } from '../../types';
import MCQOption from './MCQOption';
import './MCQQuestion.css';

interface MCQQuestionProps {
  question: MCQQuestionType;
  selectedOptionId: string | null;
  onSelectOption: (questionId: string, optionId: string) => void;
  disabled: boolean;
  showResult?: boolean;
}

const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  selectedOptionId,
  onSelectOption,
  disabled,
  showResult = false,
}) => {
  return (
    <div className="mcq-question">
      <h3 className="question-text">{question.question}</h3>
      <div className="options-container">
        {question.options.map((option) => (
          <MCQOption
            key={option.id}
            option={option}
            questionId={question.id}
            selectedOptionId={selectedOptionId}
            onSelect={onSelectOption}
            disabled={disabled}
            correct={showResult && option.id === question.correctAnswerId}
            showResult={showResult}
          />
        ))}
      </div>
      {showResult && question.explanation && (
        <div className="explanation">
          <h4>Explanation:</h4>
          <p>{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default MCQQuestion;