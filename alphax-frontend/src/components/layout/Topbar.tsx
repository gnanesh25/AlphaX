import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/markets': 'Markets',
  '/app/charts': 'Charts',
  '/app/ai': 'AI Intelligence',
  '/app/strategy': 'Strategy Lab',
  '/app/backtest': 'Backtest',
  '/app/journal': 'Trade Journal',
  '/app/dna': 'Trader DNA',
  '/app/prop': 'Prop Challenge',
  '/app/calendar': 'Economic Calendar',
  '/app/settings': 'Settings',
};

interface TopbarProps {
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'AlphaX';

  const displayName = profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'Trader';
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="glass"
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Mobile menu toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={onMenuToggle}
        style={{ display: 'none' }}
        id="mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Page title */}
      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: 140 }}>
        {pageTitle}
      </div>

      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: 400,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 10,
            color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.15s',
            pointerEvents: 'none',
          }}
        />
        <input
          className="input"
          placeholder="Search instruments, strategies..."
          style={{ paddingLeft: 32, height: 34, fontSize: '13px' }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Market status pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'var(--bg-surface2)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--success)',
          }}
        />
        Connect Data
      </div>

      {/* Notifications */}
      <button
        className="btn btn-ghost btn-icon"
        style={{ position: 'relative' }}
        title="Notifications"
      >
        <Bell size={17} />
        <span
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: '1.5px solid var(--bg-surface)',
          }}
        />
      </button>

      {/* Settings shortcut */}
      <Link to="/app/settings" style={{ textDecoration: 'none' }}>
        <button className="btn btn-ghost btn-icon" title="Settings">
          <Settings size={17} />
        </button>
      </Link>

      {/* User menu dropdown */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost btn-md"
          style={{ gap: 8, padding: '4px 8px 4px 6px' }}
          onClick={() => setUserMenuOpen((p) => !p)}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--accent-muted)',
              border: '1px solid rgba(47,129,247,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {initial}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{displayName}</span>
        </button>

        {userMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: 220,
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border-light)',
              borderRadius: 10,
              padding: 6,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{displayName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
            </div>

            <Link
              to="/app/settings"
              style={{ textDecoration: 'none' }}
              onClick={() => setUserMenuOpen(false)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => ((e.currentTarget).style.background = 'var(--bg-surface3)')}
                onMouseLeave={(e) => ((e.currentTarget).style.background = 'transparent')}
              >
                <UserIcon size={14} />
                Profile & Settings
              </div>
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: '13px',
                color: 'var(--danger)',
                cursor: 'pointer',
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => ((e.currentTarget).style.background = 'rgba(248,81,73,0.1)')}
              onMouseLeave={(e) => ((e.currentTarget).style.background = 'transparent')}
            >
              <LogOut size={14} />
              Sign Out
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
