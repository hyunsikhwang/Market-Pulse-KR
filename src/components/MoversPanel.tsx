import React from 'react';
import { StockData } from '../types';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MoversPanelProps {
  title: string;
  data: StockData[];
  type: 'gainers' | 'losers';
}

export const MoversPanel: React.FC<MoversPanelProps> = ({ title, data, type }) => {
  const Icon = type === 'gainers' ? TrendingUp : TrendingDown;
  const colorClass = type === 'gainers' ? 'text-rose-600' : 'text-blue-600';
  const bgClass = type === 'gainers' ? 'bg-rose-50' : 'bg-blue-50';

  return (
    <div className="glass-card flex flex-col">
      <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
          {title}
        </h3>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", type === 'gainers' ? 'text-red-500' : 'text-blue-500')}>
          {type === 'gainers' ? 'GAINING' : 'LOSING'}
        </span>
      </div>
      <div className="p-2 flex-grow">
        {data.length === 0 ? (
          <div className="p-4 text-center text-[10px] uppercase font-bold text-slate-300 tracking-wider">No Data</div>
        ) : (
          data.slice(0, 5).map((item, idx) => (
            <div key={item.itemcode} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
              <span className="text-xs font-semibold text-slate-700 flex-grow ml-3 truncate">{item.itemname}</span>
              <span className={cn("text-xs font-bold tabular-nums", type === 'gainers' ? 'text-red-600' : 'text-blue-600')}>
                {(item.changeRate ?? 0) > 0 ? '+' : ''}{(item.changeRate ?? 0).toFixed(2)}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
