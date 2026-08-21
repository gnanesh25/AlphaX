import type { Candle } from '../../services/marketApi';
import type { IndicatorPlotData } from '../indicatorTypes';

// ─── Raw Volume with Up/Down Color ────────────────────────────

export function calculateVolume(candles: Candle[]): IndicatorPlotData[] {
  return candles.map((c, i) => {
    const isUp = i === 0 ? c.close >= c.open : c.close >= candles[i - 1].close;
    return {
      time: c.time,
      value: c.volume || 0,
      color: isUp ? 'rgba(63, 185, 80, 0.6)' : 'rgba(248, 81, 73, 0.6)',
    };
  });
}

// ─── Volume SMA ───────────────────────────────────────────────

export function calculateVolumeSMA(candles: Candle[], length: number = 20): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length) return result;

  const vols = candles.map((c) => c.volume || 0);
  let sum = 0;

  for (let i = 0; i < length - 1; i++) {
    sum += vols[i];
  }

  for (let i = length - 1; i < candles.length; i++) {
    sum += vols[i];
    result.push({
      time: candles[i].time,
      value: sum / length,
    });
    sum -= vols[i - (length - 1)];
  }

  return result;
}

// ─── On-Balance Volume (OBV) ──────────────────────────────────

export function calculateOBV(candles: Candle[]): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length === 0) return result;

  let currentObv = 0;
  result.push({ time: candles[0].time, value: currentObv });

  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prev = candles[i - 1];
    const vol = cur.volume || 1;

    if (cur.close > prev.close) {
      currentObv += vol;
    } else if (cur.close < prev.close) {
      currentObv -= vol;
    }

    result.push({
      time: cur.time,
      value: currentObv,
    });
  }

  return result;
}

// ─── Volume Weighted Average Price (VWAP) ─────────────────────

export function calculateVWAP(candles: Candle[]): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length === 0) return result;

  let cumVolume = 0;
  let cumVolPrice = 0;
  let lastDay = -1;

  for (const c of candles) {
    const date = new Date(c.time * 1000);
    const day = date.getUTCDate();

    // Session reset at start of each calendar day
    if (day !== lastDay) {
      cumVolume = 0;
      cumVolPrice = 0;
      lastDay = day;
    }

    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume && c.volume > 0 ? c.volume : 1;

    cumVolPrice += typicalPrice * vol;
    cumVolume += vol;

    result.push({
      time: c.time,
      value: cumVolPrice / cumVolume,
    });
  }

  return result;
}

// ─── Money Flow Index (MFI) ───────────────────────────────────

export function calculateMFI(candles: Candle[], length: number = 14): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length < length + 1) return result;

  const typicalPrices = candles.map((c) => (c.high + c.low + c.close) / 3);
  const rawMoneyFlow = candles.map((c, i) => typicalPrices[i] * (c.volume || 1));

  for (let i = length; i < candles.length; i++) {
    let posFlow = 0;
    let negFlow = 0;

    for (let j = 0; j < length; j++) {
      const curIdx = i - j;
      const prevIdx = curIdx - 1;

      if (typicalPrices[curIdx] > typicalPrices[prevIdx]) {
        posFlow += rawMoneyFlow[curIdx];
      } else if (typicalPrices[curIdx] < typicalPrices[prevIdx]) {
        negFlow += rawMoneyFlow[curIdx];
      }
    }

    const moneyRatio = negFlow === 0 ? 100 : posFlow / negFlow;
    const mfi = 100 - 100 / (1 + moneyRatio);

    result.push({
      time: candles[i].time,
      value: Math.max(0, Math.min(100, mfi)),
    });
  }

  return result;
}

// ─── Accumulation / Distribution Line (A/D) ───────────────────

export function calculateAccumulationDistribution(candles: Candle[]): IndicatorPlotData[] {
  const result: IndicatorPlotData[] = [];
  if (candles.length === 0) return result;

  let currentAd = 0;

  for (const c of candles) {
    const range = c.high - c.low;
    const clv = range === 0 ? 0 : ((c.close - c.low) - (c.high - c.close)) / range;
    const moneyFlowVol = clv * (c.volume || 1);
    currentAd += moneyFlowVol;

    result.push({
      time: c.time,
      value: currentAd,
    });
  }

  return result;
}
