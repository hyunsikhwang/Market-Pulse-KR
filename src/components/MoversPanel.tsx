import React, { useState, useEffect } from 'react';
import { StockData } from '../types';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MoversPanelProps {
  title: string;
  data: StockData[];
  type: 'gainers' | 'losers';
  onStockClick?: (stock: StockData) => void;
  topN?: number;
  onTopNChange?: (n: number) => void;
}

export const MoversPanel: React.FC<MoversPanelProps> = ({ title, data, type, onStockClick, topN, onTopNChange }) => {
  const Icon = type === 'gainers' ? TrendingUp : TrendingDown;
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 50;

  useEffect(() => {
    setCurrentPage(0);
  }, [data.length]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    if (isSwipe) {
      if (distance > 0) {
        // Swiped Left -> go to Next page
        if (currentPage < totalPages - 1) {
          setCurrentPage(prev => prev + 1);
        }
      } else {
        // Swiped Right -> go to Prev page
        if (currentPage > 0) {
          setCurrentPage(prev => prev - 1);
        }
      }
    }
    // Reset
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden justify-between">
      <div>
        <div className="px-3.5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Icon size={14} className={type === 'gainers' ? 'text-rose-500' : 'text-blue-500'} />
              {title}
            </h3>
            {onTopNChange && typeof topN === 'number' && (
              <span className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md border border-slate-200/55 ml-1">
                {[5, 10, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => onTopNChange(num)}
                    className={cn(
                      "px-1.5 py-0.5 text-[9px] font-black rounded transition-all active:scale-95 cursor-pointer",
                      topN === num
                        ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/40"
                        : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 tabular-nums bg-slate-100/50 px-1.5 py-0.5 rounded-md">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-0.5 hover:bg-slate-200/60 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-600 inline-flex items-center justify-center"
                >
                  <ChevronLeft size={10} />
                </button>
                <span className="px-0.5">
                  {currentPage + 1}/{totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-0.5 hover:bg-slate-200/60 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-600 inline-flex items-center justify-center"
                >
                  <ChevronRight size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div 
          className="p-2 h-[180px] overflow-hidden touch-pan-y select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
