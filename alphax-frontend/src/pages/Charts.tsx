import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChartToolbar } from '../components/chart/ChartToolbar';
import { TradingChart } from '../components/chart/TradingChart';
import { IndicatorSearchModal } from '../components/chart/IndicatorSearchModal';
import { IndicatorSettingsModal } from '../components/chart/IndicatorSettingsModal';
import { MarketStructureModal } from '../components/chart/MarketStructureModal';
import { LayoutManagerModal, type ChartLayout } from '../components/chart/LayoutManagerModal';
import { fetchCandles } from '../services/marketApi';
import type { Candle } from '../services/marketApi';
import type { IndicatorInstance } from '../indicators/indicatorTypes';
import { getIndicatorById } from '../indicators/IndicatorRegistry';
import { DEFAULT_STRUCTURE_CONFIG, calculateMarketStructure } from '../market-structure/structureEngine';
import type { MarketStructureConfig } from '../market-structure/structureTypes';
import type { DrawingShape, DrawingToolType } from '../drawing/drawingTypes';

export const Charts: React.FC = () => {
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('15min');
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [dataSource, setDataSource] = useState('Twelve Data Live');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Indicators State
  const [indicators, setIndicators] = useState<IndicatorInstance[]>([
    {
      instanceId: 'inst_ema20',
      indicatorId: 'ema',
      visible: true,
      params: { length: 20, source: 'close' },
      colors: { ema: '#F0883E' },
      lineWidths: { ema: 2 },
    },
    {
      instanceId: 'inst_ema50',
      indicatorId: 'ema',
      visible: true,
      params: { length: 50, source: 'close' },
      colors: { ema: '#2F81F7' },
      lineWidths: { ema: 2 },
    },
  ]);

  // Modals state
  const [isIndicatorSearchOpen, setIsIndicatorSearchOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<IndicatorInstance | null>(null);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // Market Structure State
  const [structureConfig, setStructureConfig] = useState<MarketStructureConfig>(DEFAULT_STRUCTURE_CONFIG);
  const [structureEnabled, setStructureEnabled] = useState(true);

  // Drawings State
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingToolType>('cursor');
  const [drawings, setDrawings] = useState<DrawingShape[]>([]);

  // ─── Fetch Real Market Data from Twelve Data Pipeline ─────────
  const loadCandles = useCallback(async (sym: string, tf: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandles(sym, tf, 150);
      setCandles(data.candles || []);
      setDataSource(data.source || 'Twelve Data Live');
    } catch (err: any) {
      setError(err?.message || `Failed to fetch market data for ${sym} (${tf}).`);
      setCandles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandles(symbol, timeframe);
  }, [symbol, timeframe, loadCandles]);

  // ─── Calculate Market Structure ──────────────────────────────
  const marketStructure = useMemo(() => {
    if (!structureEnabled || candles.length === 0) return null;
    return calculateMarketStructure(candles, structureConfig);
  }, [candles, structureConfig, structureEnabled]);

  // ─── Indicator Handlers ──────────────────────────────────────
  const handleAddIndicator = (indicatorId: string) => {
    const def = getIndicatorById(indicatorId);
    if (!def) return;

    const defaultParams: Record<string, any> = {};
    def.params.forEach((p) => {
      defaultParams[p.key] = p.default;
    });

    const defaultColors: Record<string, string> = {};
    def.plots.forEach((p) => {
      defaultColors[p.id] = p.color;
    });

    const newInstance: IndicatorInstance = {
      instanceId: `inst_${indicatorId}_${Date.now()}`,
      indicatorId,
      visible: true,
      params: defaultParams,
      colors: defaultColors,
      lineWidths: {},
    };

    setIndicators((prev) => [...prev, newInstance]);
  };

  const handleToggleIndicatorVisibility = (instanceId: string) => {
    setIndicators((prev) =>
      prev.map((i) => (i.instanceId === instanceId ? { ...i, visible: !i.visible } : i))
    );
  };

  const handleRemoveIndicator = (instanceId: string) => {
    setIndicators((prev) => prev.filter((i) => i.instanceId !== instanceId));
  };

  const handleUpdateIndicatorInstance = (updated: IndicatorInstance) => {
    setIndicators((prev) => prev.map((i) => (i.instanceId === updated.instanceId ? updated : i)));
  };

  // ─── Layout Handlers ─────────────────────────────────────────
  const handleLoadLayout = (layout: ChartLayout) => {
    if (layout.symbol) setSymbol(layout.symbol);
    if (layout.timeframe) setTimeframe(layout.timeframe);
    if (layout.chartType) setChartType(layout.chartType as any);
    if (layout.indicators) setIndicators(layout.indicators);
    if (layout.structureConfig) setStructureConfig(layout.structureConfig);
    if (layout.drawings) setDrawings(layout.drawings);
  };

  const handleClearDrawings = () => {
    if (confirm('Clear all drawings on this chart?')) {
      setDrawings([]);
    }
  };

  const handleResetChart = () => {
    loadCandles(symbol, timeframe);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 1600,
        ...(isFullscreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: '#0D1117',
              padding: 16,
              maxWidth: '100vw',
              maxHeight: '100vh',
              overflow: 'auto',
            }
          : {}),
      }}
    >
      {/* Chart Workspace Toolbar */}
      <ChartToolbar
        symbol={symbol}
        onSelectSymbol={(s) => setSymbol(s)}
        timeframe={timeframe}
        onSelectTimeframe={(tf) => setTimeframe(tf)}
        chartType={chartType}
        onChangeChartType={(t) => setChartType(t)}
        onOpenIndicators={() => setIsIndicatorSearchOpen(true)}
        activeIndicatorCount={indicators.filter((i) => i.visible).length}
        onOpenStructure={() => setIsStructureModalOpen(true)}
        structureEnabled={structureEnabled}
        onOpenLayouts={() => setIsLayoutModalOpen(true)}
        activeDrawingTool={activeDrawingTool}
        onSelectDrawingTool={(tool) => setActiveDrawingTool(tool)}
        onClearDrawings={handleClearDrawings}
        drawingCount={drawings.length}
        onResetChart={handleResetChart}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        loading={loading}
        dataSource={dataSource}
      />

      {/* Main Chart Component */}
      <TradingChart
        symbol={symbol}
        timeframe={timeframe}
        chartType={chartType}
        candles={candles}
        loading={loading}
        error={error}
        dataSource={dataSource}
        onRetry={() => loadCandles(symbol, timeframe)}
        height={isFullscreen ? window.innerHeight - 140 : 580}
        indicators={indicators}
        onToggleIndicatorVisibility={handleToggleIndicatorVisibility}
        onOpenIndicatorSettings={(inst) => setEditingIndicator(inst)}
        onRemoveIndicator={handleRemoveIndicator}
        marketStructure={marketStructure}
        activeDrawingTool={activeDrawingTool}
        drawings={drawings}
        onDrawingsChange={setDrawings}
      />

      {/* Indicator Search Modal */}
      <IndicatorSearchModal
        isOpen={isIndicatorSearchOpen}
        onClose={() => setIsIndicatorSearchOpen(false)}
        activeIndicators={indicators}
        onAddIndicator={handleAddIndicator}
        onRemoveIndicator={handleRemoveIndicator}
      />

      {/* Indicator Settings Modal */}
      <IndicatorSettingsModal
        isOpen={editingIndicator !== null}
        onClose={() => setEditingIndicator(null)}
        instance={editingIndicator}
        onUpdateInstance={handleUpdateIndicatorInstance}
      />

      {/* Market Structure Modal */}
      <MarketStructureModal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        config={structureConfig}
        onUpdateConfig={(c) => {
          setStructureConfig(c);
          setStructureEnabled(true);
        }}
      />

      {/* Layout Manager Modal */}
      <LayoutManagerModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        currentSymbol={symbol}
        currentTimeframe={timeframe}
        currentChartType={chartType}
        currentIndicators={indicators}
        currentStructureConfig={structureConfig}
        currentDrawings={drawings}
        onLoadLayout={handleLoadLayout}
      />
    </div>
  );
};
