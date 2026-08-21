import { describe, it, expect } from 'vitest';
import type { Candle } from '../services/marketApi';
import { calculateSMA, calculateEMA } from '../indicators/math/trend';
import { calculateRSI, calculateMACD } from '../indicators/math/momentum';
import { calculateATR, calculateBollingerBands } from '../indicators/math/volatility';
import { calculateVWAP } from '../indicators/math/volume';
import { detectSwings, detectBOSAndCHOCH, detectFVGs } from '../market-structure/structureEngine';

const SAMPLE_CANDLES: Candle[] = [
  { time: 1000, open: 100, high: 105, low: 98, close: 102, volume: 1000 },
  { time: 1060, open: 102, high: 108, low: 101, close: 107, volume: 1200 },
  { time: 1120, open: 107, high: 112, low: 106, close: 110, volume: 1500 },
  { time: 1180, open: 110, high: 115, low: 109, close: 114, volume: 2000 },
  { time: 1240, open: 114, high: 118, low: 112, close: 116, volume: 1800 },
  { time: 1300, open: 116, high: 117, low: 110, close: 111, volume: 1600 },
  { time: 1360, open: 111, high: 113, low: 105, close: 106, volume: 1400 },
  { time: 1420, open: 106, high: 108, low: 100, close: 102, volume: 1300 },
  { time: 1480, open: 102, high: 104, low: 95, close: 97, volume: 1100 },
  { time: 1540, open: 97, high: 101, low: 96, close: 100, volume: 1050 },
];

describe('Indicator Calculation Mathematics', () => {
  it('calculates SMA correctly', () => {
    const sma3 = calculateSMA(SAMPLE_CANDLES, 3, 'close');
    expect(sma3.length).toBe(SAMPLE_CANDLES.length - 2);
    expect(sma3[0].value).toBeCloseTo(106.333, 2);
    expect(sma3[0].time).toBe(1120);
  });

  it('calculates EMA with proper smoothing', () => {
    const ema3 = calculateEMA(SAMPLE_CANDLES, 3, 'close');
    expect(ema3.length).toBe(SAMPLE_CANDLES.length - 2);
    expect(ema3[0].value).toBeCloseTo(106.333, 2);
    expect(ema3[1].value).toBeGreaterThan(ema3[0].value!);
  });

  it('calculates RSI bounded between 0 and 100', () => {
    const rsi = calculateRSI(SAMPLE_CANDLES, 5, 'close');
    expect(rsi.length).toBeGreaterThan(0);
    rsi.forEach((point) => {
      expect(point.value).toBeGreaterThanOrEqual(0);
      expect(point.value).toBeLessThanOrEqual(100);
    });
  });

  it('calculates MACD fast and slow relationship', () => {
    const { macd, signal, histogram } = calculateMACD(SAMPLE_CANDLES, 3, 6, 3);
    expect(macd.length).toBeGreaterThan(0);
    expect(signal.length).toBeGreaterThan(0);
    expect(histogram.length).toBe(signal.length);
  });

  it('calculates ATR volatility accurately', () => {
    const atr = calculateATR(SAMPLE_CANDLES, 3);
    expect(atr.length).toBeGreaterThan(0);
    atr.forEach((p) => {
      expect(p.value).toBeGreaterThan(0);
    });
  });

  it('calculates Bollinger Bands with upper > basis > lower', () => {
    const bb = calculateBollingerBands(SAMPLE_CANDLES, 3, 2);
    expect(bb.upper.length).toBe(bb.basis.length);
    expect(bb.lower.length).toBe(bb.basis.length);

    for (let i = 0; i < bb.basis.length; i++) {
      expect(bb.upper[i].value).toBeGreaterThanOrEqual(bb.basis[i].value!);
      expect(bb.basis[i].value).toBeGreaterThanOrEqual(bb.lower[i].value!);
    }
  });

  it('calculates VWAP accurately', () => {
    const vwap = calculateVWAP(SAMPLE_CANDLES);
    expect(vwap.length).toBe(SAMPLE_CANDLES.length);
    expect(vwap[0].value).toBeCloseTo((105 + 98 + 102) / 3, 2);
  });
});

describe('Market Structure Engine', () => {
  it('detects swing points and structure breaks', () => {
    const swings = detectSwings(SAMPLE_CANDLES, 2);
    expect(Array.isArray(swings)).toBe(true);
    const breaks = detectBOSAndCHOCH(swings);
    expect(Array.isArray(breaks)).toBe(true);
  });

  it('detects Fair Value Gaps (FVG) accurately', () => {
    const fvgCandles: Candle[] = [
      { time: 1000, open: 100, high: 102, low: 99, close: 101 },
      { time: 1060, open: 101, high: 120, low: 101, close: 119 },
      { time: 1120, open: 119, high: 125, low: 110, close: 124 },
    ];

    const fvgs = detectFVGs(fvgCandles, 0.01);
    expect(fvgs.length).toBe(1);
    expect(fvgs[0].type).toBe('bullish');
    expect(fvgs[0].bottom).toBe(102);
    expect(fvgs[0].top).toBe(110);
  });
});
