import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
} from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { AlertCircle, RefreshCw, Eye, EyeOff, Settings, X, Database } from 'lucide-react';
import type { Candle } from '../../services/marketApi';
import type { IndicatorInstance, IndicatorResult } from '../../indicators/indicatorTypes';
import { getIndicatorById } from '../../indicators/IndicatorRegistry';
import type { MarketStructureResult } from '../../market-structure/structureTypes';
import type { DrawingShape, DrawingToolType } from '../../drawing/drawingTypes';
import { DrawingCanvas } from '../../drawing/DrawingCanvas';
import { Button } from '../ui/Button';

interface TradingChartProps {
  symbol: string;
  timeframe: string;
  chartType: 'candlestick' | 'line' | 'area';
  candles: Candle[];
  loading: boolean;
  error: string | null;
  dataSource: string;
  onRetry?: () => void;
  height?: number;
  indicators: IndicatorInstance[];
  onToggleIndicatorVisibility: (instanceId: string) => void;
  onOpenIndicatorSettings: (instance: IndicatorInstance) => void;
  onRemoveIndicator: (instanceId: string) => void;
  marketStructure: MarketStructureResult | null;
  activeDrawingTool: DrawingToolType;
  drawings: DrawingShape[];
  onDrawingsChange: (drawings: DrawingShape[]) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  timeframe,
  chartType,
  candles,
  loading,
  error,
  dataSource,
  onRetry,
  height = 560,
  indicators,
  onToggleIndicatorVisibility,
  onOpenIndicatorSettings,
  onRemoveIndicator,
  marketStructure,
  activeDrawingTool,
  drawings,
  onDrawingsChange,
}) => {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const mainChartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const overlaySeriesMap = useRef<Map<string, ISeriesApi<any>>>(new Map());
  const structureLinesMap = useRef<Map<string, any>>(new Map());

  // Sub-pane oscillators container & chart refs
  const subPanesContainerRef = useRef<HTMLDivElement>(null);
  const subChartMap = useRef<Map<string, { chart: IChartApi; seriesList: ISeriesApi<any>[] }>>(new Map());

  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    change?: number;
    volume?: number;
  } | null>(null);

  // Pre-calculate indicator results memoized from candles
  const indicatorResults = useMemo(() => {
    const map = new Map<string, IndicatorResult>();
    if (candles.length === 0) return map;

    indicators.forEach((inst) => {
      const def = getIndicatorById(inst.indicatorId);
      if (def && inst.visible) {
        try {
          const res = def.calculate(candles, inst.params);
          map.set(inst.instanceId, res);
        } catch (e) {
          console.error(`Calculation failed for indicator ${inst.indicatorId}:`, e);
        }
      }
    });
    return map;
  }, [candles, indicators]);

  // Split indicators into Main Overlays vs Sub-pane Oscillators
  const subPaneIndicators = useMemo(() => {
    return indicators.filter((inst) => {
      const def = getIndicatorById(inst.indicatorId);
      return def && def.paneType === 'subpane' && inst.visible;
    });
  }, [indicators]);

  // ─── 1. Initialize Main Lightweight Chart ─────────────────────
  useEffect(() => {
    if (!mainContainerRef.current) return;

    // Cleanup previous main chart
    if (mainChartRef.current) {
      mainChartRef.current.remove();
      mainChartRef.current = null;
      mainSeriesRef.current = null;
      overlaySeriesMap.current.clear();
      structureLinesMap.current.clear();
    }

    const mainHeight = subPaneIndicators.length > 0 ? Math.max(320, height - subPaneIndicators.length * 130) : height;

    const chart = createChart(mainContainerRef.current, {
      width: mainContainerRef.current.clientWidth,
      height: mainHeight,
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
        vertLine: { color: '#2F81F7', width: 1, style: 3, labelBackgroundColor: '#161B22' },
        horzLine: { color: '#2F81F7', width: 1, style: 3, labelBackgroundColor: '#161B22' },
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
    });

    mainChartRef.current = chart;

    // Create Main Series (Candlestick / Line / Area)
    let series: ISeriesApi<any>;
    if (chartType === 'line') {
      series = chart.addSeries(LineSeries, {
        color: '#2F81F7',
        lineWidth: 2,
      });
    } else if (chartType === 'area') {
      series = chart.addSeries(AreaSeries, {
        topColor: 'rgba(47, 129, 247, 0.4)',
        bottomColor: 'rgba(47, 129, 247, 0.0)',
        lineColor: '#2F81F7',
        lineWidth: 2,
      });
    } else {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#3FB950',
        downColor: '#F85149',
        borderUpColor: '#3FB950',
        borderDownColor: '#F85149',
        wickUpColor: '#3FB950',
        wickDownColor: '#F85149',
      });
    }

    mainSeriesRef.current = series;

    // Populate candle data
    if (candles.length > 0) {
      if (chartType === 'line' || chartType === 'area') {
        series.setData(candles.map((c) => ({ time: c.time as any, value: c.close })));
      } else {
        series.setData(
          candles.map((c) => ({
            time: c.time as any,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );
      }
      chart.timeScale().fitContent();
    }

    // Subscribe to crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time) {
        if (candles.length > 0) {
          const last = candles[candles.length - 1];
          const prev = candles.length > 1 ? candles[candles.length - 2].close : last.open;
          setHoverData({
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            change: last.close - prev,
            volume: last.volume,
          });
        }
        return;
      }

      const candle = candles.find((c) => c.time === (param.time as number));
      if (candle) {
        const idx = candles.indexOf(candle);
        const prevClose = idx > 0 ? candles[idx - 1].close : candle.open;
        setHoverData({
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          change: candle.close - prevClose,
          volume: candle.volume,
        });
      }
    });

    // Handle responsive resize
    const handleResize = () => {
      if (mainContainerRef.current && mainChartRef.current) {
        mainChartRef.current.applyOptions({ width: mainContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mainChartRef.current) {
        mainChartRef.current.remove();
        mainChartRef.current = null;
      }
    };
  }, [candles, chartType, height, subPaneIndicators.length]);

  // ─── 2. Add Main Chart Indicator Overlays ──────────────────────
  useEffect(() => {
    const chart = mainChartRef.current;
    if (!chart || candles.length === 0) return;

    // Remove obsolete overlay series
    overlaySeriesMap.current.forEach((series, key) => {
      const [instanceId] = key.split(':');
      if (!indicators.some((i) => i.instanceId === instanceId && i.visible)) {
        try {
          chart.removeSeries(series);
          overlaySeriesMap.current.delete(key);
        } catch {
          // ignore
        }
      }
    });

    // Render active main overlays
    indicators.forEach((inst) => {
      const def = getIndicatorById(inst.indicatorId);
      if (!def || def.paneType !== 'main' || !inst.visible) return;

      const result = indicatorResults.get(inst.instanceId);
      if (!result) return;

      def.plots.forEach((plot) => {
        const key = `${inst.instanceId}:${plot.id}`;
        const plotData = result.plots[plot.id] || [];
        if (plotData.length === 0) return;

        let series = overlaySeriesMap.current.get(key);
        const color = inst.colors[plot.id] || plot.color;
        const lineWidth = inst.lineWidths?.[plot.id] || plot.lineWidth || 2;

        if (!series) {
          if (plot.style === 'histogram') {
            series = chart.addSeries(HistogramSeries, {
              color,
              priceFormat: { type: 'price' },
            });
          } else {
            series = chart.addSeries(LineSeries, {
              color,
              lineWidth: lineWidth as any,
              priceLineVisible: false,
              crosshairMarkerVisible: true,
            });
          }
          overlaySeriesMap.current.set(key, series);
        } else {
          series.applyOptions({ color, lineWidth: lineWidth as any });
        }

        series.setData(
          plotData.map((p) => ({
            time: p.time as any,
            value: p.value ?? 0,
            color: p.color,
          }))
        );
      });
    });
  }, [indicators, indicatorResults, candles]);

  // ─── 3. Market Structure Overlay (S/R & Equilibrium) ───────────
  useEffect(() => {
    const mainSeries = mainSeriesRef.current;
    if (!mainSeries) return;

    // Remove previous price lines
    structureLinesMap.current.forEach((line) => {
      try {
        mainSeries.removePriceLine(line);
      } catch {
        // ignore
      }
    });
    structureLinesMap.current.clear();

    if (!marketStructure) return;

    // Render S/R lines (PDH, PDL, etc.)
    marketStructure.srLevels.forEach((sr) => {
      const line = mainSeries.createPriceLine({
        price: sr.price,
        color: sr.color,
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: sr.label,
      });
      structureLinesMap.current.set(sr.id, line);
    });

    // Render Equilibrium 50% line
    if (marketStructure.equilibrium) {
      const eqLine = mainSeries.createPriceLine({
        price: marketStructure.equilibrium.mid,
        color: '#D29922',
        lineWidth: 1,
        lineStyle: 3, // Dotted
        axisLabelVisible: true,
        title: 'Equilibrium (50%)',
      });
      structureLinesMap.current.set('equilibrium_mid', eqLine);
    }
  }, [marketStructure]);

  // ─── 4. Synchronize Sub-Pane Oscillator Charts ─────────────────
  useEffect(() => {
    // Cleanup sub-charts
    subChartMap.current.forEach(({ chart }) => {
      chart.remove();
    });
    subChartMap.current.clear();

    if (!subPanesContainerRef.current || subPaneIndicators.length === 0 || candles.length === 0) {
      return;
    }

    subPaneIndicators.forEach((inst) => {
      const def = getIndicatorById(inst.indicatorId);
      if (!def) return;

      const paneDiv = document.getElementById(`subpane_${inst.instanceId}`);
      if (!paneDiv) return;

      const subChart = createChart(paneDiv, {
        width: paneDiv.clientWidth,
        height: 120,
        layout: {
          background: { type: ColorType.Solid, color: '#0D1117' },
          textColor: '#7D8590',
          fontSize: 11,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        grid: {
          vertLines: { color: '#161B22' },
          horzLines: { color: '#161B22' },
        },
        rightPriceScale: {
          borderColor: '#21262D',
          textColor: '#7D8590',
        },
        timeScale: {
          borderColor: '#21262D',
          visible: true,
          timeVisible: true,
        },
      });

      const result = indicatorResults.get(inst.instanceId);
      const seriesList: ISeriesApi<any>[] = [];

      if (result) {
        def.plots.forEach((plot) => {
          const plotData = result.plots[plot.id] || [];
          const color = inst.colors[plot.id] || plot.color;
          const lineWidth = inst.lineWidths?.[plot.id] || plot.lineWidth || 2;

          let s: ISeriesApi<any>;
          if (plot.style === 'histogram') {
            s = subChart.addSeries(HistogramSeries, { color });
          } else {
            s = subChart.addSeries(LineSeries, { color, lineWidth: lineWidth as any });
          }

          s.setData(
            plotData.map((p) => ({
              time: p.time as any,
              value: p.value ?? 0,
              color: p.color,
            }))
          );
          seriesList.push(s);
        });
      }

      // Sync visible time range with main chart
      if (mainChartRef.current) {
        subChart.timeScale().fitContent();
      }

      subChartMap.current.set(inst.instanceId, { chart: subChart, seriesList });
    });
  }, [subPaneIndicators, indicatorResults, candles]);

  const latestCandle = candles[candles.length - 1];
  const prevClose = candles.length > 1 ? candles[candles.length - 2].close : latestCandle?.open || 0;
  const activeHover = hoverData || (latestCandle ? {
    open: latestCandle.open,
    high: latestCandle.high,
    low: latestCandle.low,
    close: latestCandle.close,
    change: latestCandle.close - prevClose,
    volume: latestCandle.volume,
  } : null);

  const isUp = (activeHover?.change || 0) >= 0;
  const decimals = (activeHover?.close || 0) < 10 ? 4 : 2;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        background: '#0D1117',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Top Chart Header: Symbol, Live Price, Status & Active Overlays */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'rgba(22, 27, 34, 0.7)',
          borderBottom: '1px solid #21262D',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {/* Left: Symbol, Real-time OHLCV info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#E6EDF3', fontFamily: 'JetBrains Mono, monospace' }}>
              {symbol}
            </span>
            <span style={{ fontSize: '12px', color: '#7D8590', fontWeight: 600 }}>{timeframe}</span>
          </div>

          {activeHover && (
            <div style={{ display: 'flex', gap: 10, fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', flexWrap: 'wrap' }}>
              <span>O: <strong style={{ color: '#E6EDF3' }}>{activeHover.open?.toFixed(decimals)}</strong></span>
              <span>H: <strong style={{ color: '#E6EDF3' }}>{activeHover.high?.toFixed(decimals)}</strong></span>
              <span>L: <strong style={{ color: '#E6EDF3' }}>{activeHover.low?.toFixed(decimals)}</strong></span>
              <span>C: <strong style={{ color: '#E6EDF3' }}>{activeHover.close?.toFixed(decimals)}</strong></span>
              <span style={{ color: isUp ? '#3FB950' : '#F85149', fontWeight: 700 }}>
                {isUp ? '+' : ''}{activeHover.change?.toFixed(decimals)} (
                {activeHover.open && activeHover.open > 0
                  ? ((activeHover.change! / activeHover.open) * 100).toFixed(2)
                  : '0.00'}
                %)
              </span>
              {activeHover.volume !== undefined && activeHover.volume > 0 && (
                <span style={{ color: '#7D8590' }}>Vol: <strong>{activeHover.volume.toLocaleString()}</strong></span>
              )}
            </div>
          )}
        </div>

        {/* Right: Data Feed Badge & Overlays Manager */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 20,
              background: error ? 'rgba(248, 81, 73, 0.15)' : 'rgba(63, 185, 80, 0.15)',
              color: error ? '#F85149' : '#3FB950',
              border: `1px solid ${error ? 'rgba(248, 81, 73, 0.3)' : 'rgba(63, 185, 80, 0.3)'}`,
            }}
          >
            <Database size={11} />
            <span>{error ? 'Data Unavailable' : dataSource || 'Twelve Data Live'}</span>
          </div>
        </div>
      </div>

      {/* Active Indicators Pills Legend Bar */}
      {indicators.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 16px',
            background: '#161B22',
            borderBottom: '1px solid #21262D',
            overflowX: 'auto',
          }}
        >
          {indicators.map((inst) => {
            const def = getIndicatorById(inst.indicatorId);
            if (!def) return null;
            return (
              <div
                key={inst.instanceId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: inst.visible ? '#21262D' : '#161B22',
                  border: '1px solid #30363D',
                  fontSize: '11px',
                  color: inst.visible ? '#E6EDF3' : '#7D8590',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontWeight: 600 }}>{def.shortName}</span>
                <button
                  onClick={() => onToggleIndicatorVisibility(inst.instanceId)}
                  style={{ background: 'none', border: 'none', color: '#7D8590', cursor: 'pointer', padding: 2, display: 'flex' }}
                  title={inst.visible ? 'Hide indicator' : 'Show indicator'}
                >
                  {inst.visible ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>
                <button
                  onClick={() => onOpenIndicatorSettings(inst)}
                  style={{ background: 'none', border: 'none', color: '#7D8590', cursor: 'pointer', padding: 2, display: 'flex' }}
                  title="Indicator settings"
                >
                  <Settings size={11} />
                </button>
                <button
                  onClick={() => onRemoveIndicator(inst.instanceId)}
                  style={{ background: 'none', border: 'none', color: '#F85149', cursor: 'pointer', padding: 2, display: 'flex' }}
                  title="Remove indicator"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Chart Container */}
      <div style={{ position: 'relative', width: '100%' }}>
        <div ref={mainContainerRef} style={{ width: '100%' }} />

        {/* Interactive Drawing Canvas Layer */}
        {mainContainerRef.current && (
          <DrawingCanvas
            width={mainContainerRef.current.clientWidth || 800}
            height={subPaneIndicators.length > 0 ? Math.max(320, height - subPaneIndicators.length * 130) : height}
            activeTool={activeDrawingTool}
            shapes={drawings}
            onShapesChange={onDrawingsChange}
            selectedShapeId={selectedShapeId}
            onSelectShape={setSelectedShapeId}
          />
        )}

        {/* Loading Overlay */}
        {loading && candles.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(13, 17, 23, 0.85)',
              gap: 12,
              zIndex: 10,
            }}
          >
            <RefreshCw size={28} color="#2F81F7" className="spin" />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#E6EDF3' }}>
              Loading market data...
            </div>
            <div style={{ fontSize: '12px', color: '#7D8590' }}>
              Fetching real {symbol} candles from Twelve Data
            </div>
          </div>
        )}

        {/* Error / Offline Overlay */}
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(13, 17, 23, 0.95)',
              gap: 14,
              padding: 24,
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <AlertCircle size={32} color="#F85149" />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#F85149' }}>
              Market data unavailable
            </div>
            <div style={{ fontSize: '13px', color: '#7D8590', maxWidth: 460, lineHeight: 1.5 }}>
              {error}
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} style={{ gap: 6 }}>
                <RefreshCw size={13} /> Retry Connection
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Synchronized Oscillator Sub-Panes */}
      {subPaneIndicators.length > 0 && (
        <div ref={subPanesContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', borderTop: '1px solid #21262D' }}>
          {subPaneIndicators.map((inst) => {
            const def = getIndicatorById(inst.indicatorId);
            if (!def) return null;
            return (
              <div
                key={inst.instanceId}
                style={{
                  position: 'relative',
                  width: '100%',
                  background: '#0D1117',
                  borderBottom: '1px solid #161B22',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 12,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#7D8590',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{def.name} ({inst.params.length ?? inst.params.fastLen ?? 14})</span>
                </div>
                <div id={`subpane_${inst.instanceId}`} style={{ width: '100%', height: 120 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
