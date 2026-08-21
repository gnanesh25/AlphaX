import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  CandlestickChart,
  Brain,
  FlaskConical,
  TestTube2,
  BookOpen,
  Dna,
  Trophy,
  Calendar,
  Settings,
  Zap,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={16} />, group: 'main' },
  { id: 'markets', label: 'Markets', path: '/app/markets', icon: <BarChart2 size={16} />, group: 'main' },
  { id: 'charts', label: 'Charts', path: '/app/charts', icon: <CandlestickChart size={16} />, group: 'main' },
  { id: 'ai', label: 'AI Intelligence', path: '/app/ai', icon: <Brain size={16} />, group: 'intelligence' },
  { id: 'strategy', label: 'Strategy Lab', path: '/app/strategy', icon: <FlaskConical size={16} />, group: 'intelligence' },
  { id: 'backtest', label: 'Backtest', path: '/app/backtest', icon: <TestTube2 size={16} />, group: 'intelligence' },
  { id: 'journal', label: 'Trade Journal', path: '/app/journal', icon: <BookOpen size={16} />, group: 'performance' },
  { id: 'dna', label: 'Trader DNA', path: '/app/dna', icon: <Dna size={16} />, group: 'performance' },
  { id: 'prop', label: 'Prop Challenge', path: '/app/prop', icon: <Trophy size={16} />, group: 'performance' },
  { id: 'calendar', label: 'Econ Calendar', path: '/app/calendar', icon: <Calendar size={16} />, group: 'tools' },
  { id: 'settings', label: 'Settings', path: '/app/settings', icon: <Settings size={16} />, group: 'tools' },
];

const GROUPS: { id: string; label: string }[] = [
  { id: 'main', label: 'Workspace' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'performance', label: 'Performance' },
  { id: 'tools', label: 'Tools' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { user, profile, signOut } = useAuth();
  const displayName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'Trader';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={onMobileClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{ zIndex: mobileOpen ? 100 : undefined }}>
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                AlphaX
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                TRADING OS
              </div>
            </div>
          </div>
          {onMobileClose && (
            <button className="btn btn-ghost btn-icon-sm" onClick={onMobileClose} style={{ borderRadius: 6 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group.id);
            return (
              <div key={group.id} style={{ marginBottom: 4 }}>
                <div className="section-label" style={{ padding: '6px 8px 4px', display: 'block' }}>
                  {group.label}
                </div>
                {items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={onMobileClose}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--accent-muted)',
                border: '1px solid rgba(47,129,247,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-icon-sm"
            title="Sign Out"
            onClick={() => signOut()}
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>
    </>
  );
};
