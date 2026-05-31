import React, { useState, useEffect } from 'react';
import { StockData } from '../types';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MoversPanelProps {
  title: string;
  data: StockData[];
  type: 'gainers' | 'losers';
  onStockClick?: (stock: StockData) => void;
}

export const MoversPanel: React.FC<MoversPanelProps> = ({ title, data, type, onStockClick }) => {
  const Icon = type === 'gainers' ? TrendingUp : TrendingDown;
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(0);
  }, [data.length]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden justify-between">
      <div>
        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between select-none">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Icon size={14} className={type === 'gainers' ? 'text-rose-500' : 'text-blue-500'} />
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 tabular-nums">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-1 hover:bg-slate-200/60 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-600 inline-flex items-center justify-center"
                >
                  <ChevronLeft size={12} />
                </button>
                <span>
                  {currentPage + 1}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-1 hover:bg-slate-200/60 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-600 inline-flex items-center justify-center"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", type === 'gainers' ? 'text-red-500' : 'text-blue-500')}>
              {type === 'gainers' ? 'GAINING' : 'LOSING'}
            </span>
          </div>
        </div>
        <div className="p-2 h-[180px] overflow-hidden">
          {data.length === 0 ? (
            <div className="p-4 text-center text-[10px] uppercase font-bold text-slate-300 tracking-wider">No Data</div>
          ) : (
            visibleData.map((item, idx) => {
              const globalIndex = startIndex + idx;
              return (
                <div 
                  key={item.itemcode} 
                  onClick={() => onStockClick?.(item)}
                  className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-slate-400 w-4">{globalIndex + 1}</span>
                    <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600 transition-colors">{item.itemname}</span>
                  </div>
                  <span className={cn("text-xs font-bold tabular-nums ml-2 shrink-0", type === 'gainers' ? 'text-red-600' : 'text-blue-600')}>
                    {(item.changeRate ?? 0) > 0 ? '+' : ''}{(item.changeRate ?? 0).toFixed(2)}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
