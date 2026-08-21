export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  previous_close: number;
  change: number;
  percent_change: number;
  datetime: string;
  is_market_open: boolean;
}

export interface MarketInstrument {
  symbol: string;
  name: string;
  category: string;
}

export interface CandlesResponse {
  symbol: string;
  timeframe: string;
  count: number;
  candles: Candle[];
}

const API_BASE = 'http://127.0.0.1:8000/api';

export const fetchSupportedMarkets = async (): Promise<MarketInstrument[]> => {
  const response = await fetch(`${API_BASE}/markets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch markets: HTTP ${response.status}`);
  }
  const data = await response.json();
  return data.markets || [];
};

export const fetchQuote = async (symbol: string): Promise<MarketQuote> => {
  const response = await fetch(`${API_BASE}/market/${encodeURIComponent(symbol)}/quote`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to fetch quote for ${symbol}`);
  }
  return await response.json();
};

export const fetchCandles = async (
  symbol: string,
  timeframe: string = '15min',
  outputsize: number = 150
): Promise<CandlesResponse> => {
  const params = new URLSearchParams({
    timeframe,
    outputsize: outputsize.toString(),
  });

  const response = await fetch(
    `${API_BASE}/market/${encodeURIComponent(symbol)}/candles?${params.toString()}`
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to load candles for ${symbol}`);
  }

  return await response.json();
};
