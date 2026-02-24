import React from 'react';
import { validatePasswordStrength, PasswordStrength } from '@/utils/security';
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showFeedback?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showFeedback = true,
}) => {
  const strength: PasswordStrength = validatePasswordStrength(password);

  const getStrengthColor = (score: number): string => {
    if (score === 0) return 'bg-gray-300 dark:bg-gray-600';
    if (score === 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number): string => {
    if (score === 0) return 'No password';
    if (score === 1) return 'Very weak';
    if (score === 2) return 'Weak';
    if (score === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthIcon = (score: number) => {
    if (score === 0) return <Shield className="w-4 h-4 text-gray-400" />;
    if (score <= 2) return <ShieldX className="w-4 h-4 text-red-500" />;
    if (score === 3) return <ShieldAlert className="w-4 h-4 text-yellow-500" />;
    return <ShieldCheck className="w-4 h-4 text-green-500" />;
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        {getStrengthIcon(strength.score)}
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 4) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 min-w-[70px]">
          {getStrengthText(strength.score)}
        </span>
      </div>

      {/* Feedback */}
      {showFeedback && strength.feedback.length > 0 && (
        <ul className="space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Success message */}
      {strength.isValid && (
        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Password meets all requirements
        </p>
      )}
    </div>
  );
};
