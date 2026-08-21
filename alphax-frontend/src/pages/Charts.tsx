import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Database, CandlestickChart, Layers, TrendingUp } from 'lucide-react';
import { SymbolSelector } from '../components/chart/SymbolSelector';
import { TimeframeSelector } from '../components/chart/TimeframeSelector';
import { TradingChart } from '../components/chart/TradingChart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { fetchCandles } from '../services/marketApi';
import type { Candle } from '../services/marketApi';


const SYMBOLS = [
  { symbol: 'XAUUSD', name: 'Gold / US Dollar' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar' },
  { symbol: 'USDJPY', name: 'US Dollar / Yen' },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar' },
];

export const Charts: React.FC = () => {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('15min');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [dataSource, setDataSource] = useState<string>('Live Data');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandles = useCallback(async (sym: string, tf: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandles(sym, tf, 150);
      setCandles(data.candles || []);
      if (data.source) setDataSource(data.source);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to market data service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandles(symbol, timeframe);
  }, [symbol, timeframe, loadCandles]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1600 }}>
      {/* Top Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                Advanced Chart Workspace
              </h2>
              <Badge variant="success">
                <Database size={10} style={{ marginRight: 3 }} /> {dataSource}
              </Badge>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Real-time multi-asset market charts powered by TradingView Lightweight Charts
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadCandles(symbol, timeframe)}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Toolbar Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Symbol selector */}
          <SymbolSelector
            symbols={SYMBOLS}
            activeSymbol={symbol}
            onChange={(s) => setSymbol(s)}
          />

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          {/* Timeframe selector */}
          <TimeframeSelector
            activeTimeframe={timeframe}
            onChange={(tf) => setTimeframe(tf)}
          />
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-icon-sm" title="Candlesticks">
            <CandlestickChart size={14} color="var(--accent)" />
          </button>
          <button className="btn btn-ghost btn-icon-sm" title="Line">
            <TrendingUp size={14} />
          </button>
          <button className="btn btn-ghost btn-icon-sm" title="Area">
            <Layers size={14} />
          </button>
        </div>
      </div>

      {/* Main Chart Component */}
      <TradingChart
        symbol={symbol}
        timeframe={timeframe}
        candles={candles}
        loading={loading}
        error={error}
        onRetry={() => loadCandles(symbol, timeframe)}
        height={560}
      />
    </div>
  );
};
