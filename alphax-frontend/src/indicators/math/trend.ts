import type { Candle } from '../../services/marketApi';
import type { IndicatorPlotData } from '../indicatorTypes';

// ─── Helpers ──────────────────────────────────────────────────

export function getCandleSource(candle: Candle, source: string = 'close'): number {
  switch (source.toLowerCase()) {
    case 'open':
      return candle.open;
    case 'high':
      return candle.high;
    case 'low':
      return candle.low;
    case 'hl2':
      return (candle.high + candle.low) / 2;
    case 'hlc3':
      return (candle.high + candle.low + candle.close) / 3;
    case 'ohlc4':
      return (candle.open + candle.high + candle.low + candle.close) / 4;
    case 'close':
    default:
      return candle.close;
  }
}

// ─── Simple Moving Average (SMA) ──────────────────────────────

export function calculateSMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const values = candles.map((c) => getCandleSource(c, source));
  let sum = 0;

  for (let i = 0; i < length - 1; i++) {
    sum += values[i];
  }

  for (let i = length - 1; i < candles.length; i++) {
    sum += values[i];
    result.push({
      time: candles[i].time,
      value: sum / length,
    });
    sum -= values[i - (length - 1)];
  }

  return result;
}

// ─── Exponential Moving Average (EMA) ─────────────────────────

export function calculateEMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const values = candles.map((c) => getCandleSource(c, source));
  const k = 2 / (length + 1);

  // Initial SMA as first EMA seed
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += values[i];
  }
  let prevEma = sum / length;

  result.push({
    time: candles[length - 1].time,
    value: prevEma,
  });

  for (let i = length; i < candles.length; i++) {
    const currentEma = values[i] * k + prevEma * (1 - k);
    result.push({
      time: candles[i].time,
      value: currentEma,
    });
    prevEma = currentEma;
  }

  return result;
}

// ─── Weighted Moving Average (WMA) ────────────────────────────

export function calculateWMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const values = candles.map((c) => getCandleSource(c, source));
  const weightSum = (length * (length + 1)) / 2;

  for (let i = length - 1; i < candles.length; i++) {
    let wSum = 0;
    for (let j = 0; j < length; j++) {
      wSum += values[i - j] * (length - j);
    }
    result.push({
      time: candles[i].time,
      value: wSum / weightSum,
    });
  }

  return result;
}

// ─── Volume Weighted Moving Average (VWMA) ────────────────────

export function calculateVWMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const prices = candles.map((c) => getCandleSource(c, source));
  const volumes = candles.map((c) => c.volume || 1);

  for (let i = length - 1; i < candles.length; i++) {
    let pvSum = 0;
    let vSum = 0;
    for (let j = 0; j < length; j++) {
      const idx = i - j;
      pvSum += prices[idx] * volumes[idx];
      vSum += volumes[idx];
    }
    result.push({
      time: candles[i].time,
      value: vSum === 0 ? prices[i] : pvSum / vSum,
    });
  }

  return result;
}

// ─── Hull Moving Average (HMA) ────────────────────────────────

export function calculateHMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  if (candles.length < length) return [];

  const halfLength = Math.max(1, Math.floor(length / 2));
  const sqrtLength = Math.max(1, Math.floor(Math.sqrt(length)));

  const wmaHalf = calculateWMA(candles, halfLength, source);
  const wmaFull = calculateWMA(candles, length, source);

  const fullMap = new Map(wmaFull.map((p) => [p.time, p.value!]));
  const diffCandles: Candle[] = [];

  for (const p of wmaHalf) {
    const fullVal = fullMap.get(p.time);
    if (fullVal !== undefined) {
      const diff = 2 * p.value! - fullVal;
      diffCandles.push({
        time: p.time,
        open: diff,
        high: diff,
        low: diff,
        close: diff,
      });
    }
  }

  return calculateWMA(diffCandles, sqrtLength, 'close');
}

// ─── Double Exponential Moving Average (DEMA) ─────────────────

export function calculateDEMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  const ema1 = calculateEMA(candles, length, source);
  if (ema1.length === 0) return [];

  const ema1Candles: Candle[] = ema1.map((p) => ({
    time: p.time,
    open: p.value!,
    high: p.value!,
    low: p.value!,
    close: p.value!,
  }));

  const ema2 = calculateEMA(ema1Candles, length, 'close');
  const ema2Map = new Map(ema2.map((p) => [p.time, p.value!]));
  const result: IndicatorPlotData[] = [];

  for (const p of ema1) {
    const e2 = ema2Map.get(p.time);
    if (e2 !== undefined) {
      result.push({
        time: p.time,
        value: 2 * p.value! - e2,
      });
    }
  }

  return result;
}

// ─── Triple Exponential Moving Average (TEMA) ─────────────────

export function calculateTEMA(candles: Candle[], length: number = 20, source: string = 'close'): IndicatorPlotData[] {
  const ema1 = calculateEMA(candles, length, source);
  if (ema1.length === 0) return [];

  const ema1Candles: Candle[] = ema1.map((p) => ({
    time: p.time,
    open: p.value!,
    high: p.value!,
    low: p.value!,
    close: p.value!,
  }));

  const ema2 = calculateEMA(ema1Candles, length, 'close');
  const ema2Candles: Candle[] = ema2.map((p) => ({
    time: p.time,
    open: p.value!,
    high: p.value!,
    low: p.value!,
    close: p.value!,
  }));

  const ema3 = calculateEMA(ema2Candles, length, 'close');
  const ema2Map = new Map(ema2.map((p) => [p.time, p.value!]));
  const ema3Map = new Map(ema3.map((p) => [p.time, p.value!]));
  const result: IndicatorPlotData[] = [];

  for (const p of ema1) {
    const e2 = ema2Map.get(p.time);
    const e3 = ema3Map.get(p.time);
    if (e2 !== undefined && e3 !== undefined) {
      result.push({
        time: p.time,
        value: 3 * p.value! - 3 * e2 + e3,
      });
    }
  }

  return result;
}

// ─── Supertrend ───────────────────────────────────────────────

export function calculateSupertrend(
  candles: Candle[],
  period: number = 10,
  multiplier: number = 3
): { trend: IndicatorPlotData[]; direction: IndicatorPlotData[] } {
  const trend: IndicatorPlotData[] = [];
  const direction: IndicatorPlotData[] = [];
  if (candles.length < period) return { trend, direction };

  // Calculate ATR
  const trs: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hpc = Math.abs(candles[i].high - candles[i - 1].close);
    const lpc = Math.abs(candles[i].low - candles[i - 1].close);
    trs.push(Math.max(hl, hpc, lpc));
  }

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const atrs: number[] = new Array(period - 1).fill(0);
  atrs.push(atr);

  for (let i = period; i < candles.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    atrs.push(atr);
  }

  let prevUpper = 0;
  let prevLower = 0;
  let prevClose = 0;
  let currentTrend = 1; // 1 for bull (green), -1 for bear (red)

  for (let i = period - 1; i < candles.length; i++) {
    const c = candles[i];
    const curAtr = atrs[i];
    const hl2 = (c.high + c.low) / 2;

    let basicUpper = hl2 + multiplier * curAtr;
    let basicLower = hl2 - multiplier * curAtr;

    let finalUpper = basicUpper;
    let finalLower = basicLower;

    if (i > period - 1) {
      finalUpper = basicUpper < prevUpper || prevClose > prevUpper ? basicUpper : prevUpper;
      finalLower = basicLower > prevLower || prevClose < prevLower ? basicLower : prevLower;

      if (currentTrend === 1 && c.close < finalLower) {
        currentTrend = -1;
      } else if (currentTrend === -1 && c.close > finalUpper) {
        currentTrend = 1;
      }
    }

    prevUpper = finalUpper;
    prevLower = finalLower;
    prevClose = c.close;

    const val = currentTrend === 1 ? finalLower : finalUpper;
    trend.push({
      time: c.time,
      value: val,
      color: currentTrend === 1 ? '#3FB950' : '#F85149',
    });

    direction.push({
      time: c.time,
      value: currentTrend,
    });
  }

  return { trend, direction };
}

// ─── Parabolic SAR ────────────────────────────────────────────

export function calculateParabolicSAR(
  candles: Candle[],
  step: number = 0.02,
  maxStep: number = 0.2
): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < 2) return result;

  let isLong = candles[1].close > candles[0].close;
  let af = step;
  let ep = isLong ? candles[0].high : candles[0].low;
  let sar = isLong ? candles[0].low : candles[0].high;

  result.push({ time: candles[0].time, value: sar });

  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prev = candles[i - 1];

    if (isLong) {
      sar = sar + af * (ep - sar);
      sar = Math.min(sar, prev.low, i > 1 ? candles[i - 2].low : prev.low);

      if (cur.high > ep) {
        ep = cur.high;
        af = Math.min(af + step, maxStep);
      }

      if (cur.low < sar) {
        isLong = false;
        sar = ep;
        ep = cur.low;
        af = step;
      }
    } else {
      sar = sar + af * (ep - sar);
      sar = Math.max(sar, prev.high, i > 1 ? candles[i - 2].high : prev.high);

      if (cur.low < ep) {
        ep = cur.low;
        af = Math.min(af + step, maxStep);
      }

      if (cur.high > sar) {
        isLong = true;
        sar = ep;
        ep = cur.high;
        af = step;
      }
    }

    result.push({
      time: cur.time,
      value: sar,
      color: isLong ? '#3FB950' : '#F85149',
    });
  }

  return result;
}

// ─── Ichimoku Cloud ───────────────────────────────────────────

export function calculateIchimoku(
  candles: Candle[],
  tenkanLen: number = 9,
  kijunLen: number = 26,
  senkouSpanBLen: number = 52
): {
  tenkan: IndicatorPlotData[];
  kijun: IndicatorPlotData[];
  senkouA: IndicatorPlotData[];
  senkouB: IndicatorPlotData[];
  chikou: IndicatorPlotData[];
} {
  const tenkan: IndicatorPlotData[] = [];
  const kijun: IndicatorPlotData[] = [];
  const senkouA: IndicatorPlotData[] = [];
  const senkouB: IndicatorPlotData[] = [];
  const chikou: IndicatorPlotData[] = [];

  const getHL2Range = (startIdx: number, len: number) => {
    let maxH = -Infinity;
    let minL = Infinity;
    for (let i = startIdx; i > startIdx - len && i >= 0; i--) {
      if (candles[i].high > maxH) maxH = candles[i].high;
      if (candles[i].low < minL) minL = candles[i].low;
    }
    return (maxH + minL) / 2;
  };

  for (let i = 0; i < candles.length; i++) {
    const time = candles[i].time;

    // Tenkan-sen
    if (i >= tenkanLen - 1) {
      tenkan.push({ time, value: getHL2Range(i, tenkanLen) });
    }

    // Kijun-sen
    if (i >= kijunLen - 1) {
      kijun.push({ time, value: getHL2Range(i, kijunLen) });
    }

    // Senkou Span A & B (projected forward by displacement)
    if (i >= kijunLen - 1) {
      const tenkVal = getHL2Range(i, tenkanLen);
      const kijVal = getHL2Range(i, kijunLen);
      const spanAVal = (tenkVal + kijVal) / 2;
      senkouA.push({ time, value: spanAVal });
    }

    if (i >= senkouSpanBLen - 1) {
      const spanBVal = getHL2Range(i, senkouSpanBLen);
      senkouB.push({ time, value: spanBVal });
    }

    // Chikou Span (lagging close)
    chikou.push({ time, value: candles[i].close });
  }

  return { tenkan, kijun, senkouA, senkouB, chikou };
}
