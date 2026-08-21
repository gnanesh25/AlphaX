import type { Candle } from '../../services/marketApi';
import type { IndicatorPlotData } from '../indicatorTypes';
import { getCandleSource, calculateEMA, calculateSMA } from './trend';

// ─── Relative Strength Index (RSI) ────────────────────────────

export function calculateRSI(
  candles: Candle[],
  length: number = 14,
  source: string = 'close'
): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length + 1) return result;

  const values = candles.map((c) => getCandleSource(c, source));
  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum += Math.abs(diff);
  }

  let avgGain = gainSum / length;
  let avgLoss = lossSum / length;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);

  result.push({
    time: candles[length].time,
    value: Math.max(0, Math.min(100, rsi)),
  });

  for (let i = length + 1; i < candles.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (length - 1) + gain) / length;
    avgLoss = (avgLoss * (length - 1) + loss) / length;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - 100 / (1 + rs);

    result.push({
      time: candles[i].time,
      value: Math.max(0, Math.min(100, rsi)),
    });
  }

  return result;
}

// ─── Moving Average Convergence Divergence (MACD) ─────────────

export function calculateMACD(
  candles: Candle[],
  fastLen: number = 12,
  slowLen: number = 26,
  signalLen: number = 9,
  source: string = 'close'
): { macd: IndicatorPlotData[]; signal: IndicatorPlotData[]; histogram: IndicatorPlotData[] } {
  const macd: IndicatorPlotData[] = [];
  const signal: IndicatorPlotData[] = [];
  const histogram: IndicatorPlotData[] = [];

  const fastEma = calculateEMA(candles, fastLen, source);
  const slowEma = calculateEMA(candles, slowLen, source);

  const slowMap = new Map(slowEma.map((p) => [p.time, p.value!]));
  const macdCandles: Candle[] = [];

  for (const fast of fastEma) {
    const slowVal = slowMap.get(fast.time);
    if (slowVal !== undefined) {
      const macdVal = fast.value! - slowVal;
      macd.push({ time: fast.time, value: macdVal });
      macdCandles.push({
        time: fast.time,
        open: macdVal,
        high: macdVal,
        low: macdVal,
        close: macdVal,
      });
    }
  }

  const signalEma = calculateEMA(macdCandles, signalLen, 'close');
  const signalMap = new Map(signalEma.map((p) => [p.time, p.value!]));

  for (const m of macd) {
    const sigVal = signalMap.get(m.time);
    if (sigVal !== undefined) {
      signal.push({ time: m.time, value: sigVal });
      const histVal = m.value! - sigVal;
      histogram.push({
        time: m.time,
        value: histVal,
        color: histVal >= 0 ? '#3FB950' : '#F85149',
      });
    }
  }

  return { macd, signal, histogram };
}

// ─── Stochastic Oscillator (%K, %D) ───────────────────────────

export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  kSmooth: number = 1,
  dPeriod: number = 3
): { k: IndicatorPlotData[]; d: IndicatorPlotData[] } {
  const kList: IndicatorPlotData[] = [];
  const dList: IndicatorPlotData[] = [];
  if (candles.length < kPeriod) return { k: kList, d: dList };

  const rawKList: { time: number; value: number }[] = [];

  for (let i = kPeriod - 1; i < candles.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < kPeriod; j++) {
      const c = candles[i - j];
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    }

    const currentClose = candles[i].close;
    const range = highestHigh - lowestLow;
    const rawK = range === 0 ? 50 : ((currentClose - lowestLow) / range) * 100;
    rawKList.push({ time: candles[i].time, value: rawK });
  }

  // Smooth %K
  const smoothedK: { time: number; value: number }[] = [];
  for (let i = kSmooth - 1; i < rawKList.length; i++) {
    let sum = 0;
    for (let j = 0; j < kSmooth; j++) {
      sum += rawKList[i - j].value;
    }
    const val = sum / kSmooth;
    smoothedK.push({ time: rawKList[i].time, value: val });
    kList.push({ time: rawKList[i].time, value: val });
  }

  // Calculate %D (SMA of %K)
  for (let i = dPeriod - 1; i < smoothedK.length; i++) {
    let sum = 0;
    for (let j = 0; j < dPeriod; j++) {
      sum += smoothedK[i - j].value;
    }
    dList.push({
      time: smoothedK[i].time,
      value: sum / dPeriod,
    });
  }

  return { k: kList, d: dList };
}

// ─── Stochastic RSI ───────────────────────────────────────────

export function calculateStochRSI(
  candles: Candle[],
  rsiLen: number = 14,
  stochLen: number = 14,
  kLen: number = 3,
  dLen: number = 3
): { k: IndicatorPlotData[]; d: IndicatorPlotData[] } {
  const rsiPlot = calculateRSI(candles, rsiLen, 'close');
  if (rsiPlot.length < stochLen) return { k: [], d: [] };

  const rsiCandles: Candle[] = rsiPlot.map((p) => ({
    time: p.time,
    open: p.value!,
    high: p.value!,
    low: p.value!,
    close: p.value!,
  }));

  return calculateStochastic(rsiCandles, stochLen, kLen, dLen);
}

// ─── Commodity Channel Index (CCI) ────────────────────────────

export function calculateCCI(candles: Candle[], length: number = 20): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const tpList = candles.map((c) => (c.high + c.low + c.close) / 3);

  for (let i = length - 1; i < candles.length; i++) {
    let tpSum = 0;
    for (let j = 0; j < length; j++) {
      tpSum += tpList[i - j];
    }
    const smaTp = tpSum / length;

    let meanDevSum = 0;
    for (let j = 0; j < length; j++) {
      meanDevSum += Math.abs(tpList[i - j] - smaTp);
    }
    const meanDev = meanDevSum / length;

    const cci = meanDev === 0 ? 0 : (tpList[i] - smaTp) / (0.015 * meanDev);
    result.push({
      time: candles[i].time,
      value: cci,
    });
  }

  return result;
}

// ─── Rate of Change (ROC) ─────────────────────────────────────

export function calculateROC(candles: Candle[], length: number = 12, source: string = 'close'): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length <= length) return result;

  const values = candles.map((c) => getCandleSource(c, source));

  for (let i = length; i < candles.length; i++) {
    const prev = values[i - length];
    const cur = values[i];
    const roc = prev === 0 ? 0 : ((cur - prev) / prev) * 100;
    result.push({
      time: candles[i].time,
      value: roc,
    });
  }

  return result;
}

// ─── Momentum ─────────────────────────────────────────────────

export function calculateMomentum(candles: Candle[], length: number = 10, source: string = 'close'): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length <= length) return result;

  const values = candles.map((c) => getCandleSource(c, source));

  for (let i = length; i < candles.length; i++) {
    result.push({
      time: candles[i].time,
      value: values[i] - values[i - length],
    });
  }

  return result;
}

// ─── Williams %R ──────────────────────────────────────────────

export function calculateWilliamsR(candles: Candle[], length: number = 14): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  for (let i = length - 1; i < candles.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = 0; j < length; j++) {
      const c = candles[i - j];
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    }

    const range = highestHigh - lowestLow;
    const wr = range === 0 ? -50 : ((highestHigh - candles[i].close) / range) * -100;
    result.push({
      time: candles[i].time,
      value: wr,
    });
  }

  return result;
}

// ─── Awesome Oscillator (AO) ──────────────────────────────────

export function calculateAwesomeOscillator(candles: Candle[]): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < 34) return result;

  const hl2Candles = candles.map((c) => ({
    time: c.time,
    open: (c.high + c.low) / 2,
    high: (c.high + c.low) / 2,
    low: (c.high + c.low) / 2,
    close: (c.high + c.low) / 2,
  }));

  const sma5 = calculateSMA(hl2Candles, 5, 'close');
  const sma34 = calculateSMA(hl2Candles, 34, 'close');

  const sma34Map = new Map(sma34.map((p) => [p.time, p.value!]));
  let prevAo = 0;

  for (const p5 of sma5) {
    const v34 = sma34Map.get(p5.time);
    if (v34 !== undefined) {
      const ao = p5.value! - v34;
      result.push({
        time: p5.time,
        value: ao,
        color: ao >= prevAo ? '#3FB950' : '#F85149',
      });
      prevAo = ao;
    }
  }

  return result;
}

// ─── Ultimate Oscillator ──────────────────────────────────────

export function calculateUltimateOscillator(
  candles: Candle[],
  p1: number = 7,
  p2: number = 14,
  p3: number = 28
): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < p3 + 1) return result;

  const bp: number[] = [];
  const tr: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1].close;
    const trueLow = Math.min(c.low, prevC);
    const trueHigh = Math.max(c.high, prevC);

    bp.push(c.close - trueLow);
    tr.push(trueHigh - trueLow);
  }

  for (let i = p3 - 1; i < bp.length; i++) {
    let bpSum1 = 0, trSum1 = 0;
    let bpSum2 = 0, trSum2 = 0;
    let bpSum3 = 0, trSum3 = 0;

    for (let j = 0; j < p3; j++) {
      const idx = i - j;
      if (j < p1) {
        bpSum1 += bp[idx];
        trSum1 += tr[idx];
      }
      if (j < p2) {
        bpSum2 += bp[idx];
        trSum2 += tr[idx];
      }
      bpSum3 += bp[idx];
      trSum3 += tr[idx];
    }

    const avg1 = trSum1 === 0 ? 0 : bpSum1 / trSum1;
    const avg2 = trSum2 === 0 ? 0 : bpSum2 / trSum2;
    const avg3 = trSum3 === 0 ? 0 : bpSum3 / trSum3;

    const uo = (100 * (4 * avg1 + 2 * avg2 + avg3)) / (4 + 2 + 1);
    result.push({
      time: candles[i + 1].time,
      value: uo,
    });
  }

  return result;
}
