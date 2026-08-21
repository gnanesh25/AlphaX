import React, { useState } from 'react';
import { Filter, AlertTriangle, Clock, Info } from 'lucide-react';

import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const EVENTS = [
  { time: '08:30', currency: 'USD', impact: 'high', event: 'Non-Farm Payrolls', forecast: '—', previous: '—', actual: '—' },
  { time: '10:00', currency: 'USD', impact: 'medium', event: 'ISM Manufacturing PMI', forecast: '—', previous: '—', actual: '—' },
  { time: '12:45', currency: 'EUR', impact: 'high', event: 'ECB Interest Rate Decision', forecast: '—', previous: '—', actual: '—' },
  { time: '13:30', currency: 'EUR', impact: 'medium', event: 'ECB Press Conference', forecast: '—', previous: '—', actual: '—' },
  { time: '07:00', currency: 'GBP', impact: 'high', event: 'UK Consumer Price Index', forecast: '—', previous: '—', actual: '—' },
  { time: '04:30', currency: 'JPY', impact: 'medium', event: 'BOJ Summary of Opinions', forecast: '—', previous: '—', actual: '—' },
  { time: '14:30', currency: 'USD', impact: 'low', event: 'Crude Oil Inventories', forecast: '—', previous: '—', actual: '—' },
];

const CURRENCIES = ['All', 'USD', 'EUR', 'GBP', 'JPY'];
const IMPACTS = ['All', 'High', 'Medium', 'Low'];

export const EconomicCalendar: React.FC = () => {
  const [activeCurrency, setActiveCurrency] = useState('All');
  const [activeImpact, setActiveImpact] = useState('All');

  const filtered = EVENTS.filter((e) => {
    const matchCur = activeCurrency === 'All' || e.currency === activeCurrency;
    const matchImp = activeImpact === 'All' || e.impact === activeImpact.toLowerCase();
    return matchCur && matchImp;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Economic Calendar
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Upcoming economic events. Connect a data provider to see live forecasts and actuals.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Filter size={13} />
          Filters
        </Button>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}
      >
        <Info size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          <strong style={{ color: 'var(--text-primary)' }}>Data not connected.</strong>{' '}
          Forecast and actual values will be populated after connecting a data provider. Event names shown are structural placeholders only.
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 2 }}>Currency:</span>
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCurrency(c)}
              style={{
                padding: '4px 10px', fontSize: '12px', fontFamily: 'inherit',
                border: `1px solid ${activeCurrency === c ? 'rgba(47,129,247,0.3)' : 'var(--border)'}`,
                borderRadius: 20, cursor: 'pointer',
                background: activeCurrency === c ? 'var(--accent-muted)' : 'transparent',
                color: activeCurrency === c ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 2 }}>Impact:</span>
          {IMPACTS.map((imp) => (
            <button
              key={imp}
              onClick={() => setActiveImpact(imp)}
              style={{
                padding: '4px 10px', fontSize: '12px', fontFamily: 'inherit',
                border: `1px solid ${activeImpact === imp ? 'rgba(47,129,247,0.3)' : 'var(--border)'}`,
                borderRadius: 20, cursor: 'pointer',
                background: activeImpact === imp ? 'var(--accent-muted)' : 'transparent',
                color: activeImpact === imp ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {imp}
            </button>
          ))}
        </div>
      </div>

      {/* High Impact Warning */}
      {filtered.some((e) => e.impact === 'high') && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(248,81,73,0.08)',
            border: '1px solid rgba(248,81,73,0.25)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '13px',
            color: 'var(--danger)',
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>High-impact events approaching.</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
            Consider your position sizing and exposure during these events.
          </span>
        </div>
      )}

      {/* Calendar Table */}
      <Panel noPadding>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th><Clock size={11} style={{ display: 'inline', marginRight: 4 }} />Time (UTC)</th>
                <th>Currency</th>
                <th>Impact</th>
                <th>Event</th>
                <th>Forecast</th>
                <th>Previous</th>
                <th>Actual</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                    {event.time}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{event.currency}</span>
                  </td>
                  <td>
                    <Badge variant={event.impact === 'high' ? 'danger' : event.impact === 'medium' ? 'warning' : 'muted'}>
                      {event.impact}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 500 }}>{event.event}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{event.forecast}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{event.previous}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>{event.actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No events match the selected filters.
            </div>
          )}
        </div>
      </Panel>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
        Economic data is structural placeholder only. Never fabricate or assume economic event outcomes. Connect a data provider for live calendar data.
      </p>
    </div>
  );
};
