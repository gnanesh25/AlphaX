import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import type { Candle } from '../../services/marketApi';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  candles: Candle[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  height?: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  timeframe,
  candles,
  loading,
  error,
  onRetry,
  height = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [hoverData, setHoverData] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    change?: number;
  } | null>(null);

  // Initialize and update Lightweight Chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing chart if present
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    // Create new Lightweight Chart instance
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#0D1117' },
        textColor: '#7D8590',
        fontSize: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#161B22' },
        horzLines: { color: '#161B22' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#2F81F7',
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: '#161B22',
        },
        horzLine: {
          color: '#2F81F7',
          width: 1,
          style: 3,
          labelBackgroundColor: '#161B22',
        },
      },
      rightPriceScale: {
        borderColor: '#21262D',
        textColor: '#7D8590',
      },
      timeScale: {
        borderColor: '#21262D',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
    });

    chartRef.current = chart;

    // Add Candlestick Series using lightweight-charts v4/v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3FB950',
      downColor: '#F85149',
      borderVisible: false,
      wickUpColor: '#3FB950',
      wickDownColor: '#F85149',
    });

    seriesRef.current = candlestickSeries;

    // Subscribe to crosshair move for legend data
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }
      const data = param.seriesData.get(candlestickSeries) as any;
      if (data) {
        const open = data.open;
        const close = data.close;
        const change = ((close - open) / open) * 100;
        setHoverData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          change,
        });
      }
    });

    // Handle Window / Container Resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !entries[0].contentRect) return;
      const { width } = entries[0].contentRect;
      if (chartRef.current && width > 0) {
        chartRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [height]);

  // Update candle data when candles change
  useEffect(() => {
    if (seriesRef.current && candles && candles.length > 0) {
      const formattedCandles = candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      seriesRef.current.setData(formattedCandles);

      // Fit content automatically
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [candles]);

  // Calculate current price info from last candle
  const lastCandle = candles && candles.length > 0 ? candles[candles.length - 1] : null;
  const displayData = hoverData || (lastCandle ? {
    open: lastCandle.open,
    high: lastCandle.high,
    low: lastCandle.low,
    close: lastCandle.close,
    change: ((lastCandle.close - lastCandle.open) / lastCandle.open) * 100,
  } : null);

  return (
    <div style={{ position: 'relative', width: '100%', height, background: '#0D1117', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Legend Header */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 14,
          zIndex: 10,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          background: 'rgba(13, 17, 23, 0.85)',
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{symbol}</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeframe}</span>
        </div>

        {displayData && (
          <div style={{ display: 'flex', gap: 12, fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
            <span>O: <strong style={{ color: 'var(--text-primary)' }}>{displayData.open?.toFixed(2)}</strong></span>
            <span>H: <strong style={{ color: 'var(--text-primary)' }}>{displayData.high?.toFixed(2)}</strong></span>
            <span>L: <strong style={{ color: 'var(--text-primary)' }}>{displayData.low?.toFixed(2)}</strong></span>
            <span>C: <strong style={{ color: displayData.change && displayData.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>{displayData.close?.toFixed(2)}</strong></span>
            {displayData.change !== undefined && (
              <span style={{ color: displayData.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {displayData.change >= 0 ? '+' : ''}{displayData.change.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            background: 'rgba(13, 17, 23, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            color: 'var(--text-secondary)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Loading real market candles for {symbol}...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && !loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(13, 17, 23, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(248,81,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <AlertCircle size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Market Data Error</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.5 }}>{error}</span>
          </div>
          {onRetry && (
            <button
              className="btn btn-outline btn-sm"
              onClick={onRetry}
              style={{ marginTop: 4, gap: 6 }}
            >
              <RefreshCw size={12} /> Retry Request
            </button>
          )}
        </div>
      )}

      {/* Empty State if no candles */}
      {!loading && !error && candles.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: 'var(--text-muted)',
          }}
        >
          <BarChart2 size={32} />
          <span style={{ fontSize: '13px' }}>No chart data available</span>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
