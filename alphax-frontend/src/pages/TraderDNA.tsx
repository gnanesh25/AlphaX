import React from 'react';
import { Dna, Activity, Clock, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';

const DNA_METRICS = [
  { label: 'Best Asset', value: '—', sub: 'Requires trade history' },
  { label: 'Best Timeframe', value: '—', sub: 'Requires trade history' },
  { label: 'Best Session', value: '—', sub: 'Requires trade history' },
  { label: 'Best Strategy', value: '—', sub: 'Requires trade history' },
  { label: 'Average R:R', value: '—', sub: 'Requires trade history' },
  { label: 'Win Rate', value: '—', sub: 'Requires trade history' },
  { label: 'Avg Holding Time', value: '—', sub: 'Requires trade history' },
  { label: 'Most Profitable Setup', value: '—', sub: 'Requires trade history' },
];

const TENDENCIES = [
  { label: 'Overtrading Tendency', value: '—', icon: <Activity size={14} />, color: 'var(--warning)' },
  { label: 'Revenge Trading', value: '—', icon: <AlertTriangle size={14} />, color: 'var(--danger)' },
  { label: 'FOMO Tendency', value: '—', icon: <TrendingUp size={14} />, color: 'var(--warning)' },
  { label: 'Risk Consistency', value: '—', icon: <BarChart2 size={14} />, color: 'var(--success)' },
];

export const TraderDNA: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Trader DNA
            </h2>
            <Badge variant="accent">Phase 7</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Deep behavioral analytics derived from your recorded trading history — not psychological diagnosis.
          </p>
        </div>
      </div>

      {/* Phase notice */}
      <div
        style={{
          background: 'rgba(47,129,247,0.06)',
          border: '1px solid rgba(47,129,247,0.2)',
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <Dna size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: 4 }}>Trader DNA — Requires Trade History</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Log at least 20 trades in the journal to generate your Trader DNA profile. These are statistical observations
            from your recorded activity — not clinical assessments.
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'performance', label: 'Performance Breakdown' },
          { id: 'behavior', label: 'Behavioral Patterns' },
        ]}
        defaultTab="overview"
      >
        {(active) => (
          <>
            {active === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* DNA Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {DNA_METRICS.map((m) => (
                    <div
                      key={m.label}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <span className="section-label">{m.label}</span>
                      <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-muted)' }}>{m.value}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Behavioral tendencies */}
                <Panel title="Behavioral Tendencies" action={<Badge variant="muted">Observations only</Badge>}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {TENDENCIES.map((t) => (
                      <div
                        key={t.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          background: 'var(--bg-surface2)',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'var(--bg-surface3)',
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: t.color,
                          }}
                        >
                          {t.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600 }}>{t.label}</div>
                          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{t.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}

            {active === 'performance' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  'Performance by Session',
                  'Performance by Weekday',
                  'Performance by Asset',
                  'Performance by Strategy',
                ].map((title) => (
                  <Panel key={title} title={title} action={<Badge variant="muted">No data</Badge>}>
                    <EmptyState
                      icon={<BarChart2 size={18} />}
                      title="No data available"
                      description="Log trades to see your performance breakdown."
                    />
                  </Panel>
                ))}
              </div>
            )}

            {active === 'behavior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Panel title="Trading Behavior Timeline" action={<Badge variant="muted">No data</Badge>}>
                  <EmptyState
                    icon={<Clock size={20} />}
                    title="Behavioral timeline unavailable"
                    description="Insights into overtrading, revenge trading, and FOMO patterns will appear after logging sufficient trades."
                  />
                </Panel>
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
};
