import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children?: (activeTab: string) => React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange, children }) => {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          gap: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              color: active === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: active === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s ease',
            }}
          >
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children && <div style={{ paddingTop: 16 }}>{children(active)}</div>}
    </div>
  );
};
