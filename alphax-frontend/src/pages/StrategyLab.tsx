import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Play,
  Copy,
  Trash2,
  Code,
  MessageSquare,
  GitBranch,
  Save,
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';

const SAMPLE_STRATEGIES = [
  { name: 'Liquidity Sweep + BOS', asset: 'XAUUSD', tf: '15m', status: 'draft' },
  { name: 'London Session Breakout', asset: 'GBPUSD', tf: '1H', status: 'draft' },
  { name: 'Fair Value Gap Reversal', asset: 'EURUSD', tf: '4H', status: 'draft' },
];

const CONDITION_TYPES = [
  'Liquidity Sweep', 'BOS', 'CHOCH', 'Order Block', 'Fair Value Gap',
  'RSI Level', 'EMA Cross', 'Trading Session', 'ATR Range', 'Volume Spike',
];

export const StrategyLab: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1300 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Strategy Lab
            </h2>
            <Badge variant="accent">Phase 4</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Build, version, and manage your trading strategies with visual IF/THEN logic.
          </p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={13} />
          New Strategy
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        {/* Strategy list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            My Strategies ({SAMPLE_STRATEGIES.length})
          </div>
          {SAMPLE_STRATEGIES.map((strat, i) => (
            <div
              key={i}
              onClick={() => setSelectedStrategy(i)}
              style={{
                padding: '12px 14px',
                background: selectedStrategy === i ? 'var(--accent-muted)' : 'var(--bg-surface)',
                border: `1px solid ${selectedStrategy === i ? 'rgba(47,129,247,0.3)' : 'var(--border)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: selectedStrategy === i ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {strat.name}
                </span>
                <Badge variant="muted">{strat.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="tag">{strat.asset}</span>
                <span className="tag">{strat.tf}</span>
              </div>
            </div>
          ))}
          <button
            style={{
              padding: '10px',
              background: 'transparent',
              border: '1px dashed var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget).style.borderColor = 'var(--text-muted)')}
            onMouseLeave={(e) => ((e.currentTarget).style.borderColor = 'var(--border)')}
          >
            <Plus size={13} />
            New Strategy
          </button>
        </div>

        {/* Builder area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Tabs
            tabs={[
              { id: 'visual', label: 'Visual Builder', icon: <GitBranch size={13} /> },
              { id: 'nlp', label: 'Natural Language', icon: <MessageSquare size={13} /> },
              { id: 'json', label: 'JSON Schema', icon: <Code size={13} /> },
            ]}
            defaultTab="visual"
          >
            {(active) => (
              <>
                {active === 'visual' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* IF Conditions */}
                    <Panel title="IF Conditions" action={<Button variant="ghost" size="sm"><Plus size={12} /> Add</Button>}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {['Condition 1', 'Condition 2'].map((_cond, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              gap: 8,
                              alignItems: 'center',
                              padding: '10px',
                              background: 'var(--bg-surface2)',
                              borderRadius: 7,
                              border: '1px solid var(--border)',
                            }}
                          >
                            {i > 0 && (
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', minWidth: 28 }}>AND</span>
                            )}
                            <select
                              className="input"
                              style={{ flex: 1, cursor: 'pointer' }}
                              defaultValue=""
                            >
                              <option value="" disabled>Select condition type...</option>
                              {CONDITION_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                            <select className="input" style={{ width: 80, cursor: 'pointer' }}>
                              <option>=</option>
                              <option>≠</option>
                              <option>&gt;</option>
                              <option>&lt;</option>
                            </select>
                            <input className="input" placeholder="Value" style={{ width: 80 }} />
                            <button
                              className="btn btn-ghost btn-icon-sm"
                              style={{ color: 'var(--danger)', borderRadius: 5 }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" style={{ alignSelf: 'flex-start' }}>
                          <Plus size={12} /> Add Condition
                        </Button>
                      </div>
                    </Panel>

                    {/* THEN Actions */}
                    <Panel title="THEN Actions" action={<Button variant="ghost" size="sm"><Plus size={12} /> Add</Button>}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                        {[
                          { label: 'Direction', placeholder: 'BUY / SELL' },
                          { label: 'Stop Loss', placeholder: 'e.g. 1 ATR' },
                          { label: 'Take Profit', placeholder: 'e.g. 2 ATR' },
                          { label: 'Risk %', placeholder: 'e.g. 1%' },
                        ].map((f) => (
                          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
                            <input className="input" placeholder={f.placeholder} />
                          </div>
                        ))}
                      </div>
                    </Panel>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button variant="primary" size="sm">
                        <Save size={13} /> Save Strategy
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy size={13} /> Duplicate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play size={13} /> Send to Backtest
                      </Button>
                    </div>
                  </div>
                )}

                {active === 'nlp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Panel title="Natural Language Strategy Builder" action={<Badge variant="accent">Phase 4</Badge>}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                          Type a strategy description in plain English. The AI will convert it to a structured strategy definition.
                        </p>
                        <textarea
                          className="input"
                          placeholder='e.g. "Create a XAUUSD 15-minute strategy using liquidity sweeps, BOS and 1:2 risk reward during the London session."'
                          style={{ height: 120, resize: 'vertical' }}
                        />
                        <Button variant="primary" size="sm" style={{ alignSelf: 'flex-start' }}>
                          <FlaskConical size={13} />
                          Generate Strategy
                        </Button>
                      </div>
                    </Panel>
                    <EmptyState
                      icon={<MessageSquare size={20} />}
                      title="NLP strategy builder coming in Phase 4"
                      description="AI will parse your description and produce a validated strategy JSON schema."
                    />
                  </div>
                )}

                {active === 'json' && (
                  <Panel title="Strategy JSON Schema">
                    <pre
                      style={{
                        background: 'var(--bg-surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: 16,
                        fontSize: '12px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'var(--text-secondary)',
                        overflowX: 'auto',
                        margin: 0,
                      }}
                    >
{`{
  "id": "strategy-001",
  "name": "— Not yet defined —",
  "version": 1,
  "asset": "XAUUSD",
  "timeframe": "15m",
  "session": "London",
  "conditions": [
    {
      "type": "LiquiditySweep",
      "operator": "equals",
      "value": true
    },
    {
      "type": "BOS",
      "operator": "equals",
      "value": true
    }
  ],
  "actions": {
    "direction": "BUY",
    "stopLoss": "1ATR",
    "takeProfit": "2ATR",
    "riskPercent": 1
  }
}`}
                    </pre>
                  </Panel>
                )}
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};
