import React from 'react';
import { Database, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="empty-state">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--bg-surface2)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        {icon ?? <Database size={22} />}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        {description && (
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: 280 }}>
            {description}
          </span>
        )}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          <Plus size={13} />
          {action.label}
        </Button>
      )}
    </div>
  );
};
