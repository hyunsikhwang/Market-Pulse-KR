export interface StockData {
  itemname: string;
  itemcode: string;
  sosok: string; // '0': KOSPI, '1': KOSDAQ
  nowVal: number;
  changeVal: number;
  changeRate: number;
  risefall: string; // '2': 상한/상승, '5': 하한/하락, '3': 보합
  marketSum: number;
  accAmount: number;
  accQuant: number;
  per?: number;
  pbr?: number;
  roe?: number;
  dividendRate?: number;
  roa?: number;
  high52week?: number;
  low52week?: number;
  openVal?: number;
  highVal?: number;
  lowVal?: number;
  prevQuant?: number;
}

export interface MarketMeta {
  tradeType: string;
  marketLabel: string;
  timestamp: string;
  isRegularSession: boolean;
}

export interface StocksResponse {
  data: StockData[];
  meta: MarketMeta;
}
