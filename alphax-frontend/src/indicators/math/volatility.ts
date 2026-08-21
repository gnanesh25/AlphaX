import type { Candle } from '../../services/marketApi';
import type { IndicatorPlotData } from '../indicatorTypes';
import { getCandleSource, calculateSMA, calculateEMA } from './trend';

// ─── Average True Range (ATR) ─────────────────────────────────

export function calculateATR(candles: Candle[], length: number = 14): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length + 1) return result;

  const trs: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hpc = Math.abs(candles[i].high - candles[i - 1].close);
    const lpc = Math.abs(candles[i].low - candles[i - 1].close);
    trs.push(Math.max(hl, hpc, lpc));
  }

  let atr = trs.slice(0, length).reduce((a, b) => a + b, 0) / length;
  result.push({ time: candles[length - 1].time, value: atr });

  for (let i = length; i < candles.length; i++) {
    atr = (atr * (length - 1) + trs[i]) / length;
    result.push({ time: candles[i].time, value: atr });
  }

  return result;
}

// ─── Standard Deviation ───────────────────────────────────────

export function calculateStdDev(
  candles: Candle[],
  length: number = 20,
  source: string = 'close'
): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const values = candles.map((c) => getCandleSource(c, source));

  for (let i = length - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < length; j++) {
      sum += values[i - j];
    }
    const mean = sum / length;

    let sqDiffSum = 0;
    for (let j = 0; j < length; j++) {
      sqDiffSum += Math.pow(values[i - j] - mean, 2);
    }
    const stdDev = Math.sqrt(sqDiffSum / length);

    result.push({
      time: candles[i].time,
      value: stdDev,
    });
  }

  return result;
}

// ─── Bollinger Bands (Upper, Basis, Lower) ────────────────────

export function calculateBollingerBands(
  candles: Candle[],
  length: number = 20,
  multiplier: number = 2,
  source: string = 'close'
): { upper: IndicatorPlotData[]; basis: IndicatorPlotData[]; lower: IndicatorPlotData[] } {
  const upper: IndicatorPlotData[] = [];
  const basis: IndicatorPlotData[] = [];
  const lower: IndicatorPlotData[] = [];

  const sma = calculateSMA(candles, length, source);
  const std = calculateStdDev(candles, length, source);
  const stdMap = new Map(std.map((p) => [p.time, p.value!]));

  for (const b of sma) {
    const s = stdMap.get(b.time);
    if (s !== undefined) {
      const baseVal = b.value!;
      const dev = multiplier * s;
      const upVal = baseVal + dev;
      const lowVal = baseVal - dev;

      basis.push({ time: b.time, value: baseVal });
      upper.push({ time: b.time, value: upVal });
      lower.push({ time: b.time, value: lowVal });
    }
  }

  return { upper, basis, lower };
}

// ─── Keltner Channels ─────────────────────────────────────────

export function calculateKeltnerChannels(
  candles: Candle[],
  length: number = 20,
  multiplier: number = 1.5,
  atrLength: number = 10,
  source: string = 'close'
): { upper: IndicatorPlotData[]; basis: IndicatorPlotData[]; lower: IndicatorPlotData[] } {
  const upper: IndicatorPlotData[] = [];
  const basis: IndicatorPlotData[] = [];
  const lower: IndicatorPlotData[] = [];

  const ema = calculateEMA(candles, length, source);
  const atr = calculateATR(candles, atrLength);
  const atrMap = new Map(atr.map((p) => [p.time, p.value!]));

  for (const b of ema) {
    const a = atrMap.get(b.time);
    if (a !== undefined) {
      const baseVal = b.value!;
      const dev = multiplier * a;
      basis.push({ time: b.time, value: baseVal });
      upper.push({ time: b.time, value: baseVal + dev });
      lower.push({ time: b.time, value: baseVal - dev });
    }
  }

  return { upper, basis, lower };
}

// ─── Donchian Channels ────────────────────────────────────────

export function calculateDonchianChannels(
  candles: Candle[],
  length: number = 20
): { upper: IndicatorPlotData[]; basis: IndicatorPlotData[]; lower: IndicatorPlotData[] } {
  const upper: IndicatorPlotData[] = [];
  const basis: IndicatorPlotData[] = [];
  const lower: IndicatorPlotData[] = [];
  if (candles.length < length) return { upper, basis, lower };

  for (let i = length - 1; i < candles.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < length; j++) {
      const c = candles[i - j];
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    }

    const mid = (highestHigh + lowestLow) / 2;
    const time = candles[i].time;

    upper.push({ time, value: highestHigh });
    basis.push({ time, value: mid });
    lower.push({ time, value: lowestLow });
  }

  return { upper, basis, lower };
}
