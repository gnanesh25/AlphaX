import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Database,
  Brain,
  Clock,
  AlertTriangle,
  Plus,
  Star,
  BarChart2,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const WATCHLIST = [
  { symbol: 'XAUUSD', name: 'Gold vs USD', category: 'commodities' },
  { symbol: 'EURUSD', name: 'Euro vs USD', category: 'forex' },
  { symbol: 'GBPUSD', name: 'Pound vs USD', category: 'forex' },
  { symbol: 'BTCUSD', name: 'Bitcoin vs USD', category: 'crypto' },
  { symbol: 'NASDAQ', name: 'US Tech Index', category: 'indices' },
];

const RECENT_EVENTS = [
  { event: 'US Non-Farm Payrolls', currency: 'USD', impact: 'high', time: '14:30 UTC' },
  { event: 'ECB Rate Decision', currency: 'EUR', impact: 'high', time: '12:45 UTC' },
  { event: 'UK CPI y/y', currency: 'GBP', impact: 'medium', time: '08:00 UTC' },
];




export const Dashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1600 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Trading Command Center
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Connect your market data provider to activate live feeds.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm">
            <Database size={13} />
            Connect Data
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={13} />
            New Trade
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <div
        style={{
          background: 'rgba(47,129,247,0.08)',
          border: '1px solid rgba(47,129,247,0.2)',
          borderRadius: 8,
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
      >
        <Database size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Setup required.</span>{' '}
          Connect a market data provider to populate live prices and activate the trading workspace.
        </span>
        <Button variant="outline" size="sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          Configure
        </Button>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        <StatCard
          label="Portfolio Value"
          value="—"
          subValue="Connect account"
          trend="neutral"
          icon={<TrendingUp size={14} />}
        />
        <StatCard
          label="Today's P&L"
          value="—"
          subValue="No live data"
          trend="neutral"
          icon={<Activity size={14} />}
        />
        <StatCard
          label="Win Rate"
          value="—"
          subValue="No trades recorded"
          trend="neutral"
          icon={<TrendingUp size={14} />}
        />
        <StatCard
          label="Current Drawdown"
          value="—"
          subValue="No account connected"
          trend="neutral"
          icon={<TrendingDown size={14} />}
        />
        <StatCard
          label="Open Positions"
          value="0"
          subValue="No active trades"
          trend="neutral"
          icon={<BarChart2 size={14} />}
        />
        <StatCard
          label="Risk Score"
          value="—"
          subValue="Requires trade data"
          trend="neutral"
          icon={<Shield size={14} />}
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Chart Area */}
          <Panel
            title="Chart Workspace"
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                <Badge variant="muted">1H</Badge>
                <Badge variant="muted">XAUUSD</Badge>
                <Button variant="ghost" size="sm">Open Full</Button>
              </div>
            }
            noPadding
          >
            <div
              style={{
                height: 300,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                background: 'var(--bg-surface2)',
                borderRadius: '0 0 12px 12px',
                border: 'none',
              }}
            >
              <div
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--bg-surface3)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <BarChart2 size={22} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: 4 }}>Chart workspace</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Connect market data to load charts</div>
              </div>
            </div>
          </Panel>

          {/* Open Positions */}
          <Panel title="Open Positions" action={<Badge variant="muted">0 active</Badge>} noPadding>
            <EmptyState
              icon={<Activity size={20} />}
              title="No open positions"
              description="Your active trades will appear here once you connect your account."
            />
          </Panel>

          {/* Recent Trades */}
          <Panel title="Recent Trades" action={<Button variant="ghost" size="sm">View Journal</Button>} noPadding>
            <EmptyState
              icon={<Clock size={20} />}
              title="No recent trades"
              description="Log your first trade in the Journal to see your history here."
              action={{ label: 'Open Journal', onClick: () => {} }}
            />
          </Panel>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Watchlist */}
          <Panel
            title="Watchlist"
            action={
              <Button variant="ghost" size="icon-sm">
                <Plus size={13} />
              </Button>
            }
            noPadding
          >
            <div>
              {WATCHLIST.map((item, i) => (
                <div
                  key={item.symbol}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 16px',
                    borderBottom: i < WATCHLIST.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star size={12} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.symbol}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        padding: '2px 6px',
                        background: 'var(--bg-surface3)',
                        borderRadius: 4,
                        border: '1px solid var(--border)',
                      }}
                    >
                      — / —
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* AI Summary */}
          <Panel
            title="AI Market Summary"
            action={<Badge variant="accent">Phase 3</Badge>}
          >
            <EmptyState
              icon={<Brain size={20} />}
              title="AI analysis pending"
              description="AI Intelligence will be available in Phase 3. Connect market data first."
            />
          </Panel>

          {/* Upcoming Events */}
          <Panel title="Upcoming Events" action={<Badge variant="muted">Today</Badge>} noPadding>
            <div>
              {RECENT_EVENTS.map((ev, i) => (
                <div
                  key={ev.event}
                  style={{
                    padding: '10px 16px',
                    borderBottom: i < RECENT_EVENTS.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{ev.event}</span>
                    {ev.impact === 'high' && (
                      <AlertTriangle size={12} color="var(--danger)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge variant={ev.impact === 'high' ? 'danger' : 'warning'}>{ev.impact}</Badge>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.currency}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: 3 }} />
                      {ev.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Risk Status */}
          <Panel title="Risk Status" action={<Badge variant="muted">No data</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Daily Loss Limit', value: '—' },
                { label: 'Max Drawdown', value: '—' },
                { label: 'Positions at Risk', value: '—' },
              ].map((r) => (
                <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{r.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {r.value}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: '0%', background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: '8px 10px',
                  background: 'var(--bg-surface2)',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                }}
              >
                Connect account to activate risk tracking
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
