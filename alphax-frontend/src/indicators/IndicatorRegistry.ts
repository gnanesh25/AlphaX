import type { IndicatorDefinition } from './indicatorTypes';

import {
  calculateSMA,
  calculateEMA,
  calculateWMA,
  calculateVWMA,
  calculateHMA,
  calculateDEMA,
  calculateTEMA,
  calculateSupertrend,
  calculateParabolicSAR,
  calculateIchimoku,
} from './math/trend';

import {
  calculateRSI,
  calculateMACD,
  calculateStochastic,
  calculateStochRSI,
  calculateCCI,
  calculateROC,
  calculateMomentum,
  calculateWilliamsR,
  calculateAwesomeOscillator,
  calculateUltimateOscillator,
} from './math/momentum';

import {
  calculateATR,
  calculateBollingerBands,
  calculateKeltnerChannels,
  calculateDonchianChannels,
  calculateStdDev,
} from './math/volatility';

import {
  calculateVolume,
  calculateVolumeSMA,
  calculateOBV,
  calculateVWAP,
  calculateMFI,
  calculateAccumulationDistribution,
} from './math/volume';

export const INDICATOR_REGISTRY: Record<string, IndicatorDefinition> = {
  // ─── TREND ──────────────────────────────────────────────────
  sma: {
    id: 'sma',
    name: 'Simple Moving Average',
    shortName: 'SMA',
    category: 'Trend',
    description: 'Calculates the unweighted average of prices over a specified period.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 500, step: 1 },
      {
        key: 'source',
        name: 'Source',
        type: 'select',
        default: 'close',
        options: [
          { label: 'Close', value: 'close' },
          { label: 'Open', value: 'open' },
          { label: 'High', value: 'high' },
          { label: 'Low', value: 'low' },
          { label: 'HL2', value: 'hl2' },
          { label: 'HLC3', value: 'hlc3' },
        ],
      },
    ],
    plots: [{ id: 'sma', name: 'SMA', color: '#2F81F7', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { sma: calculateSMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  ema: {
    id: 'ema',
    name: 'Exponential Moving Average',
    shortName: 'EMA',
    category: 'Trend',
    description: 'Places a greater weight and significance on the most recent data points.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 500, step: 1 },
      {
        key: 'source',
        name: 'Source',
        type: 'select',
        default: 'close',
        options: [
          { label: 'Close', value: 'close' },
          { label: 'Open', value: 'open' },
          { label: 'High', value: 'high' },
          { label: 'Low', value: 'low' },
        ],
      },
    ],
    plots: [{ id: 'ema', name: 'EMA', color: '#F0883E', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { ema: calculateEMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  wma: {
    id: 'wma',
    name: 'Weighted Moving Average',
    shortName: 'WMA',
    category: 'Trend',
    description: 'Assigns lineally decreasing weights to older data points.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 500 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: [{ label: 'Close', value: 'close' }] },
    ],
    plots: [{ id: 'wma', name: 'WMA', color: '#A371F7', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { wma: calculateWMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  vwma: {
    id: 'vwma',
    name: 'Volume Weighted Moving Average',
    shortName: 'VWMA',
    category: 'Trend',
    description: 'Weights price points proportionally according to trade volume.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 500 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: [{ label: 'Close', value: 'close' }] },
    ],
    plots: [{ id: 'vwma', name: 'VWMA', color: '#388BFD', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { vwma: calculateVWMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  hma: {
    id: 'hma',
    name: 'Hull Moving Average',
    shortName: 'HMA',
    category: 'Trend',
    description: 'Extremely responsive moving average that almost completely eliminates lag.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 2, max: 500 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: [{ label: 'Close', value: 'close' }] },
    ],
    plots: [{ id: 'hma', name: 'HMA', color: '#7EE787', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { hma: calculateHMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  dema: {
    id: 'dema',
    name: 'Double Exponential Moving Average',
    shortName: 'DEMA',
    category: 'Trend',
    description: 'Reduces lag by applying a double exponential formula.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 500 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: [{ label: 'Close', value: 'close' }] },
    ],
    plots: [{ id: 'dema', name: 'DEMA', color: '#56D364', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { dema: calculateDEMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  tema: {
    id: 'tema',
    name: 'Triple Exponential Moving Average',
    shortName: 'TEMA',
    category: 'Trend',
    description: 'Filters out market volatility and tracks rapid price shifts.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 500 },
      { key: 'source', name: 'Source', type: 'select', default: 'close', options: [{ label: 'Close', value: 'close' }] },
    ],
    plots: [{ id: 'tema', name: 'TEMA', color: '#DB61A2', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { tema: calculateTEMA(candles, params.length ?? 20, params.source ?? 'close') },
    }),
  },

  supertrend: {
    id: 'supertrend',
    name: 'Supertrend',
    shortName: 'Supertrend',
    category: 'Trend',
    description: 'Trend-following overlay based on ATR volatility bands.',
    paneType: 'main',
    params: [
      { key: 'period', name: 'ATR Period', type: 'number', default: 10, min: 1, max: 100 },
      { key: 'multiplier', name: 'Multiplier', type: 'number', default: 3, min: 0.1, max: 10, step: 0.1 },
    ],
    plots: [{ id: 'trend', name: 'Supertrend Line', color: '#3FB950', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => {
      const res = calculateSupertrend(candles, params.period ?? 10, params.multiplier ?? 3);
      return { plots: { trend: res.trend } };
    },
  },

  psar: {
    id: 'psar',
    name: 'Parabolic SAR',
    shortName: 'PSAR',
    category: 'Trend',
    description: 'Highlights trailing stop-and-reverse trajectory.',
    paneType: 'main',
    params: [
      { key: 'step', name: 'Step', type: 'number', default: 0.02, min: 0.001, max: 0.2, step: 0.005 },
      { key: 'maxStep', name: 'Max Step', type: 'number', default: 0.2, min: 0.05, max: 1.0, step: 0.05 },
    ],
    plots: [{ id: 'psar', name: 'SAR Dots', color: '#F0883E', lineWidth: 2, style: 'cross' }],
    calculate: (candles, params) => ({
      plots: { psar: calculateParabolicSAR(candles, params.step ?? 0.02, params.maxStep ?? 0.2) },
    }),
  },

  ichimoku: {
    id: 'ichimoku',
    name: 'Ichimoku Cloud',
    shortName: 'Ichimoku',
    category: 'Trend',
    description: 'Comprehensive momentum, trend direction, and support/resistance system.',
    paneType: 'main',
    params: [
      { key: 'tenkan', name: 'Conversion Line (Tenkan)', type: 'number', default: 9, min: 1, max: 100 },
      { key: 'kijun', name: 'Base Line (Kijun)', type: 'number', default: 26, min: 1, max: 100 },
      { key: 'senkouB', name: 'Leading Span B', type: 'number', default: 52, min: 1, max: 200 },
    ],
    plots: [
      { id: 'tenkan', name: 'Tenkan-sen', color: '#2F81F7', lineWidth: 1, style: 'line' },
      { id: 'kijun', name: 'Kijun-sen', color: '#F85149', lineWidth: 1, style: 'line' },
      { id: 'senkouA', name: 'Senkou Span A', color: 'rgba(63, 185, 80, 0.5)', lineWidth: 1, style: 'line' },
      { id: 'senkouB', name: 'Senkou Span B', color: 'rgba(248, 81, 73, 0.5)', lineWidth: 1, style: 'line' },
    ],
    calculate: (candles, params) => {
      const res = calculateIchimoku(candles, params.tenkan ?? 9, params.kijun ?? 26, params.senkouB ?? 52);
      return {
        plots: {
          tenkan: res.tenkan,
          kijun: res.kijun,
          senkouA: res.senkouA,
          senkouB: res.senkouB,
        },
      };
    },
  },

  // ─── MOMENTUM ───────────────────────────────────────────────
  rsi: {
    id: 'rsi',
    name: 'Relative Strength Index',
    shortName: 'RSI',
    category: 'Momentum',
    description: 'Measures the speed and magnitude of recent price changes to evaluate overbought or oversold conditions.',
    paneType: 'subpane',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 14, min: 1, max: 100 },
      { key: 'overbought', name: 'Overbought Level', type: 'number', default: 70, min: 50, max: 95 },
      { key: 'oversold', name: 'Oversold Level', type: 'number', default: 30, min: 5, max: 50 },
    ],
    plots: [{ id: 'rsi', name: 'RSI', color: '#A371F7', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { rsi: calculateRSI(candles, params.length ?? 14, 'close') },
      metadata: { overbought: params.overbought ?? 70, oversold: params.oversold ?? 30 },
    }),
  },

  macd: {
    id: 'macd',
    name: 'Moving Average Convergence Divergence',
    shortName: 'MACD',
    category: 'Momentum',
    description: 'Trend-following momentum oscillator that depicts the relationship between two moving averages.',
    paneType: 'subpane',
    params: [
      { key: 'fastLen', name: 'Fast Length', type: 'number', default: 12, min: 1, max: 100 },
      { key: 'slowLen', name: 'Slow Length', type: 'number', default: 26, min: 1, max: 200 },
      { key: 'signalLen', name: 'Signal Smoothing', type: 'number', default: 9, min: 1, max: 50 },
    ],
    plots: [
      { id: 'macd', name: 'MACD Line', color: '#2F81F7', lineWidth: 2, style: 'line' },
      { id: 'signal', name: 'Signal Line', color: '#F0883E', lineWidth: 2, style: 'line' },
      { id: 'histogram', name: 'Histogram', color: '#3FB950', lineWidth: 3, style: 'histogram' },
    ],
    calculate: (candles, params) => {
      const res = calculateMACD(candles, params.fastLen ?? 12, params.slowLen ?? 26, params.signalLen ?? 9);
      return {
        plots: {
          macd: res.macd,
          signal: res.signal,
          histogram: res.histogram,
        },
      };
    },
  },

  stochastic: {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    shortName: 'Stoch',
    category: 'Momentum',
    description: 'Compares a particular closing price to a range of its prices over a certain period.',
    paneType: 'subpane',
    params: [
      { key: 'kPeriod', name: '%K Period', type: 'number', default: 14, min: 1, max: 100 },
      { key: 'kSmooth', name: '%K Smoothing', type: 'number', default: 1, min: 1, max: 20 },
      { key: 'dPeriod', name: '%D Period', type: 'number', default: 3, min: 1, max: 20 },
    ],
    plots: [
      { id: 'k', name: '%K', color: '#2F81F7', lineWidth: 2, style: 'line' },
      { id: 'd', name: '%D', color: '#F0883E', lineWidth: 2, style: 'line' },
    ],
    calculate: (candles, params) => {
      const res = calculateStochastic(candles, params.kPeriod ?? 14, params.kSmooth ?? 1, params.dPeriod ?? 3);
      return { plots: { k: res.k, d: res.d }, metadata: { overbought: 80, oversold: 20 } };
    },
  },

  stochRsi: {
    id: 'stochRsi',
    name: 'Stochastic RSI',
    shortName: 'Stoch RSI',
    category: 'Momentum',
    description: 'Applies Stochastic formula to RSI values rather than standard price data.',
    paneType: 'subpane',
    params: [
      { key: 'rsiLen', name: 'RSI Length', type: 'number', default: 14, min: 1, max: 100 },
      { key: 'stochLen', name: 'Stochastic Length', type: 'number', default: 14, min: 1, max: 100 },
      { key: 'kLen', name: '%K', type: 'number', default: 3, min: 1, max: 20 },
      { key: 'dLen', name: '%D', type: 'number', default: 3, min: 1, max: 20 },
    ],
    plots: [
      { id: 'k', name: '%K', color: '#388BFD', lineWidth: 2, style: 'line' },
      { id: 'd', name: '%D', color: '#D29922', lineWidth: 2, style: 'line' },
    ],
    calculate: (candles, params) => {
      const res = calculateStochRSI(candles, params.rsiLen ?? 14, params.stochLen ?? 14, params.kLen ?? 3, params.dLen ?? 3);
      return { plots: { k: res.k, d: res.d }, metadata: { overbought: 80, oversold: 20 } };
    },
  },

  cci: {
    id: 'cci',
    name: 'Commodity Channel Index',
    shortName: 'CCI',
    category: 'Momentum',
    description: 'Tracks cyclical trends and overbought/oversold levels.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 100 }],
    plots: [{ id: 'cci', name: 'CCI', color: '#56D364', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { cci: calculateCCI(candles, params.length ?? 20) },
      metadata: { overbought: 100, oversold: -100 },
    }),
  },

  roc: {
    id: 'roc',
    name: 'Rate of Change',
    shortName: 'ROC',
    category: 'Momentum',
    description: 'Measures the percentage change in price between the current price and the price n-periods ago.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 12, min: 1, max: 100 }],
    plots: [{ id: 'roc', name: 'ROC', color: '#E3B341', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { roc: calculateROC(candles, params.length ?? 12) },
    }),
  },

  momentum: {
    id: 'momentum',
    name: 'Momentum Indicator',
    shortName: 'MOM',
    category: 'Momentum',
    description: 'Calculates the direct difference between the current price and price of n bars ago.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 10, min: 1, max: 100 }],
    plots: [{ id: 'mom', name: 'MOM', color: '#58A6FF', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { mom: calculateMomentum(candles, params.length ?? 10) },
    }),
  },

  williamsR: {
    id: 'williamsR',
    name: 'Williams %R',
    shortName: '%R',
    category: 'Momentum',
    description: 'Reflects the level of the close relative to the highest high for the lookback period.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 14, min: 1, max: 100 }],
    plots: [{ id: 'wr', name: '%R', color: '#BC8CFF', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { wr: calculateWilliamsR(candles, params.length ?? 14) },
      metadata: { overbought: -20, oversold: -80 },
    }),
  },

  ao: {
    id: 'ao',
    name: 'Awesome Oscillator',
    shortName: 'AO',
    category: 'Momentum',
    description: 'Calculates the 34-period and 5-period simple moving averages of median prices (HL2).',
    paneType: 'subpane',
    params: [],
    plots: [{ id: 'ao', name: 'AO Histogram', color: '#3FB950', lineWidth: 3, style: 'histogram' }],
    calculate: (candles) => ({
      plots: { ao: calculateAwesomeOscillator(candles) },
    }),
  },

  ultimateOsc: {
    id: 'ultimateOsc',
    name: 'Ultimate Oscillator',
    shortName: 'UO',
    category: 'Momentum',
    description: 'Combines short, medium, and long-term price action to reduce false divergence signals.',
    paneType: 'subpane',
    params: [
      { key: 'p1', name: 'Short Period', type: 'number', default: 7, min: 1, max: 50 },
      { key: 'p2', name: 'Medium Period', type: 'number', default: 14, min: 1, max: 100 },
      { key: 'p3', name: 'Long Period', type: 'number', default: 28, min: 1, max: 200 },
    ],
    plots: [{ id: 'uo', name: 'UO', color: '#79C0FF', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { uo: calculateUltimateOscillator(candles, params.p1 ?? 7, params.p2 ?? 14, params.p3 ?? 28) },
      metadata: { overbought: 70, oversold: 30 },
    }),
  },

  // ─── VOLATILITY ─────────────────────────────────────────────
  atr: {
    id: 'atr',
    name: 'Average True Range',
    shortName: 'ATR',
    category: 'Volatility',
    description: 'Measures market volatility by decomposing the entire range of an asset price for that period.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 14, min: 1, max: 100 }],
    plots: [{ id: 'atr', name: 'ATR', color: '#F0883E', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { atr: calculateATR(candles, params.length ?? 14) },
    }),
  },

  bollinger: {
    id: 'bollinger',
    name: 'Bollinger Bands',
    shortName: 'BB',
    category: 'Volatility',
    description: 'Defines upper and lower volatility bands relative to a standard moving average.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 100 },
      { key: 'multiplier', name: 'StdDev Multiplier', type: 'number', default: 2, min: 0.1, max: 5, step: 0.1 },
    ],
    plots: [
      { id: 'upper', name: 'Upper Band', color: '#2F81F7', lineWidth: 1, style: 'line' },
      { id: 'basis', name: 'Basis (SMA)', color: '#D29922', lineWidth: 1, style: 'line' },
      { id: 'lower', name: 'Lower Band', color: '#2F81F7', lineWidth: 1, style: 'line' },
    ],
    calculate: (candles, params) => {
      const res = calculateBollingerBands(candles, params.length ?? 20, params.multiplier ?? 2);
      return {
        plots: {
          upper: res.upper,
          basis: res.basis,
          lower: res.lower,
        },
      };
    },
  },

  keltner: {
    id: 'keltner',
    name: 'Keltner Channels',
    shortName: 'KC',
    category: 'Volatility',
    description: 'Volatility-based envelopes set above and below an exponential moving average.',
    paneType: 'main',
    params: [
      { key: 'length', name: 'EMA Length', type: 'number', default: 20, min: 1, max: 100 },
      { key: 'multiplier', name: 'ATR Multiplier', type: 'number', default: 1.5, min: 0.1, max: 5, step: 0.1 },
      { key: 'atrLength', name: 'ATR Length', type: 'number', default: 10, min: 1, max: 50 },
    ],
    plots: [
      { id: 'upper', name: 'Upper Channel', color: '#A371F7', lineWidth: 1, style: 'line' },
      { id: 'basis', name: 'EMA Basis', color: '#E3B341', lineWidth: 1, style: 'line' },
      { id: 'lower', name: 'Lower Channel', color: '#A371F7', lineWidth: 1, style: 'line' },
    ],
    calculate: (candles, params) => {
      const res = calculateKeltnerChannels(candles, params.length ?? 20, params.multiplier ?? 1.5, params.atrLength ?? 10);
      return {
        plots: {
          upper: res.upper,
          basis: res.basis,
          lower: res.lower,
        },
      };
    },
  },

  donchian: {
    id: 'donchian',
    name: 'Donchian Channels',
    shortName: 'DC',
    category: 'Volatility',
    description: 'Forms an envelope formed by taking the highest high and lowest low of the last n periods.',
    paneType: 'main',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 100 }],
    plots: [
      { id: 'upper', name: 'Highest High', color: '#3FB950', lineWidth: 1, style: 'line' },
      { id: 'basis', name: 'Median', color: '#8B949E', lineWidth: 1, style: 'line' },
      { id: 'lower', name: 'Lowest Low', color: '#F85149', lineWidth: 1, style: 'line' },
    ],
    calculate: (candles, params) => {
      const res = calculateDonchianChannels(candles, params.length ?? 20);
      return { plots: { upper: res.upper, basis: res.basis, lower: res.lower } };
    },
  },

  stddev: {
    id: 'stddev',
    name: 'Standard Deviation',
    shortName: 'StdDev',
    category: 'Volatility',
    description: 'Statistical measurement of price volatility dispersion.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 100 }],
    plots: [{ id: 'std', name: 'StdDev', color: '#56D364', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { std: calculateStdDev(candles, params.length ?? 20) },
    }),
  },

  // ─── VOLUME ─────────────────────────────────────────────────
  volume: {
    id: 'volume',
    name: 'Volume with Up/Down Colors',
    shortName: 'VOL',
    category: 'Volume',
    description: 'Displays traded quantity per bar with color reflecting bullish or bearish close.',
    paneType: 'subpane',
    params: [],
    plots: [{ id: 'vol', name: 'Volume', color: 'rgba(63, 185, 80, 0.6)', lineWidth: 4, style: 'histogram' }],
    calculate: (candles) => ({
      plots: { vol: calculateVolume(candles) },
    }),
  },

  volumeSma: {
    id: 'volumeSma',
    name: 'Volume SMA Average',
    shortName: 'Vol SMA',
    category: 'Volume',
    description: 'Computes smoothed moving average line of traded volume.',
    paneType: 'subpane',
    params: [{ key: 'length', name: 'Length', type: 'number', default: 20, min: 1, max: 100 }],
    plots: [{ id: 'volSma', name: 'Volume SMA', color: '#2F81F7', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { volSma: calculateVolumeSMA(candles, params.length ?? 20) },
    }),
  },

  obv: {
    id: 'obv',
    name: 'On-Balance Volume',
    shortName: 'OBV',
    category: 'Volume',
    description: 'Accumulates volume on up days and subtracts volume on down days.',
    paneType: 'subpane',
    params: [],
    plots: [{ id: 'obv', name: 'OBV', color: '#388BFD', lineWidth: 2, style: 'line' }],
    calculate: (candles) => ({
      plots: { obv: calculateOBV(candles) },
    }),
  },

  vwap: {
    id: 'vwap',
    name: 'Volume Weighted Average Price',
    shortName: 'VWAP',
    category: 'Volume',
    description: 'Calculates the true average price a security traded throughout the session based on volume.',
    paneType: 'main',
    params: [],
    plots: [{ id: 'vwap', name: 'VWAP Line', color: '#D29922', lineWidth: 2, style: 'line' }],
    calculate: (candles) => ({
      plots: { vwap: calculateVWAP(candles) },
    }),
  },

  mfi: {
    id: 'mfi',
    name: 'Money Flow Index',
    shortName: 'MFI',
    category: 'Volume',
    description: 'Volume-weighted RSI oscillator depicting institutional buying/selling pressure.',
    paneType: 'subpane',
    params: [
      { key: 'length', name: 'Length', type: 'number', default: 14, min: 1, max: 100 },
      { key: 'overbought', name: 'Overbought', type: 'number', default: 80, min: 50, max: 95 },
      { key: 'oversold', name: 'Oversold', type: 'number', default: 20, min: 5, max: 50 },
    ],
    plots: [{ id: 'mfi', name: 'MFI', color: '#7EE787', lineWidth: 2, style: 'line' }],
    calculate: (candles, params) => ({
      plots: { mfi: calculateMFI(candles, params.length ?? 14) },
      metadata: { overbought: params.overbought ?? 80, oversold: params.oversold ?? 20 },
    }),
  },

  ad: {
    id: 'ad',
    name: 'Accumulation/Distribution Line',
    shortName: 'A/D',
    category: 'Volume',
    description: 'Assesses whether a stock is being accumulated by buyers or distributed by sellers.',
    paneType: 'subpane',
    params: [],
    plots: [{ id: 'ad', name: 'A/D Line', color: '#56D364', lineWidth: 2, style: 'line' }],
    calculate: (candles) => ({
      plots: { ad: calculateAccumulationDistribution(candles) },
    }),
  },
};

export const getIndicatorList = (): IndicatorDefinition[] => Object.values(INDICATOR_REGISTRY);

export const getIndicatorById = (id: string): IndicatorDefinition | undefined => INDICATOR_REGISTRY[id];
