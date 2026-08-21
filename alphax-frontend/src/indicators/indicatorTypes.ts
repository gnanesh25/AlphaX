import type { Candle } from '../services/marketApi';

export type IndicatorCategory = 'Trend' | 'Momentum' | 'Volatility' | 'Volume';
export type IndicatorPaneType = 'main' | 'subpane';

export type ParamType = 'number' | 'string' | 'select' | 'color' | 'boolean';

export interface IndicatorParamDef {
  key: string;
  name: string;
  type: ParamType;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: any }[];
}

export interface IndicatorPlotConfig {
  id: string;
  name: string;
  color: string;
  lineWidth?: number;
  style?: 'line' | 'histogram' | 'cross' | 'area' | 'fill';
  targetPane?: IndicatorPaneType;
}

export interface IndicatorDefinition {
  id: string;
  name: string;
  shortName: string;
  category: IndicatorCategory;
  description: string;
  paneType: IndicatorPaneType;
  params: IndicatorParamDef[];
  plots: IndicatorPlotConfig[];
  calculate: (candles: Candle[], params: Record<string, any>) => IndicatorResult;
}

export interface IndicatorPlotData {
  time: number;
  value?: number;
  color?: string;
  // For dual fill (e.g. Ichimoku Cloud / Bollinger Bands)
  top?: number;
  bottom?: number;
}

export interface IndicatorResult {
  plots: Record<string, IndicatorPlotData[]>;
  metadata?: Record<string, any>;
}

export interface IndicatorInstance {
  instanceId: string;
  indicatorId: string;
  visible: boolean;
  params: Record<string, any>;
  colors: Record<string, string>;
  lineWidths?: Record<string, number>;
}
