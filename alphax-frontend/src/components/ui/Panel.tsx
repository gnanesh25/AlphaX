import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  children,
  className = '',
  elevated = false,
  title,
  action,
  noPadding = false,
}) => {
  return (
    <div className={`${elevated ? 'panel-2' : 'panel'} ${className}`}>
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {title && (
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </span>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={noPadding ? {} : { padding: '16px' }}>{children}</div>
    </div>
  );
};
