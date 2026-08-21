import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Filter,
  Download,
  Upload,
  Search,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';

const TABLE_COLS = ['Date', 'Symbol', 'Dir.', 'Entry', 'Exit', 'SL', 'TP', 'Size', 'R:R', 'Result', 'Session', 'Status'];

const PLACEHOLDER_TRADES = [
  { date: '—', symbol: 'XAUUSD', dir: 'BUY', entry: '—', exit: '—', sl: '—', tp: '—', size: '—', rr: '—', result: '—', session: 'London', status: 'pending' },
  { date: '—', symbol: 'EURUSD', dir: 'SELL', entry: '—', exit: '—', sl: '—', tp: '—', size: '—', rr: '—', result: '—', session: 'US', status: 'pending' },
];

export const Journal: React.FC = () => {
  const [addModal, setAddModal] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Trade Journal
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Log and review every trade. Screenshots, emotion tracking, and AI review included.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm">
            <Download size={13} />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={13} />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddModal(true)}>
            <Plus size={13} />
            Log Trade
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'log', label: 'Trade Log', icon: <BookOpen size={13} /> },
          { id: 'analysis', label: 'Analysis', icon: <TrendingUp size={13} /> },
          { id: 'review', label: 'AI Review', icon: <TrendingDown size={13} /> },
        ]}
        defaultTab="log"
      >
        {(active) => (
          <>
            {active === 'log' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Search & filter bar */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
                    <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input" placeholder="Search trades..." style={{ paddingLeft: 28 }} value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <Button variant="ghost" size="sm"><Filter size={13} /> Filters</Button>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['All', 'Win', 'Loss', 'Pending'].map((f) => (
                      <button
                        key={f}
                        style={{
                          padding: '4px 10px', fontSize: '12px', fontFamily: 'inherit',
                          border: '1px solid var(--border)', borderRadius: 20,
                          cursor: 'pointer', background: 'transparent',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <Panel noPadding>
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          {TABLE_COLS.map((col) => <th key={col}>{col}</th>)}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {PLACEHOLDER_TRADES.map((trade, i) => (
                          <tr key={i}>
                            <td style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.date}</td>
                            <td><span style={{ fontWeight: 600 }}>{trade.symbol}</span></td>
                            <td>
                              <Badge variant={trade.dir === 'BUY' ? 'success' : 'danger'}>{trade.dir}</Badge>
                            </td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.entry}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.exit}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.sl}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.tp}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.size}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.rr}</td>
                            <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{trade.result}</td>
                            <td><span className="tag">{trade.session}</span></td>
                            <td><Badge variant="muted">{trade.status}</Badge></td>
                            <td>
                              <Button variant="ghost" size="sm">View</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {PLACEHOLDER_TRADES.length === 0 && (
                      <EmptyState
                        icon={<BookOpen size={20} />}
                        title="No trades logged"
                        description="Log your first trade to start building your journal."
                        action={{ label: 'Log Trade', onClick: () => setAddModal(true) }}
                      />
                    )}
                  </div>
                </Panel>
              </div>
            )}

            {active === 'analysis' && (
              <EmptyState
                icon={<TrendingUp size={22} />}
                title="Performance analysis"
                description="Trade analysis charts and breakdown will appear once you have logged trades."
              />
            )}

            {active === 'review' && (
              <EmptyState
                icon={<TrendingDown size={22} />}
                title="AI trade review (Phase 7)"
                description="Post-trade AI review compares execution against your strategy rules, risk adherence, and timing."
              />
            )}
          </>
        )}
      </Tabs>

      {/* Log Trade Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Log New Trade" width={560}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Symbol', placeholder: 'e.g. XAUUSD' },
              { label: 'Direction', placeholder: 'BUY / SELL' },
              { label: 'Entry Price', placeholder: '—' },
              { label: 'Exit Price', placeholder: '—' },
              { label: 'Stop Loss', placeholder: '—' },
              { label: 'Take Profit', placeholder: '—' },
              { label: 'Position Size', placeholder: '—' },
              { label: 'Risk (%)', placeholder: 'e.g. 1%' },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
                <input className="input" placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Entry Reason</label>
            <textarea className="input" placeholder="Why did you take this trade?" style={{ height: 72, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Emotion / Confidence</label>
            <input className="input" placeholder="e.g. Calm, 7/10 confidence" />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm">Save Trade</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
