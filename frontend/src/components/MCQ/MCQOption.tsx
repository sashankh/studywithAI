import React from 'react';
import { MCQOption as MCQOptionType } from '../../types';
import './MCQOption.css';

interface MCQOptionProps {
  option: MCQOptionType;
  questionId: string;
  selectedOptionId: string | null;
  onSelect: (questionId: string, optionId: string) => void;
  disabled: boolean;
  correct?: boolean;
  showResult?: boolean;
}

const MCQOption: React.FC<MCQOptionProps> = ({
  option,
  questionId,
  selectedOptionId,
  onSelect,
  disabled,
  correct,
  showResult,
}) => {
  const isSelected = selectedOptionId === option.id;
  const getClassName = () => {
    if (!showResult) return '';
    if (isSelected && correct) return 'correct';
    if (isSelected && !correct) return 'incorrect';
    if (!isSelected && correct) return 'correct';
    return '';
  };

  return (
    <div className={`mcq-option ${getClassName()}`}>
      <label>
        <input
          type="radio"
          name={`question-${questionId}`}
          checked={isSelected}
          onChange={() => onSelect(questionId, option.id)}
          disabled={disabled}
        />
        <span className="option-text">{option.text}</span>
        {showResult && correct && <span className="correct-indicator">✓</span>}
        {showResult && isSelected && !correct && <span className="incorrect-indicator">✗</span>}
      </label>
    </div>
  );
};

export default MCQOption;