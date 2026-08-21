import React, { useState } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { getIndicatorById } from '../../indicators/IndicatorRegistry';
import type { IndicatorInstance } from '../../indicators/indicatorTypes';
import { Button } from '../ui/Button';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: IndicatorInstance | null;
  onUpdateInstance: (updated: IndicatorInstance) => void;
}

export const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  instance,
  onUpdateInstance,
}) => {
  if (!isOpen || !instance) return null;

  const def = getIndicatorById(instance.indicatorId);
  if (!def) return null;

  const [params, setParams] = useState<Record<string, any>>({ ...instance.params });
  const [colors, setColors] = useState<Record<string, string>>({ ...instance.colors });
  const [lineWidths, setLineWidths] = useState<Record<string, number>>({ ...(instance.lineWidths || {}) });

  const handleSave = () => {
    onUpdateInstance({
      ...instance,
      params,
      colors,
      lineWidths,
    });
    onClose();
  };

  const handleReset = () => {
    const defaultParams: Record<string, any> = {};
    def.params.forEach((p) => {
      defaultParams[p.key] = p.default;
    });
    const defaultColors: Record<string, string> = {};
    def.plots.forEach((p) => {
      defaultColors[p.id] = p.color;
    });
    setParams(defaultParams);
    setColors(defaultColors);
  };

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
          maxWidth: 460,
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
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              {def.name} Settings
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{def.category} • Parameters</span>
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

        {/* Form Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Inputs Section */}
          {def.params.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Inputs
              </div>
              {def.params.map((param) => (
                <div key={param.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{param.name}</label>
                  {param.type === 'number' && (
                    <input
                      type="number"
                      className="input"
                      style={{ width: 100, height: 32, textAlign: 'right' }}
                      value={params[param.key] ?? param.default}
                      min={param.min}
                      max={param.max}
                      step={param.step || 1}
                      onChange={(e) =>
                        setParams({ ...params, [param.key]: parseFloat(e.target.value) || param.default })
                      }
                    />
                  )}
                  {param.type === 'select' && (
                    <select
                      className="input"
                      style={{ width: 120, height: 32 }}
                      value={params[param.key] ?? param.default}
                      onChange={(e) => setParams({ ...params, [param.key]: e.target.value })}
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Style Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Style & Colors
            </div>
            {def.plots.map((plot) => (
              <div key={plot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{plot.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={colors[plot.id] || plot.color}
                    onChange={(e) => setColors({ ...colors, [plot.id]: e.target.value })}
                    style={{
                      width: 28,
                      height: 28,
                      padding: 0,
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: 'none',
                    }}
                  />
                  <select
                    className="input"
                    style={{ width: 80, height: 28, fontSize: '11px' }}
                    value={lineWidths[plot.id] || plot.lineWidth || 2}
                    onChange={(e) => setLineWidths({ ...lineWidths, [plot.id]: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>1px</option>
                    <option value={2}>2px</option>
                    <option value={3}>3px</option>
                    <option value={4}>4px</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-surface2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="ghost" size="sm" onClick={handleReset} style={{ gap: 4 }}>
            <RotateCcw size={12} /> Reset Defaults
          </Button>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} style={{ gap: 4 }}>
              <Check size={13} /> Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
