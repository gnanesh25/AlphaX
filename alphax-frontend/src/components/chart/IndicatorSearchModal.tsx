import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { getIndicatorList } from '../../indicators/IndicatorRegistry';
import type { IndicatorCategory, IndicatorInstance } from '../../indicators/indicatorTypes';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface IndicatorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeIndicators: IndicatorInstance[];
  onAddIndicator: (indicatorId: string) => void;
  onRemoveIndicator?: (instanceId: string) => void;
}

const CATEGORIES: ('All' | IndicatorCategory)[] = ['All', 'Trend', 'Momentum', 'Volatility', 'Volume'];

export const IndicatorSearchModal: React.FC<IndicatorSearchModalProps> = ({
  isOpen,
  onClose,
  activeIndicators,
  onAddIndicator,
}) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<'All' | IndicatorCategory>('All');

  if (!isOpen) return null;

  const allIndicators = getIndicatorList();

  const filtered = allIndicators.filter((ind) => {
    const matchCat = activeCat === 'All' || ind.category === activeCat;
    const query = search.toLowerCase().trim();
    const matchSearch =
      !query ||
      ind.name.toLowerCase().includes(query) ||
      ind.shortName.toLowerCase().includes(query) ||
      ind.description.toLowerCase().includes(query) ||
      ind.category.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Indicators & Strategies
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Search from 25+ real-time mathematical indicators across Trend, Momentum, Volatility & Volume.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search (e.g. RSI, moving average, MACD, Bollinger, Supertrend)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{ paddingLeft: 36, width: '100%', height: 38 }}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  borderRadius: 6,
                  border: `1px solid ${activeCat === cat ? 'var(--accent)' : 'var(--border)'}`,
                  background: activeCat === cat ? 'var(--accent-muted)' : 'transparent',
                  color: activeCat === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Indicators */}
        <div style={{ padding: '10px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No matching indicators found for "{search}".
            </div>
          ) : (
            filtered.map((ind) => {
              const activeCount = activeIndicators.filter((i) => i.indicatorId === ind.id).length;
              return (
                <div
                  key={ind.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: activeCount > 0 ? 'rgba(47, 129, 247, 0.05)' : 'var(--bg-surface2)',
                    border: `1px solid ${activeCount > 0 ? 'rgba(47, 129, 247, 0.3)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {ind.name}
                      </span>
                      <Badge variant="muted">{ind.shortName}</Badge>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• {ind.category}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ({ind.paneType === 'main' ? 'Main Chart' : 'Oscillator Pane'})
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                      {ind.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Button
                      variant={activeCount > 0 ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => onAddIndicator(ind.id)}
                      style={{ height: 28, fontSize: '11px', gap: 4 }}
                    >
                      <Plus size={12} />
                      {activeCount > 0 ? `Add (${activeCount})` : 'Add'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Active Indicators Footer */}
        {activeIndicators.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border)',
              background: 'var(--bg-surface2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>
              Active indicators: <strong>{activeIndicators.length}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
