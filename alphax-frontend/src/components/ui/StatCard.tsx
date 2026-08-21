import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend = 'neutral',
  icon,
  className = '',
}) => {
  const trendColor =
    trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--danger)' : 'var(--text-secondary)';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`panel ${className}`}
      style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="section-label">{label}</span>
        {icon && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {subValue && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', color: trendColor }}>
          <TrendIcon size={12} />
          <span>{subValue}</span>
        </div>
      )}
    </div>
  );
};
