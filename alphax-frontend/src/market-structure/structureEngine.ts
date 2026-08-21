import type { Candle } from '../services/marketApi';
import type {
  SwingPoint,
  BreakOfStructure,
  FairValueGap,
  OrderBlock,
  LiquidityLevel,
  SRLevel,
  TradingSession,
  MarketStructureConfig,
  MarketStructureResult,
} from './structureTypes';

export const DEFAULT_STRUCTURE_CONFIG: MarketStructureConfig = {
  showSwings: true,
  swingLookback: 5,
  showBOS: true,
  showCHOCH: true,
  showFVG: true,
  minFvgSizePct: 0.02,
  showOrderBlocks: true,
  showLiquidity: true,
  showEquilibrium: true,
  showSRLevels: true,
  showSessions: true,
  userTimezoneOffset: 0,
};

// ─── 1. Swing High & Swing Low Detection ──────────────────────

export function detectSwings(candles: Candle[], lookback: number = 5): SwingPoint[] {
  const swings: SwingPoint[] = [];
  const n = candles.length;
  if (n < lookback * 2 + 1) return swings;

  for (let i = lookback; i < n - lookback; i++) {
    const current = candles[i];
    let isHigh = true;
    let isLow = true;

    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].high >= current.high || candles[i + j].high > current.high) {
        isHigh = false;
      }
      if (candles[i - j].low <= current.low || candles[i + j].low < current.low) {
        isLow = false;
      }
    }

    if (isHigh) {
      swings.push({
        index: i,
        time: current.time,
        price: current.high,
        type: 'high',
        confirmed: true,
      });
    }

    if (isLow) {
      swings.push({
        index: i,
        time: current.time,
        price: current.low,
        type: 'low',
        confirmed: true,
      });
    }
  }

  // Sort by index/time
  return swings.sort((a, b) => a.index - b.index);
}

// ─── 2. Break of Structure (BOS) & Change of Character (CHOCH) ─

export function detectBOSAndCHOCH(swings: SwingPoint[]): BreakOfStructure[] {
  const breaks: BreakOfStructure[] = [];
  if (swings.length < 2) return breaks;

  let lastTrend: 'bullish' | 'bearish' | null = null;
  let lastSwingHigh: SwingPoint | null = null;
  let lastSwingLow: SwingPoint | null = null;

  for (const s of swings) {
    if (s.type === 'high') {
      // Check if price breaks above previous swing high
      if (lastSwingHigh && s.price > lastSwingHigh.price) {
        const isChoch = lastTrend === 'bearish';
        breaks.push({
          id: `bos_high_${s.time}`,
          type: isChoch ? 'CHOCH' : 'BOS',
          direction: 'bullish',
          fromTime: lastSwingHigh.time,
          toTime: s.time,
          price: lastSwingHigh.price,
          brokenSwing: lastSwingHigh,
        });
        lastTrend = 'bullish';
      }
      lastSwingHigh = s;
    } else {
      // Check if price breaks below previous swing low
      if (lastSwingLow && s.price < lastSwingLow.price) {
        const isChoch = lastTrend === 'bullish';
        breaks.push({
          id: `bos_low_${s.time}`,
          type: isChoch ? 'CHOCH' : 'BOS',
          direction: 'bearish',
          fromTime: lastSwingLow.time,
          toTime: s.time,
          price: lastSwingLow.price,
          brokenSwing: lastSwingLow,
        });
        lastTrend = 'bearish';
      }
      lastSwingLow = s;
    }
  }

  return breaks;
}

// ─── 3. Fair Value Gap (FVG) Detection ────────────────────────

export function detectFVGs(candles: Candle[], minFvgSizePct: number = 0.02): FairValueGap[] {
  const fvgs: FairValueGap[] = [];
  if (candles.length < 3) return fvgs;

  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2];
    const c2 = candles[i - 1];
    const c3 = candles[i];

    // Bullish FVG: Bar 1 High < Bar 3 Low
    if (c3.low > c1.high) {
      const gap = c3.low - c1.high;
      const gapPct = (gap / c2.close) * 100;
      if (gapPct >= minFvgSizePct) {
        // Check mitigation in subsequent candles
        let mitigated = false;
        let endTime: number | undefined = undefined;

        for (let k = i + 1; k < candles.length; k++) {
          if (candles[k].low <= c1.high) {
            mitigated = true;
            endTime = candles[k].time;
            break;
          }
        }

        fvgs.push({
          id: `fvg_bull_${c2.time}`,
          type: 'bullish',
          startTime: c2.time,
          endTime: endTime || candles[candles.length - 1].time,
          top: c3.low,
          bottom: c1.high,
          mitigated,
          midpoint: (c3.low + c1.high) / 2,
        });
      }
    }

    // Bearish FVG: Bar 1 Low > Bar 3 High
    if (c1.low > c3.high) {
      const gap = c1.low - c3.high;
      const gapPct = (gap / c2.close) * 100;
      if (gapPct >= minFvgSizePct) {
        let mitigated = false;
        let endTime: number | undefined = undefined;

        for (let k = i + 1; k < candles.length; k++) {
          if (candles[k].high >= c1.low) {
            mitigated = true;
            endTime = candles[k].time;
            break;
          }
        }

        fvgs.push({
          id: `fvg_bear_${c2.time}`,
          type: 'bearish',
          startTime: c2.time,
          endTime: endTime || candles[candles.length - 1].time,
          top: c1.low,
          bottom: c3.high,
          mitigated,
          midpoint: (c1.low + c3.high) / 2,
        });
      }
    }
  }

  return fvgs;
}

// ─── 4. Order Block (OB) Detection ────────────────────────────

export function detectOrderBlocks(candles: Candle[], breaks: BreakOfStructure[]): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];
  if (candles.length < 5 || breaks.length === 0) return orderBlocks;

  const timeIndexMap = new Map<number, number>();
  candles.forEach((c, idx) => timeIndexMap.set(c.time, idx));

  for (const b of breaks) {
    const breakIdx = timeIndexMap.get(b.toTime);
    if (breakIdx === undefined || breakIdx < 2) continue;

    if (b.direction === 'bullish') {
      // Find last down candle before breakout
      for (let i = breakIdx - 1; i >= Math.max(0, breakIdx - 6); i--) {
        if (candles[i].close < candles[i].open) {
          const obCandle = candles[i];
          let mitigated = false;
          let endTime: number | undefined = undefined;

          for (let k = i + 1; k < candles.length; k++) {
            if (candles[k].low <= obCandle.low) {
              mitigated = true;
              endTime = candles[k].time;
              break;
            }
          }

          orderBlocks.push({
            id: `ob_bull_${obCandle.time}`,
            type: 'bullish',
            startTime: obCandle.time,
            endTime: endTime || candles[candles.length - 1].time,
            top: obCandle.high,
            bottom: obCandle.low,
            mitigated,
          });
          break;
        }
      }
    } else {
      // Find last up candle before breakdown
      for (let i = breakIdx - 1; i >= Math.max(0, breakIdx - 6); i--) {
        if (candles[i].close > candles[i].open) {
          const obCandle = candles[i];
          let mitigated = false;
          let endTime: number | undefined = undefined;

          for (let k = i + 1; k < candles.length; k++) {
            if (candles[k].high >= obCandle.high) {
              mitigated = true;
              endTime = candles[k].time;
              break;
            }
          }

          orderBlocks.push({
            id: `ob_bear_${obCandle.time}`,
            type: 'bearish',
            startTime: obCandle.time,
            endTime: endTime || candles[candles.length - 1].time,
            top: obCandle.high,
            bottom: obCandle.low,
            mitigated,
          });
          break;
        }
      }
    }
  }

  return orderBlocks;
}

// ─── 5. Liquidity (EQH, EQL, Sweeps) ──────────────────────────

export function detectLiquidity(swings: SwingPoint[]): LiquidityLevel[] {
  const liquidity: LiquidityLevel[] = [];
  const highs = swings.filter((s) => s.type === 'high');
  const lows = swings.filter((s) => s.type === 'low');

  const tolerancePct = 0.08; // 0.08% close proximity

  // Equal Highs (EQH)
  for (let i = 0; i < highs.length - 1; i++) {
    for (let j = i + 1; j < highs.length && j <= i + 3; j++) {
      const diffPct = (Math.abs(highs[i].price - highs[j].price) / highs[i].price) * 100;
      if (diffPct <= tolerancePct) {
        liquidity.push({
          id: `eqh_${highs[i].time}_${highs[j].time}`,
          type: 'EQH',
          price: (highs[i].price + highs[j].price) / 2,
          time: highs[i].time,
          label: 'EQH (Liquidity)',
        });
      }
    }
  }

  // Equal Lows (EQL)
  for (let i = 0; i < lows.length - 1; i++) {
    for (let j = i + 1; j < lows.length && j <= i + 3; j++) {
      const diffPct = (Math.abs(lows[i].price - lows[j].price) / lows[i].price) * 100;
      if (diffPct <= tolerancePct) {
        liquidity.push({
          id: `eql_${lows[i].time}_${lows[j].time}`,
          type: 'EQL',
          price: (lows[i].price + lows[j].price) / 2,
          time: lows[i].time,
          label: 'EQL (Liquidity)',
        });
      }
    }
  }

  return liquidity;
}

// ─── 6. Support / Resistance & Session Markers ─────────────────

export function detectSRAndSessions(candles: Candle[]): { srLevels: SRLevel[]; sessions: TradingSession[] } {
  const srLevels: SRLevel[] = [];
  const sessions: TradingSession[] = [];
  if (candles.length === 0) return { srLevels, sessions };

  // Group candles by calendar day (UTC)
  const daysMap = new Map<string, Candle[]>();

  for (const c of candles) {
    const d = new Date(c.time * 1000);
    const dayKey = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
    const list = daysMap.get(dayKey) || [];
    list.push(c);
    daysMap.set(dayKey, list);
  }

  const days = Array.from(daysMap.values());
  if (days.length >= 2) {
    // Previous Day High / Low
    const prevDayCandles = days[days.length - 2];
    const pdh = Math.max(...prevDayCandles.map((c) => c.high));
    const pdl = Math.min(...prevDayCandles.map((c) => c.low));

    srLevels.push({
      id: 'pdh',
      label: 'Previous Day High (PDH)',
      price: pdh,
      color: '#3FB950',
    });

    srLevels.push({
      id: 'pdl',
      label: 'Previous Day Low (PDL)',
      price: pdl,
      color: '#F85149',
    });
  }

  // Session identification (Asian: 00-09 UTC, London: 07-16 UTC, NY: 12-21 UTC)
  const recentCandles = candles.slice(-200);
  const currentDayStr = new Date().toISOString().split('T')[0];

  const asianCandles = recentCandles.filter((c) => {
    const h = new Date(c.time * 1000).getUTCHours();
    return h >= 0 && h < 9;
  });

  const londonCandles = recentCandles.filter((c) => {
    const h = new Date(c.time * 1000).getUTCHours();
    return h >= 7 && h < 16;
  });

  const nyCandles = recentCandles.filter((c) => {
    const h = new Date(c.time * 1000).getUTCHours();
    return h >= 12 && h < 21;
  });

  if (asianCandles.length > 0) {
    sessions.push({
      id: `asian_${currentDayStr}`,
      name: 'Asian',
      startTime: asianCandles[0].time,
      endTime: asianCandles[asianCandles.length - 1].time,
      high: Math.max(...asianCandles.map((c) => c.high)),
      low: Math.min(...asianCandles.map((c) => c.low)),
      color: 'rgba(56, 139, 253, 0.15)',
    });
  }

  if (londonCandles.length > 0) {
    sessions.push({
      id: `london_${currentDayStr}`,
      name: 'London',
      startTime: londonCandles[0].time,
      endTime: londonCandles[londonCandles.length - 1].time,
      high: Math.max(...londonCandles.map((c) => c.high)),
      low: Math.min(...londonCandles.map((c) => c.low)),
      color: 'rgba(163, 113, 247, 0.15)',
    });
  }

  if (nyCandles.length > 0) {
    sessions.push({
      id: `ny_${currentDayStr}`,
      name: 'New York',
      startTime: nyCandles[0].time,
      endTime: nyCandles[nyCandles.length - 1].time,
      high: Math.max(...nyCandles.map((c) => c.high)),
      low: Math.min(...nyCandles.map((c) => c.low)),
      color: 'rgba(210, 153, 34, 0.15)',
    });
  }

  return { srLevels, sessions };
}

// ─── 7. Master Calculation Engine ─────────────────────────────

export function calculateMarketStructure(
  candles: Candle[],
  config: MarketStructureConfig = DEFAULT_STRUCTURE_CONFIG
): MarketStructureResult {
  if (candles.length === 0) {
    return {
      swings: [],
      breaks: [],
      fvgs: [],
      orderBlocks: [],
      liquidity: [],
      srLevels: [],
      sessions: [],
    };
  }

  const swings = config.showSwings ? detectSwings(candles, config.swingLookback) : [];
  const breaks = config.showBOS || config.showCHOCH ? detectBOSAndCHOCH(swings) : [];
  const fvgs = config.showFVG ? detectFVGs(candles, config.minFvgSizePct) : [];
  const orderBlocks = config.showOrderBlocks ? detectOrderBlocks(candles, breaks) : [];
  const liquidity = config.showLiquidity ? detectLiquidity(swings) : [];

  let equilibrium: MarketStructureResult['equilibrium'] = undefined;
  if (config.showEquilibrium && swings.length >= 2) {
    const recentHighs = swings.filter((s) => s.type === 'high');
    const recentLows = swings.filter((s) => s.type === 'low');
    if (recentHighs.length > 0 && recentLows.length > 0) {
      const highest = recentHighs[recentHighs.length - 1].price;
      const lowest = recentLows[recentLows.length - 1].price;
      equilibrium = {
        high: highest,
        low: lowest,
        mid: (highest + lowest) / 2,
        topColor: 'rgba(248, 81, 73, 0.12)', // Premium Zone
        bottomColor: 'rgba(63, 185, 80, 0.12)', // Discount Zone
      };
    }
  }

  const { srLevels, sessions } = detectSRAndSessions(candles);

  return {
    swings,
    breaks: breaks.filter((b) => (b.type === 'BOS' && config.showBOS) || (b.type === 'CHOCH' && config.showCHOCH)),
    fvgs,
    orderBlocks,
    liquidity,
    equilibrium,
    srLevels: config.showSRLevels ? srLevels : [],
    sessions: config.showSessions ? sessions : [],
  };
}
