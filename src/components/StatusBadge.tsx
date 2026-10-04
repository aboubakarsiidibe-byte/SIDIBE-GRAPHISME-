import React from 'react';
import { TaskStatus } from '../types';
import { Clock, Play, UserCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
  onClick?: () => void;
  interactive?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  onClick,
  interactive = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'À faire':
        return {
          icon: Clock,
          classes: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
          dot: 'bg-zinc-400',
        };
      case 'En cours':
        return {
          icon: Play,
          classes: 'bg-blue-950/60 text-blue-300 border-blue-700/50',
          dot: 'bg-blue-400 animate-pulse',
        };
      case 'En attente de validation client':
        return {
          icon: UserCheck,
          classes: 'bg-amber-950/60 text-amber-300 border-amber-700/50',
          dot: 'bg-amber-400',
        };
      case 'En révision':
        return {
          icon: RefreshCw,
          classes: 'bg-purple-950/60 text-purple-300 border-purple-700/50',
          dot: 'bg-purple-400',
        };
      case 'Terminé':
        return {
          icon: CheckCircle2,
          classes: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
          dot: 'bg-emerald-400',
        };
      default:
        return {
          icon: Clock,
          classes: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          dot: 'bg-zinc-400',
        };
    }
  };

  const { icon: Icon, classes, dot } = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      id={`status-badge-${status.replace(/\s+/g, '-').toLowerCase()}`}
      onClick={onClick}
      className={`inline-flex items-center rounded-full border whitespace-nowrap transition-colors ${classes} ${sizeClasses} ${
        interactive ? 'cursor-pointer hover:brightness-110 shadow-sm' : ''
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
