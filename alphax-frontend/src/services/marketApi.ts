export interface Candle {
  time: number; // Unix timestamp in seconds (strictly ascending)
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
  source: string;
}

export interface MarketInstrument {
  symbol: string;
  name: string;
  category: string;
  exchange?: string;
}

export interface CandlesResponse {
  symbol: string;
  timeframe: string;
  count: number;
  candles: Candle[];
  source: string;
}

export const SUPPORTED_SYMBOLS: { symbol: string; name: string; category: string }[] = [
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'commodities' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'forex' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'forex' },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'crypto' },
  { symbol: 'NASDAQ', name: 'Invesco QQQ (Nasdaq 100)', category: 'indices' },
  { symbol: 'US30', name: 'Dow Jones Industrial Average', category: 'indices' },
  { symbol: 'SPX', name: 'SPDR S&P 500 ETF Trust', category: 'indices' },
];

export const TIMEFRAMES = [
  { label: '1m', value: '1min' },
  { label: '3m', value: '3min' },
  { label: '5m', value: '5min' },
  { label: '15m', value: '15min' },
  { label: '30m', value: '30min' },
  { label: '1H', value: '1h' },
  { label: '2H', value: '2h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1day' },
  { label: '1W', value: '1week' },
  { label: '1M', value: '1month' },
];

const API_BASE = (import.meta.env.VITE_API_BASE as string) || (typeof window !== 'undefined' && window.location.port === '5173' ? '/api' : 'http://127.0.0.1:8000/api');

export const checkMarketHealth = async (): Promise<{ status: string; provider: string }> => {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }
  return { status: 'offline', provider: 'Twelve Data' };
};

export const fetchSupportedMarkets = async (): Promise<MarketInstrument[]> => {
  try {
    const response = await fetch(`${API_BASE}/markets`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Failed to fetch markets: HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.markets || SUPPORTED_SYMBOLS;
  } catch {
    return SUPPORTED_SYMBOLS;
  }
};

export const fetchQuote = async (symbol: string): Promise<MarketQuote> => {
  const url = `${API_BASE}/market/${encodeURIComponent(symbol.toUpperCase())}/quote`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Market data unavailable for ${symbol} (HTTP ${response.status})`);
    }
    return await response.json();
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.message?.includes('fetch')) {
      throw new Error(`Unable to connect to market data service (FastAPI on ${API_BASE}). Ensure backend is running.`);
    }
    throw err;
  }
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

  const url = `${API_BASE}/market/${encodeURIComponent(symbol.toUpperCase())}/candles?${params.toString()}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(14000) });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detail = errData.detail || `HTTP ${response.status}`;
      throw new Error(`Market data unavailable: ${detail}`);
    }

    const data: CandlesResponse = await response.json();

    if (!data.candles || data.candles.length === 0) {
      throw new Error(`No candle data available for ${symbol} (${timeframe}) from Twelve Data.`);
    }

    // Strictly validate, clean, and sort chronologically ascending
    const validCandles: Candle[] = [];
    let lastTime = -1;

    for (const c of data.candles) {
      if (
        typeof c.time === 'number' &&
        !isNaN(c.time) &&
        typeof c.open === 'number' &&
        !isNaN(c.open) &&
        typeof c.high === 'number' &&
        !isNaN(c.high) &&
        typeof c.low === 'number' &&
        !isNaN(c.low) &&
        typeof c.close === 'number' &&
        !isNaN(c.close)
      ) {
        // Ensure strictly increasing time
        if (c.time > lastTime) {
          validCandles.push({
            time: c.time,
            open: c.open,
            high: Math.max(c.high, c.open, c.close),
            low: Math.min(c.low, c.open, c.close),
            close: c.close,
            volume: typeof c.volume === 'number' && !isNaN(c.volume) ? c.volume : 0,
          });
          lastTime = c.time;
        }
      }
    }

    if (validCandles.length === 0) {
      throw new Error(`Malformed market data received for ${symbol}.`);
    }

    return {
      symbol: data.symbol,
      timeframe: data.timeframe,
      count: validCandles.length,
      candles: validCandles,
      source: data.source || 'Twelve Data Live',
    };
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch')) {
      throw new Error(`Market data service unavailable (${API_BASE}). Please start the FastAPI backend service.`);
    }
    throw err;
  }
};
