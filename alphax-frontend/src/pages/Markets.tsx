import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { fetchQuote } from '../services/marketApi';
import type { MarketQuote } from '../services/marketApi';


const INSTRUMENTS = [
  { symbol: 'XAUUSD', name: 'Gold Spot / US Dollar', category: 'commodities' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'forex' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'forex' },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'crypto' },
];

const CATEGORIES = ['All', 'Forex', 'Crypto', 'Commodities'];

export const Markets: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        INSTRUMENTS.map((inst) => fetchQuote(inst.symbol))
      );
      const quotesMap: Record<string, MarketQuote> = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          quotesMap[INSTRUMENTS[i].symbol] = res.value;
        }
      });
      setQuotes(quotesMap);
    } catch (err: any) {
      setError(err?.message || 'Failed to load market quotes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const filtered = INSTRUMENTS.filter((inst) => {
    const matchSearch =
      inst.symbol.toLowerCase().includes(search.toLowerCase()) ||
      inst.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === 'All' ||
      inst.category.toLowerCase() === activeCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Market Explorer
            </h2>
            <Badge variant="success">
              <Database size={10} style={{ marginRight: 3 }} /> Twelve Data Live
            </Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Real-time market quotes from Twelve Data API.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" size="sm" onClick={loadQuotes} disabled={loading}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            Refresh Quotes
          </Button>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Search
            size={14}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
          />
          <input
            className="input"
            placeholder="Search instruments..."
            style={{ paddingLeft: 30 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'inherit',
                border: `1px solid ${activeCategory === cat ? 'rgba(47,129,247,0.3)' : 'var(--border)'}`,
                borderRadius: 20,
                cursor: 'pointer',
                background: activeCategory === cat ? 'var(--accent-muted)' : 'transparent',
                color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, fontSize: '12px', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {filtered.map((inst) => {
          const q = quotes[inst.symbol];
          const isUp = q && q.percent_change >= 0;
          return (
            <div
              key={inst.symbol}
              className="panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{inst.symbol}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{inst.name}</div>
                </div>
                <Badge variant="muted">{inst.category}</Badge>
              </div>

              {loading && !q ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fetching live quote...</div>
              ) : q ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                    {q.close.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                      {isUp ? '+' : ''}{q.change.toFixed(2)} ({isUp ? '+' : ''}{q.percent_change.toFixed(2)}%)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      High: {q.high.toFixed(2)} | Low: {q.low.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quote unavailable</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
