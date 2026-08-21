import React, { useState } from 'react';
import {
  TestTube2,
  Play,
  Upload,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  Activity,
} from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Dropdown } from '../components/ui/Dropdown';
import { StatCard } from '../components/ui/StatCard';

const STRATEGY_OPTS = [
  { label: 'Select strategy...', value: '' },
  { label: 'Liquidity Sweep + BOS', value: 'strat-1' },
  { label: 'London Session Breakout', value: 'strat-2' },
  { label: 'Fair Value Gap Reversal', value: 'strat-3' },
];

const ASSET_OPTS = [
  { label: 'XAUUSD', value: 'XAUUSD' },
  { label: 'EURUSD', value: 'EURUSD' },
  { label: 'GBPUSD', value: 'GBPUSD' },
  { label: 'BTCUSD', value: 'BTCUSD' },
];

export const Backtest: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('XAUUSD');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1300 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Backtest Engine
            </h2>
            <Badge variant="accent">Phase 5</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Python-powered historical strategy testing with full analytics output.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* Config panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel title="Backtest Configuration">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="section-label">Strategy</label>
                <Dropdown options={STRATEGY_OPTS} value={selectedStrategy} onChange={setSelectedStrategy} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="section-label">Instrument</label>
                <Dropdown options={ASSET_OPTS} value={selectedAsset} onChange={setSelectedAsset} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="section-label">Date Range</label>
                <input className="input" type="date" placeholder="Start date" />
                <input className="input" type="date" placeholder="End date" style={{ marginTop: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="section-label">Initial Capital ($)</label>
                <input className="input" placeholder="e.g. 10,000" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="section-label">Risk per Trade (%)</label>
                <input className="input" placeholder="e.g. 1%" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label className="section-label">Spread (pips)</label>
                <input className="input" placeholder="e.g. 0.3" />
              </div>
              <div className="divider" />
              <Button variant="primary" size="md" style={{ width: '100%' }}>
                <Play size={14} />
                Run Backtest
              </Button>
              <Button variant="outline" size="sm" style={{ width: '100%' }}>
                <Upload size={13} />
                Import Historical Data
              </Button>
            </div>
          </Panel>

          <Panel elevated>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Backtest engine uses Python on the backend (Phase 5). Results are clearly labeled as historical simulation and exclude look-ahead bias.
            </div>
          </Panel>
        </div>

        {/* Results area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            <StatCard label="Total Trades" value="—" trend="neutral" icon={<Activity size={14} />} />
            <StatCard label="Win Rate" value="—" trend="neutral" icon={<TrendingUp size={14} />} />
            <StatCard label="Profit Factor" value="—" trend="neutral" icon={<Target size={14} />} />
            <StatCard label="Net Return" value="—" trend="neutral" icon={<TrendingUp size={14} />} />
            <StatCard label="Max Drawdown" value="—" trend="neutral" icon={<TrendingDown size={14} />} />
            <StatCard label="Sharpe Ratio" value="—" trend="neutral" icon={<BarChart2 size={14} />} />
          </div>

          {/* Equity Curve */}
          <Panel title="Equity Curve" action={<Badge variant="muted">No results</Badge>} noPadding>
            <EmptyState
              icon={<TrendingUp size={20} />}
              title="No backtest results"
              description="Configure and run a backtest above to see the equity curve and performance metrics."
            />
          </Panel>

          {/* Trade Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel title="Win / Loss Analysis" action={<Badge variant="muted">No data</Badge>}>
              <EmptyState
                icon={<BarChart2 size={18} />}
                title="No data"
                description="Run a backtest first."
              />
            </Panel>
            <Panel title="Monthly Performance" action={<Badge variant="muted">No data</Badge>}>
              <EmptyState
                icon={<Activity size={18} />}
                title="No data"
                description="Run a backtest first."
              />
            </Panel>
          </div>

          {/* Trade log */}
          <Panel title="Trade Log" action={<Badge variant="muted">0 trades</Badge>} noPadding>
            <EmptyState
              icon={<TestTube2 size={20} />}
              title="No trades to display"
              description="Backtest trade-by-trade results will appear here after running the engine."
            />
          </Panel>
        </div>
      </div>
    </div>
  );
};
