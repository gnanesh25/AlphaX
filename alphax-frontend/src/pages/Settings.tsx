import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Database, Palette, Key, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { useAuth } from '../contexts/AuthContext';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: <User size={13} /> },
  { id: 'integrations', label: 'Integrations', icon: <Database size={13} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={13} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={13} /> },
  { id: 'security', label: 'Security', icon: <Shield size={13} /> },
];

const INTEGRATIONS = [
  { name: 'Twelve Data', description: 'Real-time and historical market data', key: 'TWELVE_DATA_API_KEY', status: 'disconnected' },
  { name: 'OpenAI', description: 'AI analysis and NLP strategy builder', key: 'OPENAI_API_KEY', status: 'disconnected' },
  { name: 'Finnhub', description: 'Market data and economic calendar', key: 'FINNHUB_API_KEY', status: 'disconnected' },
  { name: 'News API', description: 'Financial news feed', key: 'NEWS_API_KEY', status: 'optional' },
  { name: 'Broker API', description: 'Live trading connection', key: 'BROKER_API_KEY', status: 'optional' },
];

export const SettingsPage: React.FC = () => {
  const { user, profile, settings, updateProfile, updateSettings } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [timezone, setTimezone] = useState(profile?.timezone || 'UTC');
  const [tradingStyle, setTradingStyle] = useState(profile?.trading_style || '');
  const [primaryMarket, setPrimaryMarket] = useState(profile?.primary_market || '');
  const [accountSize, setAccountSize] = useState(profile?.default_account_size?.toString() || '');
  const [riskPct, setRiskPct] = useState(profile?.default_risk_pct?.toString() || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDisplayName(profile.display_name || '');
      setTimezone(profile.timezone || 'UTC');
      setTradingStyle(profile.trading_style || '');
      setPrimaryMarket(profile.primary_market || '');
      setAccountSize(profile.default_account_size?.toString() || '');
      setRiskPct(profile.default_risk_pct?.toString() || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const { error } = await updateProfile({
      full_name: fullName,
      display_name: displayName,
      timezone,
      trading_style: tradingStyle,
      primary_market: primaryMarket,
      default_account_size: accountSize ? parseFloat(accountSize) : null,
      default_risk_pct: riskPct ? parseFloat(riskPct) : null,
    });

    setSaving(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleToggleNotif = async (key: 'notify_price_alerts' | 'notify_high_impact' | 'notify_risk_alerts' | 'notify_journal') => {
    if (!settings) return;
    const val = !settings[key];
    await updateSettings({ [key]: val });
  };


  const initial = (fullName || displayName || user?.email || 'T').charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Settings</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Manage your account, profile, and preferences connected to Supabase.
        </p>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(63,185,80,0.1)',
            border: '1px solid rgba(63,185,80,0.3)',
            borderRadius: 8,
            fontSize: '12px',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Check size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.3)',
            borderRadius: 8,
            fontSize: '12px',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      <Tabs tabs={SETTINGS_TABS} defaultTab="profile">
        {(active) => (
          <>
            {active === 'profile' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Panel title="Profile Information">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'var(--accent-muted)',
                          border: '2px solid rgba(47,129,247,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.email}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                          User ID: {user?.id}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                          className="input"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Display Name</label>
                        <input
                          className="input"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Trader handle"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Email (Read Only)</label>
                        <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Timezone</label>
                        <input
                          className="input"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          placeholder="e.g. UTC, EST"
                        />
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel title="Trading Preferences">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Default Account Size ($)</label>
                      <input
                        className="input"
                        type="number"
                        value={accountSize}
                        onChange={(e) => setAccountSize(e.target.value)}
                        placeholder="e.g. 10000"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Default Risk per Trade (%)</label>
                      <input
                        className="input"
                        type="number"
                        step="0.1"
                        value={riskPct}
                        onChange={(e) => setRiskPct(e.target.value)}
                        placeholder="e.g. 1.0"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Primary Market</label>
                      <input
                        className="input"
                        value={primaryMarket}
                        onChange={(e) => setPrimaryMarket(e.target.value)}
                        placeholder="e.g. Forex, Crypto, Indices"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)' }}>Trading Style</label>
                      <input
                        className="input"
                        value={tradingStyle}
                        onChange={(e) => setTradingStyle(e.target.value)}
                        placeholder="e.g. Scalper, Day Trader, Swing"
                      />
                    </div>
                  </div>
                  <Button variant="primary" size="sm" type="submit" disabled={saving} style={{ marginTop: 16 }}>
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </Panel>
              </form>
            )}

            {active === 'integrations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(210,153,34,0.08)',
                    border: '1px solid rgba(210,153,34,0.25)',
                    borderRadius: 8,
                    fontSize: '12px',
                    color: 'var(--warning)',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <Key size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  API keys are stored securely server-side and never exposed to the browser.
                </div>
                {INTEGRATIONS.map((int) => (
                  <Panel key={int.name}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{int.name}</span>
                          <Badge variant={int.status === 'disconnected' ? 'danger' : 'muted'}>
                            {int.status}
                          </Badge>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 3 }}>{int.description}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace' }}>
                          {int.key}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button variant="outline" size="sm">Configure</Button>
                        <Button variant="ghost" size="icon"><ChevronRight size={14} /></Button>
                      </div>
                    </div>
                  </Panel>
                ))}
              </div>
            )}

            {active === 'notifications' && (
              <Panel title="Notification Preferences (Supabase Synced)">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { key: 'notify_price_alerts' as const, label: 'Price Alerts', desc: 'When price reaches your set levels' },
                    { key: 'notify_high_impact' as const, label: 'High-Impact Economic Events', desc: '30 min before major economic releases' },
                    { key: 'notify_risk_alerts' as const, label: 'Risk & Drawdown Alerts', desc: 'When approaching drawdown limits' },
                    { key: 'notify_journal' as const, label: 'Journal Reminders', desc: 'Daily reminder to log your trades' },
                  ].map((item, i) => {
                    const enabled = settings ? settings[item.key] : false;
                    return (
                      <div
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 0',
                          borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                        </div>
                        <div
                          style={{
                            width: 36,
                            height: 20,
                            borderRadius: 10,
                            background: enabled ? 'var(--accent)' : 'var(--bg-surface3)',
                            border: `1px solid ${enabled ? 'var(--accent)' : 'var(--border)'}`,
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                          }}
                          onClick={() => handleToggleNotif(item.key)}
                        >
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              top: 2,
                              left: enabled ? 19 : 2,
                              transition: 'left 0.2s',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}

            {active === 'appearance' && (
              <Panel title="Appearance Preferences">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>Theme</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {[{ label: 'Dark', active: true }, { label: 'Light', active: false }, { label: 'System', active: false }].map((t) => (
                        <div
                          key={t.label}
                          style={{
                            padding: '10px 18px',
                            borderRadius: 8,
                            border: `1px solid ${t.active ? 'rgba(47,129,247,0.3)' : 'var(--border)'}`,
                            background: t.active ? 'var(--accent-muted)' : 'var(--bg-surface2)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: t.active ? 'var(--accent)' : 'var(--text-secondary)',
                            fontWeight: t.active ? 600 : 400,
                          }}
                        >
                          {t.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {active === 'security' && (
              <Panel title="Security & Authentication">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Authenticated as <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong> via Supabase Auth.
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Session Token & RLS protected by Supabase PostgreSQL.
                  </div>
                </div>
              </Panel>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
};
