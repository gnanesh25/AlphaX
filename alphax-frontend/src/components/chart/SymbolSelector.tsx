import React from 'react';

interface SymbolSelectorProps {
  symbols: { symbol: string; name: string }[];
  activeSymbol: string;
  onChange: (symbol: string) => void;
}

export const SymbolSelector: React.FC<SymbolSelectorProps> = ({
  symbols,
  activeSymbol,
  onChange,
}) => {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {symbols.map((item) => (
        <button
          key={item.symbol}
          onClick={() => onChange(item.symbol)}
          style={{
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'inherit',
            borderRadius: 6,
            cursor: 'pointer',
            border: `1px solid ${
              activeSymbol === item.symbol ? 'rgba(47,129,247,0.4)' : 'var(--border)'
            }`,
            background:
              activeSymbol === item.symbol ? 'var(--accent-muted)' : 'var(--bg-surface2)',
            color: activeSymbol === item.symbol ? 'var(--accent)' : 'var(--text-secondary)',
            transition: 'all 0.15s ease',
          }}
        >
          {item.symbol}
        </button>
      ))}
    </div>
  );
};
