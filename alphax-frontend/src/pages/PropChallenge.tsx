import React, { useState } from 'react';
import { Trophy, Plus, AlertTriangle, TrendingDown, Shield, Target } from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';

const SAMPLE_CHALLENGES = [
  {
    name: 'Phase 1 Challenge',
    accountSize: '$10,000',
    profitTarget: '8%',
    dailyDDLimit: '5%',
    maxDD: '10%',
    minDays: 10,
    status: 'active',
  },
];

export const PropChallenge: React.FC = () => {
  const [createModal, setCreateModal] = useState(false);
  const [selectedChallenge] = useState(0);

  const challenge = SAMPLE_CHALLENGES[selectedChallenge];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Prop Challenge
            </h2>
            <Badge variant="accent">Phase 8</Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Simulate prop-firm trading rules and track your challenge progress.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateModal(true)}>
          <Plus size={13} />
          New Challenge
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        {/* Challenge list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="section-label">My Challenges ({SAMPLE_CHALLENGES.length})</span>
          {SAMPLE_CHALLENGES.map((c, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-surface)',
                border: '1px solid rgba(47,129,247,0.3)',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</span>
                <Badge variant="success">{c.status}</Badge>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Account: {c.accountSize}</div>
            </div>
          ))}
        </div>

        {/* Challenge dashboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            <StatCard label="Current Equity" value="—" trend="neutral" icon={<Trophy size={14} />} />
            <StatCard label="Current Profit" value="—" trend="neutral" icon={<Target size={14} />} />
            <StatCard label="Profit Target" value={challenge.profitTarget} trend="neutral" icon={<TrendingDown size={14} />} />
            <StatCard label="Daily DD Remaining" value="—" trend="neutral" icon={<AlertTriangle size={14} />} />
            <StatCard label="Max DD Remaining" value="—" trend="neutral" icon={<Shield size={14} />} />
          </div>

          {/* Progress */}
          <Panel title="Challenge Progress" action={<Badge variant="muted">No trades yet</Badge>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'Profit Target', current: '0%', target: challenge.profitTarget, color: 'var(--success)' },
                { label: 'Daily Drawdown', current: '0%', target: challenge.dailyDDLimit, color: 'var(--danger)' },
                { label: 'Max Drawdown', current: '0%', target: challenge.maxDD, color: 'var(--danger)' },
                { label: 'Min Trading Days', current: '0', target: `${challenge.minDays}`, color: 'var(--accent)' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
                      {item.current} / {item.target}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: '0%', background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Risk warnings */}
          <Panel title="Risk Alerts" action={<Badge variant="success">All clear</Badge>}>
            <EmptyState
              icon={<Shield size={20} />}
              title="No risk alerts"
              description="Warnings will appear when you approach daily loss limits or maximum drawdown thresholds."
            />
          </Panel>

          {/* Rules reference */}
          <Panel title="Challenge Rules" action={<Button variant="ghost" size="sm">Edit</Button>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Account Size', value: challenge.accountSize },
                { label: 'Profit Target', value: challenge.profitTarget },
                { label: 'Daily Loss Limit', value: challenge.dailyDDLimit },
                { label: 'Max Drawdown', value: challenge.maxDD },
                { label: 'Minimum Days', value: `${challenge.minDays} days` },
                { label: 'Status', value: challenge.status.toUpperCase() },
              ].map((rule) => (
                <div key={rule.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span className="section-label">{rule.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{rule.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* Create challenge modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Prop Challenge" width={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Challenge Name', placeholder: 'e.g. FTMO Phase 1' },
            { label: 'Account Size ($)', placeholder: 'e.g. 10000' },
            { label: 'Profit Target (%)', placeholder: 'e.g. 8' },
            { label: 'Daily Loss Limit (%)', placeholder: 'e.g. 5' },
            { label: 'Maximum Drawdown (%)', placeholder: 'e.g. 10' },
            { label: 'Minimum Trading Days', placeholder: 'e.g. 10' },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>{f.label}</label>
              <input className="input" placeholder={f.placeholder} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" size="sm" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm">Create Challenge</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
