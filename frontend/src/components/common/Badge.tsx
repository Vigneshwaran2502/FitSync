import React from 'react';
import { TIER_BADGE_STYLES } from '../../styles/themeTokens';

interface BadgeProps {
  status: 'active' | 'inactive' | 'expired' | 'frozen' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected' | 'present' | 'checked_out' | 'achieved' | 'basic' | 'standard' | 'pro' | 'premium' | 'elite' | 'vip' | string;
  label?: string;
  size?: 'sm' | 'md';
  variant?: 'status' | 'tier';
}

export const Badge: React.FC<BadgeProps> = ({ status, label, size = 'sm', variant = 'status' }) => {
  const norm = status?.toLowerCase() || '';

  // Tier-based badge
  if (variant === 'tier' || TIER_BADGE_STYLES[norm]) {
    const tierStyle = TIER_BADGE_STYLES[norm] || TIER_BADGE_STYLES.standard;
    const displayText = label || (status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '));
    const pad = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} ${pad} whitespace-nowrap shadow-2xs`}
      >
        <span>{displayText}</span>
      </span>
    );
  }

  // Status-based badge
  let dotColor = 'bg-slate-400';
  let textColor = 'text-[#686476] dark:text-slate-300';
  let bgColor = 'bg-slate-100/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700';

  if (['active', 'confirmed', 'completed', 'present', 'achieved'].includes(norm)) {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-700 dark:text-emerald-300';
    bgColor = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60';
  } else if (['pending', 'frozen'].includes(norm)) {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-700 dark:text-amber-300';
    bgColor = 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60';
  } else if (['inactive', 'expired', 'cancelled', 'rejected'].includes(norm)) {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-700 dark:text-rose-300';
    bgColor = 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60';
  } else if (norm === 'checked_out') {
    dotColor = 'bg-purple-500';
    textColor = 'text-purple-700 dark:text-purple-300';
    bgColor = 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60';
  }

  const displayText = label || (status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '));
  const pad = size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider border rounded-full ${bgColor} ${textColor} ${pad} whitespace-nowrap shadow-2xs`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{displayText}</span>
    </span>
  );
};
