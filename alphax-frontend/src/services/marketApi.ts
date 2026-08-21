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

const TWELVE_DATA_API_KEY = '0a3d716b3b944dc6a00dc941abd662ed';

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? '/api'
    : 'http://127.0.0.1:8000/api');

export const checkMarketHealth = async (): Promise<{ status: string; provider: string }> => {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline
  }
  return { status: 'direct_online', provider: 'Twelve Data' };
};

export const fetchSupportedMarkets = async (): Promise<MarketInstrument[]> => {
  try {
    const response = await fetch(`${API_BASE}/markets`, { signal: AbortSignal.timeout(3000) });
    if (response.ok) {
      const data = await response.json();
      return data.markets || SUPPORTED_SYMBOLS;
    }
  } catch {
    // Fallback to supported symbols
  }
  return SUPPORTED_SYMBOLS;
};

export const fetchQuote = async (symbol: string): Promise<MarketQuote> => {
  const sym = symbol.toUpperCase();

  // Try Backend first
  try {
    const url = `${API_BASE}/market/${encodeURIComponent(sym)}/quote`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to direct Twelve Data query
  }

  // Direct Twelve Data Fallback
  const tdSym = sym === 'XAUUSD' ? 'XAU/USD' : sym === 'EURUSD' ? 'EUR/USD' : sym;
  const directUrl = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(tdSym)}&apikey=${TWELVE_DATA_API_KEY}`;
  const res = await fetch(directUrl);
  const data = await res.json();
  if (data.code || data.status === 'error') {
    throw new Error(data.message || `Quote unavailable for ${sym}`);
  }

  const close = parseFloat(data.close) || 0;
  const prevClose = parseFloat(data.previous_close) || close;
  const change = close - prevClose;
  const pctChange = prevClose > 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol: sym,
    name: data.name || sym,
    open: parseFloat(data.open) || close,
    high: parseFloat(data.high) || close,
    low: parseFloat(data.low) || close,
    close,
    previous_close: prevClose,
    change,
    percent_change: pctChange,
    datetime: data.datetime || new Date().toISOString(),
    is_market_open: data.is_market_open ?? true,
    source: 'Twelve Data Live',
  };
};

export const fetchCandles = async (
  symbol: string,
  timeframe: string = '15min',
  outputsize: number = 150
): Promise<CandlesResponse> => {
  const sym = symbol.toUpperCase();
  const params = new URLSearchParams({
    timeframe,
    outputsize: outputsize.toString(),
  });

  // 1. Try FastAPI Backend
  try {
    const url = `${API_BASE}/market/${encodeURIComponent(sym)}/candles?${params.toString()}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });

    if (response.ok) {
      const data: CandlesResponse = await response.json();
      if (data.candles && data.candles.length > 0) {
        return sanitizeCandles(data.candles, sym, timeframe, data.source || 'Twelve Data (FastAPI)');
      }
    }
  } catch {
    // Backend unavailable -> fallback to direct Twelve Data
  }

  // 2. Direct Twelve Data Fallback
  const tdSymbolMap: Record<string, string> = {
    XAUUSD: 'XAU/USD',
    EURUSD: 'EUR/USD',
    GBPUSD: 'GBP/USD',
    USDJPY: 'USD/JPY',
    BTCUSD: 'BTC/USD',
    NASDAQ: 'QQQ',
    US30: 'DIA',
    SPX: 'SPY',
  };

  const tdSym = tdSymbolMap[sym] || sym;
  const directUrl = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tdSym)}&interval=${timeframe}&outputsize=${outputsize}&apikey=${TWELVE_DATA_API_KEY}`;

  const res = await fetch(directUrl);
  const data = await res.json();

  if (data.code || data.status === 'error' || !data.values) {
    throw new Error(data.message || `No candle data returned for ${sym} (${timeframe}) from Twelve Data.`);
  }

  // Parse Twelve Data reverse-chronological values
  const parsedCandles: Candle[] = data.values
    .map((v: any) => {
      let t = 0;
      if (v.datetime.includes(' ')) {
        const [d, timeStr] = v.datetime.split(' ');
        t = Math.floor(new Date(`${d}T${timeStr}Z`).getTime() / 1000);
      } else {
        t = Math.floor(new Date(`${v.datetime}T00:00:00Z`).getTime() / 1000);
      }
      return {
        time: t,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume) || 0,
      };
    })
    .reverse();

  return sanitizeCandles(parsedCandles, sym, timeframe, 'Twelve Data Direct');
};

function sanitizeCandles(
  rawCandles: Candle[],
  symbol: string,
  timeframe: string,
  source: string
): CandlesResponse {
  // Strictly validate, clean, and sort chronologically ascending
  const validCandles: Candle[] = [];
  let lastTime = -1;

  for (const c of rawCandles) {
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
    symbol,
    timeframe,
    count: validCandles.length,
    candles: validCandles,
    source,
  };
}
