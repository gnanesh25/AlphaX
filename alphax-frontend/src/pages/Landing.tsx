import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Brain,
  BarChart2,
  FlaskConical,
  TestTube2,
  Dna,
  Trophy,
  ArrowRight,
  Shield,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const FEATURES = [
  {
    icon: <Brain size={20} />,
    title: 'AI Intelligence',
    desc: 'Structured market analysis with Setup Score, bias detection, and "Why NOT to Trade" signals.',
    color: 'var(--accent)',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Advanced Charts',
    desc: 'Professional charting with smart market structure overlays — BOS, CHOCH, Order Blocks, FVG.',
    color: '#A371F7',
  },
  {
    icon: <FlaskConical size={20} />,
    title: 'Strategy Lab',
    desc: 'Visual IF/THEN strategy builder with natural language input and JSON schema validation.',
    color: 'var(--warning)',
  },
  {
    icon: <TestTube2 size={20} />,
    title: 'Backtesting Engine',
    desc: 'Python-powered historical testing with equity curves, drawdown analysis, and expectancy.',
    color: 'var(--success)',
  },
  {
    icon: <Dna size={20} />,
    title: 'Trader DNA',
    desc: 'Deep behavioral analytics revealing your best sessions, assets, strategies, and tendencies.',
    color: '#F78166',
  },
  {
    icon: <Trophy size={20} />,
    title: 'Prop Challenge',
    desc: 'Simulated prop-firm mode with drawdown monitoring, risk limits, and real-time warnings.',
    color: '#D29922',
  },
  {
    icon: <BookOpen size={20} />,
    title: 'Trade Journal',
    desc: 'Full trade logging with screenshots, emotion tracking, and post-trade AI review.',
    color: '#3FB950',
  },
  {
    icon: <Shield size={20} />,
    title: 'Risk Control',
    desc: 'Position sizing, R:R calculator, daily loss limits, and drawdown tracking in one place.',
    color: '#F85149',
  },
];

const PRINCIPLES = [
  'Evidence over emotion',
  'Analysis over prediction',
  'Review over revenge',
  'Process over outcome',
];

export const Landing: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,11,16,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 40px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Zap size={17} color="#fff" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.03em' }}>AlphaX</span>
          <Badge variant="muted" className="hidden sm:inline-flex">Beta</Badge>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '100px 40px 80px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: 'var(--accent-muted)',
            border: '1px solid rgba(47,129,247,0.25)',
            borderRadius: 20,
            fontSize: '12px',
            color: 'var(--accent)',
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          <Zap size={12} />
          AI Trading Intelligence OS
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            color: 'var(--text-primary)',
          }}
        >
          Trade with intelligence.
          <br />
          <span style={{ color: 'var(--accent)' }}>Improve with evidence.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: 600,
            margin: '0 auto 40px',
          }}
        >
          One workspace for market analysis, strategy testing, trading journals and
          AI-powered performance intelligence. Built for serious traders.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/app/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">
              Explore Platform
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/app/dashboard" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </Link>
        </div>

        {/* Hero disclaimer */}
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 24 }}>
          Trading involves financial risk. Past performance is not indicative of future results.
        </p>
      </section>

      {/* Principles */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '24px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {PRINCIPLES.map((p) => (
            <div
              key={p}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: '13px', color: 'var(--text-secondary)',
              }}
            >
              <div
                style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Platform Modules</div>
          <h2
            style={{
              fontSize: '32px', fontWeight: 700,
              letterSpacing: '-0.03em', lineHeight: 1.2,
            }}
          >
            Every tool a serious trader needs
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                transition: 'border-color 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${f.color}1A`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 5 }}>{f.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '60px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--accent)" />
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Start Today
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            Stop guessing. Start analyzing.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            AlphaX helps you build evidence-based trading habits through structured analysis, journaling, and self-review — not promises.
          </p>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">
              Create Free Account
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Zap size={12} color="#fff" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>AlphaX</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Trading Intelligence OS</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Trading involves substantial risk of loss. This platform does not provide investment advice.
        </span>
      </footer>
    </div>
  );
};
