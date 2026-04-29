import React from 'react';
import { StockData } from '../types';
import { cn, formatNumber } from '../lib/utils';

interface SentimentGaugesProps {
  data: StockData[];
}

export const SentimentGauges: React.FC<SentimentGaugesProps> = ({ data }) => {
  const getCounts = (subset: StockData[]) => {
    return subset.reduce(
      (acc, item) => {
        const status = String(item.risefall);
        if (status === '2' || status === '1') acc.up++;
        else if (status === '5' || status === '4') acc.down++;
        else acc.steady++;
        return acc;
      },
      { up: 0, steady: 0, down: 0 }
    );
  };

  const RenderGauge = ({ title, subset }: { title: string; subset: StockData[] }) => {
    const { up, steady, down } = getCounts(subset);
    const total = up + steady + down;
    const upP = total ? (up / total) * 100 : 0;
    const steadyP = total ? (steady / total) * 100 : 0;
    const downP = total ? (down / total) * 100 : 0;

    return (
      <div className="mb-4 last:mb-0">
        <div className="flex justify-between items-end mb-1.5 text-[11px] font-bold uppercase tracking-tight">
          <span className="text-slate-500">{title}</span>
          <div className="flex gap-2">
            <span className="text-slate-900">▲ {up} | ▬ {steady} | ▼ {down}</span>
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
          <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${upP}%` }} />
          <div className="h-full bg-slate-300 transition-all duration-500" style={{ width: `${steadyP}%` }} />
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${downP}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-4 h-full flex flex-col justify-center">
      <RenderGauge title="Market Sentiment (Top 50)" subset={data.slice(0, 50)} />
      <RenderGauge title="Market Sentiment (Top 100)" subset={data.slice(0, 100)} />
      <RenderGauge title="Market Sentiment (Top 200)" subset={data.slice(0, 200)} />
    </div>
  );
};
