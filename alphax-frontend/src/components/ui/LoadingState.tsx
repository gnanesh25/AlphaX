import React from 'react';

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message, rows = 3 }) => {
  if (message) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '48px 24px',
          color: 'var(--text-secondary)',
          fontSize: '13px',
        }}
      >
        <div className="spinner" />
        {message}
      </div>
    );
  }

  // Skeleton rows
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            className="skeleton"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ width: `${60 + i * 10}%`, height: 12, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: `${40 + i * 5}%`, height: 10, borderRadius: 4 }} />
          </div>
          <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
};
