export interface SwingPoint {
  index: number;
  time: number;
  price: number;
  type: 'high' | 'low';
  confirmed: boolean;
}

export interface BreakOfStructure {
  id: string;
  type: 'BOS' | 'CHOCH';
  direction: 'bullish' | 'bearish';
  fromTime: number;
  toTime: number;
  price: number;
  brokenSwing: SwingPoint;
}

export interface FairValueGap {
  id: string;
  type: 'bullish' | 'bearish';
  startTime: number;
  endTime?: number;
  top: number;
  bottom: number;
  mitigated: boolean;
  midpoint: number;
}

export interface OrderBlock {
  id: string;
  type: 'bullish' | 'bearish';
  startTime: number;
  endTime?: number;
  top: number;
  bottom: number;
  mitigated: boolean;
}

export interface LiquidityLevel {
  id: string;
  type: 'EQH' | 'EQL' | 'sweep';
  price: number;
  time: number;
  sweptTime?: number;
  label: string;
}

export interface SRLevel {
  id: string;
  label: string;
  price: number;
  color: string;
  timeframe?: string;
}

export interface TradingSession {
  id: string;
  name: 'Asian' | 'London' | 'New York';
  startTime: number;
  endTime: number;
  high: number;
  low: number;
  color: string;
}

export interface MarketStructureConfig {
  showSwings: boolean;
  swingLookback: number; // Left/Right bars (e.g. 3, 5, 10)
  showBOS: boolean;
  showCHOCH: boolean;
  showFVG: boolean;
  minFvgSizePct: number; // Minimum gap % (e.g. 0.05%)
  showOrderBlocks: boolean;
  showLiquidity: boolean;
  showEquilibrium: boolean; // 50% Premium / Discount zone
  showSRLevels: boolean; // PDH/PDL, PWH/PWL
  showSessions: boolean; // Asian, London, NY
  userTimezoneOffset: number; // UTC offset in hours (e.g. +5.5 for IST, 0 for UTC, -4 for EST)
}

export interface MarketStructureResult {
  swings: SwingPoint[];
  breaks: BreakOfStructure[];
  fvgs: FairValueGap[];
  orderBlocks: OrderBlock[];
  liquidity: LiquidityLevel[];
  equilibrium?: { high: number; low: number; mid: number; topColor: string; bottomColor: string };
  srLevels: SRLevel[];
  sessions: TradingSession[];
}
