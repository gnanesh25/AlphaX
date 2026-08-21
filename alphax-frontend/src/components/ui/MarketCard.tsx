import React from 'react';
import { Database } from 'lucide-react';
import { Badge } from './Badge';

interface MarketCardProps {
  symbol: string;
  name: string;
  category: 'forex' | 'crypto' | 'indices' | 'commodities';
  session?: string;
  className?: string;
}

const categoryColor: Record<string, string> = {
  forex: 'var(--accent)',
  crypto: 'var(--warning)',
  indices: 'var(--success)',
  commodities: '#A371F7',
};

export const MarketCard: React.FC<MarketCardProps> = ({
  symbol,
  name,
  category,
  session,
  className = '',
}) => {
  return (
    <div
      className={`panel transition-fast ${className}`}
      style={{
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            {symbol}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>{name}</div>
        </div>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: categoryColor[category],
            marginTop: 4,
          }}
        />
      </div>

      {/* Connect state */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          background: 'var(--bg-surface3)',
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}
      >
        <Database size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Connect market data</span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Badge variant="muted">{category}</Badge>
        {session && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{session}</span>
        )}
      </div>
    </div>
  );
};
