import React from 'react';
import { Zap } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        zIndex: 9999,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(47, 129, 247, 0.25)',
        }}
      >
        <Zap size={24} color="#fff" />
      </div>

      {/* Pulsing text */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          AlphaX
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Restoring session...</span>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
          animation: 'spin 0.8s linear infinite',
        }}
      />

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
