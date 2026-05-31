import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, RotateCcw, Activity, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StocksResponse, StockData, MarketMeta } from "./types";
import { SentimentGauges } from "./components/SentimentGauges.tsx";
import { MoversPanel } from "./components/MoversPanel.tsx";
import { PriceRangeBar } from "./components/PriceRangeBar.tsx";
import { StockDetailModal } from "./components/StockDetailModal.tsx";
import { cn, formatNumber, formatPrice } from "./lib/utils.ts";

export default function App() {
  const [data, setData] = useState<StockData[]>([]);
  const [meta, setMeta] = useState<MarketMeta | null>(null);
  const [marketType, setMarketType] = useState<string>(() => localStorage.getItem("market_pref") || "ALL");
  const [pageSize, setPageSize] = useState<number>(() => Number(localStorage.getItem("size_pref")) || 100);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockData | 'range52w' | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });
  const [topN, setTopN] = useState<number>(() => Number(localStorage.getItem("topn_pref")) || 5);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<StocksResponse>(`/api/stocks`, {
        params: { marketType, pageSize: 200 }, // Always fetch more for sentiment gauges
      });
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, [marketType]);

  useEffect(() => {
    localStorage.setItem("market_pref", marketType);
    localStorage.setItem("size_pref", pageSize.toString());
    localStorage.setItem("topn_pref", topN.toString());
  }, [marketType, pageSize, topN]);

  const handleSort = (key: keyof StockData | 'range52w') => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'desc') return { key, direction: 'asc' };
        if (prev.direction === 'asc') return { key: null, direction: null };
      }
      return { key, direction: 'desc' };
    });
  };

  const getSortedData = (dataList: StockData[]) => {
    if (!sortConfig.key || !sortConfig.direction) return dataList;

    return [...dataList].sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof StockData];
      let bVal: any = b[sortConfig.key as keyof StockData];

      if (sortConfig.key === 'range52w') {
        const getRangePos = (s: StockData) => {
          if (!s.low52week || !s.high52week || s.high52week === s.low52week) return -1;
          return (s.nowVal - s.low52week) / (s.high52week - s.low52week);
        };
        aVal = getRangePos(a);
        bVal = getRangePos(b);
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const filteredData = getSortedData(
    data.filter((item) =>
      item.itemname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemcode.includes(searchTerm)
    )
  ).slice(0, pageSize);

  const gainers = [...data]
    .filter(item => (item.changeRate ?? 0) > 0)
    .sort((a, b) => (b.changeRate ?? 0) - (a.changeRate ?? 0))
    .slice(0, topN);
  const losers = [...data]
    .filter(item => (item.changeRate ?? 0) < 0)
    .sort((a, b) => (a.changeRate ?? 0) - (b.changeRate ?? 0))
    .slice(0, topN);

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none mb-1">
            Market Pulse <span className="text-blue-600">KR</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-tight">
            Comprehensive tracking of KOSPI and KOSDAQ exchange data
          </p>
        </div>
        
        {meta && (
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 whitespace-nowrap overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Market Basis</span>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                meta.tradeType === 'KRX' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              )}>
                {meta.marketLabel}
              </span>
              <span className="text-xs text-slate-500 tabular-nums font-medium tracking-tight">
                {meta.timestamp} (KST)
              </span>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto">
        {/* Quick Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-8 flex flex-wrap gap-2">
            {[
              { label: '전체 (ALL)', value: 'ALL' },
              { label: '코스피 (KOSPI)', value: 'KOSPI' },
              { label: '코스닥 (KOSDAQ)', value: 'KOSDAQ' }
            ].map((market) => (
              <button
                key={market.value}
                onClick={() => setMarketType(market.value)}
                className={cn(
                  "px-4 sm:px-6 py-2 rounded-lg text-[13px] font-semibold transition-all shadow-sm",
                  marketType === market.value 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {market.label}
              </button>
            ))}
          </div>
          
          <div className="md:col-span-4 flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 transition-all shadow-sm hover:border-slate-300 active:scale-95 disabled:opacity-50 flex items-center justify-center p-2"
              title="Refresh Data"
            >
              <RotateCcw size={16} className={cn(loading && "animate-spin text-blue-500")} />
            </button>
          </div>
        </div>

        {/* Movers & Sentiment Header */}
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Movers & Sentiment
          </h2>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <MoversPanel 
            title="상승률" 
            data={gainers} 
            type="gainers" 
            onStockClick={setSelectedStock} 
            topN={topN}
            onTopNChange={setTopN}
          />
          <SentimentGauges data={data} />
          <MoversPanel 
            title="하락률" 
            data={losers} 
            type="losers" 
            onStockClick={setSelectedStock} 
            topN={topN}
            onTopNChange={setTopN}
          />
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] lg:min-w-0">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    { label: 'Rank', key: 'marketSum', align: 'center', width: 'w-12' },
                    { label: 'Name', key: 'itemname', align: 'left', minWidth: 'min-w-[150px]' },
                    { label: 'Code', key: 'itemcode', align: 'left' },
                    { label: 'Price', key: 'nowVal', align: 'right' },
                    { label: '52W Range', key: 'range52w', align: 'center' },
                    { label: 'Market Cap', key: 'marketSum', align: 'right' },
                    { label: 'PER', key: 'per', align: 'right' },
                    { label: 'PBR', key: 'pbr', align: 'right' },
                    { label: 'ROE', key: 'roe', align: 'right' },
                    { label: 'Yield', key: 'dividendRate', align: 'right' },
                  ].map((col) => (
                    <th 
                      key={col.label}
                      onClick={() => handleSort(col.key as any)}
                      className={cn(
                        "px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none",
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                        col.width,
                        col.minWidth
                      )}
                    >
                      <div className={cn("flex items-center gap-1", 
                        col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                      )}>
                        {col.label}
                        <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
                          {sortConfig.key === col.key ? (
                            sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                          ) : (
                            <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && data.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={10} className="px-4 py-6"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((stock, idx) => (
                    <motion.tr
                      key={stock.itemcode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.005 }}
                      onClick={() => setSelectedStock(stock)}
                      className={cn(
                        "hover:bg-slate-50 transition-colors cursor-pointer group",
                        (String(stock.risefall) === '2' || String(stock.risefall) === '1') ? 'bg-red-50/10' : (String(stock.risefall) === '5' || String(stock.risefall) === '4') ? 'bg-blue-50/10' : ''
                      )}
                    >
                      <td className="px-4 py-3 text-[11px] font-bold text-slate-400 text-center">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{stock.itemname}</span>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tight",
                            stock.sosok === '0' ? 'text-indigo-400' : 'text-orange-400'
                          )}>
                            {stock.sosok === '0' ? 'KOSPI' : 'KOSDAQ'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[10px] font-medium text-slate-400 tabular-nums">{stock.itemcode}</td>
                      <td className={cn(
                        "px-4 py-3 text-[12px] font-bold tabular-nums text-right",
                        (String(stock.risefall) === '2' || String(stock.risefall) === '1') ? 'text-red-600' : (String(stock.risefall) === '5' || String(stock.risefall) === '4') ? 'text-blue-600' : 'text-slate-600'
                      )}>
                        <div className="flex flex-col items-end">
                           <span>{formatPrice(stock.nowVal, stock.risefall)}</span>
                           <span className="text-[10px] font-bold">{(stock.changeRate ?? 0) > 0 ? '+' : ''}{(stock.changeRate ?? 0).toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {stock.low52week && stock.high52week ? (
                          <PriceRangeBar 
                            low={stock.low52week} 
                            high={stock.high52week} 
                            current={stock.nowVal} 
                          />
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-[12px] font-semibold tabular-nums text-right text-slate-600">
                        {formatNumber(Math.round(stock.marketSum / 100000000))}억
                      </td>
                      <td className="px-4 py-3 text-[11px] tabular-nums text-slate-500 font-medium text-right">
                        {stock.per ? `${stock.per.toFixed(1)}x` : '-'}
                      </td>
                      <td className="px-4 py-3 text-[11px] tabular-nums text-slate-500 font-medium text-right">
                        {stock.pbr ? `${stock.pbr.toFixed(1)}x` : '-'}
                      </td>
                      <td className="px-4 py-3 text-[11px] tabular-nums text-slate-500 font-medium text-right">
                        {stock.roe ? `${stock.roe.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-[11px] tabular-nums text-slate-500 font-medium text-right">
                        {stock.dividendRate ? `${stock.dividendRate.toFixed(1)}%` : '-'}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-20 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      Search Query yields no results
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <StockDetailModal 
          stock={selectedStock} 
          onClose={() => setSelectedStock(null)} 
        />

        <footer className="mt-6 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Activity size={10} className={cn(loading ? "animate-pulse text-blue-500" : "")} />
            Source: Naver Finance API • Realtime Connector v2.4
          </div>
          <div className="hidden sm:block">© 2024 Market Pulse Dashboard • Optimized View</div>
        </footer>
      </main>
    </div>
  );
}
