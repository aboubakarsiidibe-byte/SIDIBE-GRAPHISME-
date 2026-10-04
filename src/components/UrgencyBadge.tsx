import React from 'react';
import { CalculatedUrgency } from '../types';
import { AlertCircle, Flame, AlertTriangle, ShieldCheck } from 'lucide-react';

interface UrgencyBadgeProps {
  urgency: CalculatedUrgency;
  showScore?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, showScore = true }) => {
  const getIcon = () => {
    switch (urgency.level) {
      case 'Critique':
        return Flame;
      case 'Haute':
        return AlertCircle;
      case 'Modérée':
        return AlertTriangle;
      case 'Faible':
      default:
        return ShieldCheck;
    }
  };

  const Icon = getIcon();

  return (
    <div
      title={urgency.reason}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${urgency.badgeColor}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{urgency.level}</span>
      {showScore && urgency.score > 0 && (
        <span className="opacity-80 font-mono text-[10px] px-1 py-0.2 rounded bg-black/30">
          {urgency.score}/100
        </span>
      )}
    </div>
  );
};
