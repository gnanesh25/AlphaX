import React from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Target,
  Gauge,
  BarChart2,
  Zap,
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const SCORE_COMPONENTS = [
  { label: 'HTF Structure', score: '—' },
  { label: 'Liquidity', score: '—' },
  { label: 'Entry Structure', score: '—' },
  { label: 'Momentum', score: '—' },
  { label: 'Volatility', score: '—' },
  { label: 'News Risk', score: '—' },
  { label: 'Historical Performance', score: '—' },
];

export const AIIntelligence: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              AI Intelligence
            </h2>
            <Badge variant="accent">Phase 3</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Structured market analysis engine. Available after Phase 2 market data is connected.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Brain size={13} />
          Run Analysis
        </Button>
      </div>

      {/* Phase notice */}
      <div
        style={{
          background: 'rgba(47,129,247,0.06)',
          border: '1px solid rgba(47,129,247,0.2)',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        <Brain size={20} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 6 }}>AI Analysis Engine — Coming in Phase 3</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This module will analyze Higher Timeframe structure, liquidity conditions, momentum, volatility,
            and economic events to produce a structured market assessment — including Setup Score, bias,
            key levels, potential setups, and importantly, clear "Why NOT to Trade" signals.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        {/* Left: Analysis output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Market Bias */}
          <Panel title="Market Bias" action={<Badge variant="muted">Awaiting data</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'HTF Bias', icon: <TrendingUp size={14} />, value: '—' },
                { label: 'Current TF Trend', icon: <TrendingUp size={14} />, value: '—' },
                { label: 'Momentum', icon: <Gauge size={14} />, value: '—' },
                { label: 'Volatility', icon: <BarChart2 size={14} />, value: '—' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ color: 'var(--text-muted)' }}>{item.icon}</div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Potential Setup */}
          <Panel title="Potential Setup" action={<Badge variant="muted">No analysis</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Setup Type', value: '—' },
                { label: 'Entry Zone', value: '—' },
                { label: 'Stop Loss Level', value: '—' },
                { label: 'Target Level', value: '—' },
                { label: 'Risk / Reward', value: '—' },
                { label: 'Invalidation', value: '—' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Why NOT to trade */}
          <Panel
            title="Why NOT To Trade"
            action={<Badge variant="muted">Core feature</Badge>}
          >
            <div
              style={{
                background: 'var(--bg-surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  NO ANALYSIS AVAILABLE
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                When active, this module identifies unfavorable conditions: high-impact news approaching,
                poor risk/reward, conflicting timeframes, low liquidity, or exceeded risk limits.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['High-impact news', 'Poor R:R', 'Conflicting TFs', 'Low liquidity', 'Risk limit reached'].map((tag) => (
                  <div key={tag} className="tag">{tag}</div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Right: Setup Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Setup Score */}
          <Panel title="Setup Score" action={<Badge variant="accent">Proprietary</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', paddingTop: 8 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-surface3)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="8"
                    strokeDasharray="314"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>—</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SCORE_COMPONENTS.map((comp) => (
                  <div key={comp.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{comp.label}</span>
                    <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                      {comp.score}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-surface2)',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                Connect data to generate score
              </div>
            </div>
          </Panel>

          {/* Confidence Note */}
          <Panel elevated>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <AlertTriangle size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Important Disclaimer
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                The Setup Score is an analytical observation tool, not a prediction of future performance.
                It reflects historical pattern analysis and should never be interpreted as a guarantee of profit.
              </p>
            </div>
          </Panel>

          {/* Key Levels */}
          <Panel title="Key Levels" action={<Badge variant="muted">No data</Badge>}>
            <EmptyState
              icon={<Target size={18} />}
              title="No key levels identified"
              description="Connect market data to identify support, resistance, and liquidity zones."
            />
          </Panel>

          {/* Reasons */}
          <Panel title="Analysis Rationale">
            <EmptyState
              icon={<Zap size={18} />}
              title="No analysis available"
              description="AI reasoning and trade rationale will appear here after analysis runs."
            />
          </Panel>
        </div>
      </div>
    </div>
  );
};
