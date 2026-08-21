import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, FolderOpen, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import type { IndicatorInstance } from '../../indicators/indicatorTypes';
import type { MarketStructureConfig } from '../../market-structure/structureTypes';
import type { DrawingShape } from '../../drawing/drawingTypes';

export interface ChartLayout {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  chartType: string;
  indicators: IndicatorInstance[];
  structureConfig: MarketStructureConfig;
  drawings: DrawingShape[];
  updatedAt: string;
}

interface LayoutManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol: string;
  currentTimeframe: string;
  currentChartType: string;
  currentIndicators: IndicatorInstance[];
  currentStructureConfig: MarketStructureConfig;
  currentDrawings: DrawingShape[];
  onLoadLayout: (layout: ChartLayout) => void;
}

const STORAGE_KEY = 'alphax_chart_layouts_v1';

export const LayoutManagerModal: React.FC<LayoutManagerModalProps> = ({
  isOpen,
  onClose,
  currentSymbol,
  currentTimeframe,
  currentChartType,
  currentIndicators,
  currentStructureConfig,
  currentDrawings,
  onLoadLayout,
}) => {
  const [layouts, setLayouts] = useState<ChartLayout[]>([]);
  const [newLayoutName, setNewLayoutName] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setLayouts(JSON.parse(raw));
      }
    } catch {
      // Fallback
    }
  }, [isOpen]);

  const saveLayoutsToStorage = (updated: ChartLayout[]) => {
    setLayouts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleSaveCurrent = () => {
    if (!newLayoutName.trim()) return;

    const newLayout: ChartLayout = {
      id: `layout_${Date.now()}`,
      name: newLayoutName.trim(),
      symbol: currentSymbol,
      timeframe: currentTimeframe,
      chartType: currentChartType,
      indicators: currentIndicators,
      structureConfig: currentStructureConfig,
      drawings: currentDrawings,
      updatedAt: new Date().toISOString(),
    };

    const updated = [newLayout, ...layouts];
    saveLayoutsToStorage(updated);
    setNewLayoutName('');
  };

  const handleDelete = (id: string) => {
    const updated = layouts.filter((l) => l.id !== id);
    saveLayoutsToStorage(updated);
  };

  if (!isOpen) return null;

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
          maxWidth: 480,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={18} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              Chart Layout Manager
            </h3>
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

        {/* Save Current Section */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface2)' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            Save Current Workspace as Layout
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="input"
              placeholder="e.g. My Gold 15m Strategy, ICT Setup..."
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              style={{ flex: 1, height: 34 }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveCurrent}
              disabled={!newLayoutName.trim()}
              style={{ gap: 4 }}
            >
              <Save size={13} /> Save
            </Button>
          </div>
        </div>

        {/* Saved Layouts List */}
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Saved Layouts ({layouts.length})
          </div>

          {layouts.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No saved layouts yet. Save your active chart configuration above!
            </div>
          ) : (
            layouts.map((l) => (
              <div
                key={l.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: 'var(--bg-surface2)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{l.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{l.symbol} • {l.timeframe}</span>
                    <span>• {l.indicators.length} indicators</span>
                    <span>• {new Date(l.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onLoadLayout(l);
                      onClose();
                    }}
                    style={{ height: 28, fontSize: '11px', gap: 4 }}
                  >
                    <Check size={12} /> Load
                  </Button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                    }}
                    title="Delete Layout"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface2)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
