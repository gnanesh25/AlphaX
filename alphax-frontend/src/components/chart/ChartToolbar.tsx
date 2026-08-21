import React from 'react';
import {
  CandlestickChart,
  TrendingUp,
  Layers,
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw,
  FolderOpen,
  MousePointer,
  Minus,
  MoveDown,
  Square,
  Hash,
  Type,
  Trash2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SUPPORTED_SYMBOLS, TIMEFRAMES } from '../../services/marketApi';
import type { DrawingToolType } from '../../drawing/drawingTypes';

interface ChartToolbarProps {
  symbol: string;
  onSelectSymbol: (symbol: string) => void;
  timeframe: string;
  onSelectTimeframe: (tf: string) => void;
  chartType: 'candlestick' | 'line' | 'area';
  onChangeChartType: (type: 'candlestick' | 'line' | 'area') => void;
  onOpenIndicators: () => void;
  activeIndicatorCount: number;
  onOpenStructure: () => void;
  structureEnabled: boolean;
  onOpenLayouts: () => void;
  activeDrawingTool: DrawingToolType;
  onSelectDrawingTool: (tool: DrawingToolType) => void;
  onClearDrawings: () => void;
  drawingCount: number;
  onResetChart: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  loading: boolean;
  dataSource: string;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  symbol,
  onSelectSymbol,
  timeframe,
  onSelectTimeframe,
  chartType,
  onChangeChartType,
  onOpenIndicators,
  activeIndicatorCount,
  onOpenStructure,
  structureEnabled,
  onOpenLayouts,
  activeDrawingTool,
  onSelectDrawingTool,
  onClearDrawings,
  drawingCount,
  onResetChart,
  isFullscreen,
  onToggleFullscreen,
  loading,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '8px 12px',
      }}
    >
      {/* Top Row: Symbol, Timeframes, Chart Style, Modals & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {/* Left Section: Symbol + Timeframe */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Symbol Select */}
          <select
            className="input"
            value={symbol}
            onChange={(e) => onSelectSymbol(e.target.value)}
            style={{
              height: 32,
              fontWeight: 700,
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-primary)',
              minWidth: 120,
            }}
          >
            {SUPPORTED_SYMBOLS.map((s) => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} — {s.name}
              </option>
            ))}
          </select>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* Timeframe Buttons */}
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onSelectTimeframe(tf.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  borderRadius: 5,
                  border: 'none',
                  cursor: 'pointer',
                  background: timeframe === tf.value ? 'var(--accent)' : 'transparent',
                  color: timeframe === tf.value ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 0.12s',
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* Chart Type Toggle */}
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              onClick={() => onChangeChartType('candlestick')}
              style={{
                padding: '4px 7px',
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                background: chartType === 'candlestick' ? 'var(--bg-surface3)' : 'transparent',
                color: chartType === 'candlestick' ? 'var(--accent)' : 'var(--text-muted)',
              }}
              title="Candlestick Chart"
            >
              <CandlestickChart size={15} />
            </button>
            <button
              onClick={() => onChangeChartType('line')}
              style={{
                padding: '4px 7px',
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                background: chartType === 'line' ? 'var(--bg-surface3)' : 'transparent',
                color: chartType === 'line' ? 'var(--accent)' : 'var(--text-muted)',
              }}
              title="Line Chart"
            >
              <TrendingUp size={15} />
            </button>
            <button
              onClick={() => onChangeChartType('area')}
              style={{
                padding: '4px 7px',
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                background: chartType === 'area' ? 'var(--bg-surface3)' : 'transparent',
                color: chartType === 'area' ? 'var(--accent)' : 'var(--text-muted)',
              }}
              title="Area Chart"
            >
              <Layers size={15} />
            </button>
          </div>
        </div>

        {/* Right Section: Indicators, Structure, Layouts, Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Indicators Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenIndicators}
            style={{
              height: 30,
              fontSize: '12px',
              gap: 6,
              borderColor: activeIndicatorCount > 0 ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <Activity size={14} color={activeIndicatorCount > 0 ? 'var(--accent)' : 'currentColor'} />
            <span>Indicators</span>
            {activeIndicatorCount > 0 && (
              <Badge variant="accent" className="px-1.5 py-0 text-[10px] h-4">
                {activeIndicatorCount}
              </Badge>
            )}
          </Button>

          {/* Market Structure Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenStructure}
            style={{
              height: 30,
              fontSize: '12px',
              gap: 6,
              borderColor: structureEnabled ? '#3FB950' : 'var(--border)',
            }}
          >
            <Layers size={14} color={structureEnabled ? '#3FB950' : 'currentColor'} />
            <span>Structure</span>
          </Button>

          {/* Layouts Button */}
          <Button variant="ghost" size="sm" onClick={onOpenLayouts} style={{ height: 30, fontSize: '12px', gap: 6 }}>
            <FolderOpen size={14} />
            <span>Layouts</span>
          </Button>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          {/* Reset Chart */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onResetChart}
            title="Reset / Auto-fit Chart View"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </Button>

          {/* Fullscreen */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
        </div>
      </div>

      {/* Bottom Row: Interactive Drawing Tools Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          paddingTop: 6,
          borderTop: '1px solid var(--border)',
          overflowX: 'auto',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginRight: 6 }}>
          Draw:
        </span>

        {[
          { id: 'cursor' as DrawingToolType, label: 'Pointer / Select', icon: <MousePointer size={13} /> },
          { id: 'horizontal_line' as DrawingToolType, label: 'Horizontal Line', icon: <Minus size={13} /> },
          { id: 'vertical_line' as DrawingToolType, label: 'Vertical Line', icon: <Minus size={13} style={{ transform: 'rotate(90deg)' }} /> },
          { id: 'trend_line' as DrawingToolType, label: 'Trend Line', icon: <TrendingUp size={13} /> },
          { id: 'ray' as DrawingToolType, label: 'Ray Line', icon: <MoveDown size={13} style={{ transform: 'rotate(-45deg)' }} /> },
          { id: 'rectangle' as DrawingToolType, label: 'Rectangle / Zone', icon: <Square size={13} /> },
          { id: 'fibonacci_retracement' as DrawingToolType, label: 'Fibonacci Retracement', icon: <Hash size={13} /> },
          { id: 'price_range' as DrawingToolType, label: 'Price Range', icon: <Activity size={13} /> },
          { id: 'text_note' as DrawingToolType, label: 'Text Note', icon: <Type size={13} /> },
        ].map((tool) => {
          const isActive = activeDrawingTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectDrawingTool(tool.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: 5,
                border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                background: isActive ? 'var(--accent-muted)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.12s',
                whiteSpace: 'nowrap',
              }}
              title={tool.label}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          );
        })}

        {drawingCount > 0 && (
          <button
            onClick={onClearDrawings}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: 5,
              border: 'none',
              background: 'rgba(248, 81, 73, 0.1)',
              color: 'var(--danger)',
              cursor: 'pointer',
            }}
            title="Clear all drawings"
          >
            <Trash2 size={12} />
            <span>Clear ({drawingCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
