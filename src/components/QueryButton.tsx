
import React from 'react';

interface QueryButtonProps {
  text: string;
  onClick: () => void;
}

const QueryButton: React.FC<QueryButtonProps> = ({ text, onClick }) => {
  return (
    <button
      className="viz-button-secondary text-sm w-full text-left justify-start hover:translate-y-[-2px] hover:shadow-md transition-all duration-300"
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default QueryButton;
