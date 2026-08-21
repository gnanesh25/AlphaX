import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, Check, AlertCircle, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  'AI-powered market analysis',
  'Professional backtesting engine',
  'Behavioral trader analytics',
  'Prop challenge simulator',
];

export const Signup: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmNotice, setConfirmNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error, needsConfirmation } = await signUp(email, password, name);
      if (error) {
        setErrorMsg(error.message);
      } else if (needsConfirmation) {
        setConfirmNotice(true);
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* Left panel — branding */}
      <div
        style={{
          flex: '0 0 380px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={19} color="#fff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            AlphaX
          </span>
        </Link>

        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
            Trade with intelligence.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Join serious traders who use evidence, not emotion, to improve their performance.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURES.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(63,185,80,0.15)',
                  border: '1px solid rgba(63,185,80,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check size={12} color="var(--success)" />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Start building better trading habits today.
            </p>
          </div>

          {confirmNotice ? (
            <div
              style={{
                padding: '20px',
                background: 'rgba(47,129,247,0.08)',
                border: '1px solid rgba(47,129,247,0.25)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Mail size={32} color="var(--accent)" />
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Check your email</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                Click the link in the email to activate your account.
              </div>
              <Link to="/login" style={{ textDecoration: 'none', width: '100%', marginTop: 8 }}>
                <Button variant="outline" size="md" style={{ width: '100%' }}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
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
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Full name
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Email address
                  </label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: 38 }}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                      }}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" size="md" type="submit" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                  {!loading && <ArrowRight size={14} />}
                </Button>
              </form>

              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
