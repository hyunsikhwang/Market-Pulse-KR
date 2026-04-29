import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Info, BarChart2, DollarSign, PieChart } from 'lucide-react';
import { StockData } from '../types';
import { cn, formatNumber, formatPrice } from '../lib/utils';
import { PriceRangeBar } from './PriceRangeBar';

interface StockDetailModalProps {
  stock: StockData | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  if (!stock) return null;

  const isPositive = String(stock.risefall) === '2' || String(stock.risefall) === '1';
  const isNegative = String(stock.risefall) === '5' || String(stock.risefall) === '4';
  const colorClass = isPositive ? 'text-red-600' : isNegative ? 'text-blue-600' : 'text-slate-600';
  const bgClass = isPositive ? 'bg-red-50' : isNegative ? 'bg-blue-50' : 'bg-slate-50';

  const DetailItem = ({ label, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {Icon && <Icon size={12} className="text-slate-300" />}
        {label}
      </div>
      <div className={cn("text-lg font-black tabular-nums tracking-tighter", color)}>
        {value}
      </div>
      {subValue && (
        <div className="text-[10px] font-bold text-slate-400 tabular-nums">
          {subValue}
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {stock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={cn("px-6 py-8 flex justify-between items-start", bgClass)}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{stock.itemname}</h2>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                    stock.sosok === '0' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                  )}>
                    {stock.sosok === '0' ? 'KOSPI' : 'KOSDAQ'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-400 tracking-wider font-mono">
                  CODE: {stock.itemcode}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={cn("col-span-1 md:col-span-2 p-6 rounded-2xl bg-white border border-slate-100 flex flex-col justify-center items-center gap-2 shadow-sm")}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Price</div>
                  <div className={cn("text-5xl font-black tabular-nums tracking-tighter", colorClass)}>
                    {formatPrice(stock.nowVal, stock.risefall)}
                  </div>
                  <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold", bgClass, colorClass)}>
                    {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : null}
                    {stock.changeRate > 0 ? '+' : ''}{stock.changeRate.toFixed(2)}% ({formatNumber(stock.changeVal)})
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-slate-900 flex flex-col justify-center items-center gap-2 shadow-lg">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Cap</div>
                  <div className="text-2xl font-black text-white tabular-nums tracking-tighter text-center">
                    {formatNumber(Math.round(stock.marketSum / 100000000))} 억
                  </div>
                </div>
              </div>

              {/* Range & Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <BarChart2 size={14} /> 52-Week Range
                  </div>
                  {stock.low52week && stock.high52week ? (
                    <PriceRangeBar low={stock.low52week} high={stock.high52week} current={stock.nowVal} />
                  ) : <div className="text-center py-4 text-xs font-bold text-slate-300">Data Unavailable</div>}
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Trading Volume</span>
                      <span className="text-sm font-black text-slate-900">{formatNumber(stock.accQuant)}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Trading Value</span>
                      <span className="text-sm font-black text-slate-900">{formatNumber(Math.round(stock.accAmount / 1000000))} M</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Open</span>
                      <span className="text-sm font-black text-slate-900">{formatNumber(stock.openVal)}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">High/Low</span>
                      <span className="text-sm font-black text-slate-900">{formatNumber(stock.highVal)} / {formatNumber(stock.lowVal)}</span>
                   </div>
                </div>
              </div>

              {/* Fundamental Data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <DetailItem label="PER" value={stock.per ? `${stock.per}x` : '-'} icon={Info} color="text-indigo-600" />
                <DetailItem label="PBR" value={stock.pbr ? `${stock.pbr}x` : '-'} icon={PieChart} color="text-orange-600" />
                <DetailItem label="Dividend" value={stock.dividendRate ? `${stock.dividendRate}%` : '-'} icon={DollarSign} color="text-emerald-600" />
                <DetailItem label="ROE" value={stock.roe ? `${stock.roe}%` : '-'} icon={TrendingUp} color="text-teal-600" />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-white border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Stock details refreshed every 60 seconds • Source: Naver Finance
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
