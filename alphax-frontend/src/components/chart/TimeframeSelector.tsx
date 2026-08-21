import React from 'react';

const TIMEFRAMES = [
  { label: '1m', value: '1min' },
  { label: '5m', value: '5min' },
  { label: '15m', value: '15min' },
  { label: '30m', value: '30min' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1day' },
];

interface TimeframeSelectorProps {
  activeTimeframe: string;
  onChange: (timeframe: string) => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  activeTimeframe,
  onChange,
}) => {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onChange(tf.value)}
          style={{
            padding: '4px 9px',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'inherit',
            border: '1px solid transparent',
            borderRadius: 4,
            cursor: 'pointer',
            background: activeTimeframe === tf.value ? 'var(--accent-muted)' : 'transparent',
            color: activeTimeframe === tf.value ? 'var(--accent)' : 'var(--text-secondary)',
            borderColor: activeTimeframe === tf.value ? 'rgba(47,129,247,0.3)' : 'transparent',
            transition: 'all 0.1s ease',
          }}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
};
