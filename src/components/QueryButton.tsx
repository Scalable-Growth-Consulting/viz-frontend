
import React from 'react';

interface QueryButtonProps {
  text: string;
  onClick: (text: string) => void;
  disabled?: boolean;
}

const QueryButton: React.FC<QueryButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button
      className={`relative overflow-hidden group px-4 py-3 rounded-xl text-sm text-left text-slate-700 dark:text-slate-200 
        border border-slate-200 dark:border-viz-light/30 bg-white/70 dark:bg-viz-light/10 backdrop-blur-sm
        hover:border-viz-accent/50 dark:hover:border-viz-accent/40 hover:shadow-md hover:shadow-viz-accent/5
        transition-all duration-300 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
      onClick={() => !disabled && onClick(text)}
      disabled={disabled}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-viz-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      <p className="relative z-10">{text}</p>
    </button>
  );
};

export default QueryButton;
