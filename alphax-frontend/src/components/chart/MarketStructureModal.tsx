import React, { useState } from 'react';
import { X, Layers, RotateCcw, Check } from 'lucide-react';
import type { MarketStructureConfig } from '../../market-structure/structureTypes';
import { DEFAULT_STRUCTURE_CONFIG } from '../../market-structure/structureEngine';
import { Button } from '../ui/Button';

interface MarketStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MarketStructureConfig;
  onUpdateConfig: (config: MarketStructureConfig) => void;
}

export const MarketStructureModal: React.FC<MarketStructureModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  const [cfg, setCfg] = useState<MarketStructureConfig>({ ...config });

  const handleSave = () => {
    onUpdateConfig(cfg);
    onClose();
  };

  const handleReset = () => {
    setCfg({ ...DEFAULT_STRUCTURE_CONFIG });
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
            <Layers size={18} color="var(--accent)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              Market Structure & Smart Money Overlays
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

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '65vh', overflowY: 'auto' }}>
          {/* Swings & Fractal Settings */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Swing Highs & Lows (Pivots)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Identify market swing points (HH, HL, LH, LL)</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                className="input"
                style={{ width: 70, height: 28, fontSize: '11px' }}
                value={cfg.swingLookback}
                onChange={(e) => setCfg({ ...cfg, swingLookback: parseInt(e.target.value, 10) })}
              >
                <option value={3}>3 bars</option>
                <option value={5}>5 bars</option>
                <option value={10}>10 bars</option>
              </select>
              <input
                type="checkbox"
                checked={cfg.showSwings}
                onChange={(e) => setCfg({ ...cfg, showSwings: e.target.checked })}
                style={{ cursor: 'pointer', width: 16, height: 16 }}
              />
            </div>
          </div>

          {/* BOS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Break of Structure (BOS)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Trend continuation structural breaks</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showBOS}
              onChange={(e) => setCfg({ ...cfg, showBOS: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* CHOCH */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Change of Character (CHOCH)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Early trend shift / reversal breaks</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showCHOCH}
              onChange={(e) => setCfg({ ...cfg, showCHOCH: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* FVG */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Fair Value Gaps (FVG)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>3-bar institutional price imbalances & mitigation zones</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showFVG}
              onChange={(e) => setCfg({ ...cfg, showFVG: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* Order Blocks */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Order Blocks (OB)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Last opposing candles preceding impulsive expansion</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showOrderBlocks}
              onChange={(e) => setCfg({ ...cfg, showOrderBlocks: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* Liquidity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Liquidity Sweeps & Equal Highs/Lows</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>EQH / EQL and stop run sweeps</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showLiquidity}
              onChange={(e) => setCfg({ ...cfg, showLiquidity: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* 50% Equilibrium */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Premium & Discount Equilibrium (50%)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Range valuation zones based on dealing range</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showEquilibrium}
              onChange={(e) => setCfg({ ...cfg, showEquilibrium: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* S/R Levels */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Previous Day High / Low (PDH / PDL)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Key daily horizontal benchmark levels</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showSRLevels}
              onChange={(e) => setCfg({ ...cfg, showSRLevels: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
          </div>

          {/* Sessions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Session Markers (Asian, London, NY)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Highlight active trading session windows</div>
            </div>
            <input
              type="checkbox"
              checked={cfg.showSessions}
              onChange={(e) => setCfg({ ...cfg, showSessions: e.target.checked })}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
            />
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
            <RotateCcw size={12} /> Reset
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
