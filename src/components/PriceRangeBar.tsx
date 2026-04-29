import React from 'react';
import { cn } from '../lib/utils';

interface PriceRangeBarProps {
  low: number;
  high: number;
  current: number;
  className?: string;
}

export const PriceRangeBar: React.FC<PriceRangeBarProps> = ({ low, high, current, className }) => {
  const range = high - low;
  const percentage = range > 0 ? ((current - low) / range) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn("flex flex-col gap-1 w-full min-w-[100px]", className)}>
      <div className="flex justify-between text-[9px] font-bold text-slate-400 tabular-nums uppercase tracking-tighter">
        <span>{low.toLocaleString()}</span>
        <span>{high.toLocaleString()}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full relative overflow-visible">
        <div 
          className="absolute h-full bg-slate-300 rounded-full" 
          style={{ width: '100%' }} 
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3 bg-blue-600 rounded-full border border-white shadow-sm transition-all duration-500 ease-out z-10"
          style={{ left: `calc(${clampedPercentage}% - 3px)` }}
        />
      </div>
      <div className="text-right text-[9px] font-black text-blue-600 tabular-nums">
        {clampedPercentage.toFixed(1)}%
      </div>
    </div>
  );
};
