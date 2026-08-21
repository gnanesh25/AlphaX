import os
import time
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import httpx

logger = logging.getLogger("market_data_service")

# Supported symbols mapping to Twelve Data symbols
SYMBOL_MAP = {
    "XAUUSD": "XAU/USD",
    "EURUSD": "EUR/USD",
    "GBPUSD": "GBP/USD",
    "USDJPY": "USD/JPY",
    "BTCUSD": "BTC/USD",
    "NASDAQ": "QQQ",
    "US30": "DJI",
    "SPX": "SPY",
}

# Supported timeframe mapping to Twelve Data intervals
TIMEFRAME_MAP = {
    "1m": "1min",
    "1min": "1min",
    "3m": "3min",
    "3min": "3min",
    "5m": "5min",
    "5min": "5min",
    "15m": "15min",
    "15min": "15min",
    "30m": "30min",
    "30min": "30min",
    "1h": "1h",
    "1H": "1h",
    "2h": "2h",
    "2H": "2h",
    "4h": "4h",
    "4H": "4h",
    "1d": "1day",
    "1D": "1day",
    "1day": "1day",
    "1w": "1week",
    "1W": "1week",
    "1week": "1week",
    "1M": "1month",
    "1month": "1month",
}

SUPPORTED_MARKETS = [
    {"symbol": "XAUUSD", "name": "Gold / US Dollar", "category": "commodities", "exchange": "Precious Metals"},
    {"symbol": "EURUSD", "name": "Euro / US Dollar", "category": "forex", "exchange": "Forex"},
    {"symbol": "GBPUSD", "name": "British Pound / US Dollar", "category": "forex", "exchange": "Forex"},
    {"symbol": "USDJPY", "name": "US Dollar / Japanese Yen", "category": "forex", "exchange": "Forex"},
    {"symbol": "BTCUSD", "name": "Bitcoin / US Dollar", "category": "crypto", "exchange": "Crypto"},
    {"symbol": "NASDAQ", "name": "Invesco QQQ (Nasdaq 100)", "category": "indices", "exchange": "NASDAQ"},
    {"symbol": "US30", "name": "Dow Jones Industrial Average", "category": "indices", "exchange": "DJI"},
    {"symbol": "SPX", "name": "SPDR S&P 500 ETF Trust", "category": "indices", "exchange": "NYSE"},
]

class MarketDataService:
    def __init__(self):
        self.api_key = os.getenv("TWELVE_DATA_API_KEY", "0a3d716b3b944dc6a00dc941abd662ed")
        self.base_url = "https://api.twelvedata.com"
        # In-memory TTL cache: key -> {"data": ..., "expires_at": timestamp}
        self.cache: Dict[str, Dict[str, Any]] = {}

    def get_supported_markets(self) -> List[Dict[str, Any]]:
        return SUPPORTED_MARKETS

    def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        entry = self.cache.get(cache_key)
        if entry and time.time() < entry["expires_at"]:
            return entry["data"]
        return None

    def _set_cache(self, cache_key: str, data: Any, ttl_seconds: int = 45):
        self.cache[cache_key] = {
            "data": data,
            "expires_at": time.time() + ttl_seconds
        }

    async def get_quote(self, symbol: str) -> dict:
        symbol_upper = symbol.upper()
        twelve_symbol = SYMBOL_MAP.get(symbol_upper, symbol_upper)
        cache_key = f"quote_{symbol_upper}"

        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        url = f"{self.base_url}/quote"
        params = {
            "symbol": twelve_symbol,
            "apikey": self.api_key
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)

            if response.status_code == 429:
                # If cached version exists even if expired, return it during rate limits
                if cache_key in self.cache:
                    return self.cache[cache_key]["data"]
                raise Exception("Twelve Data API rate limit exceeded (8 req/min). Please wait a moment.")

            if response.status_code != 200:
                raise Exception(f"Twelve Data API returned status {response.status_code}")

            data = response.json()
            if data.get("status") == "error":
                raise Exception(data.get("message", "API returned an error"))

            close_val = float(data.get("close") or data.get("previous_close") or 0)
            prev_close = float(data.get("previous_close") or close_val)
            change = float(data.get("change") or (close_val - prev_close))
            pct_change = float(data.get("percent_change") or (0 if prev_close == 0 else (change / prev_close) * 100))

            quote = {
                "symbol": symbol_upper,
                "name": data.get("name", symbol_upper),
                "open": float(data.get("open") or close_val),
                "high": float(data.get("high") or close_val),
                "low": float(data.get("low") or close_val),
                "close": close_val,
                "previous_close": prev_close,
                "change": change,
                "percent_change": pct_change,
                "datetime": data.get("datetime") or datetime.now(timezone.utc).isoformat(),
                "is_market_open": bool(data.get("is_market_open", True)),
                "source": "Twelve Data Live",
            }

            self._set_cache(cache_key, quote, ttl_seconds=30)
            return quote

        except httpx.TimeoutException:
            if cache_key in self.cache:
                return self.cache[cache_key]["data"]
            raise Exception("Market data request timed out. Please retry.")
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {str(e)}")
            raise e

    async def get_candles(self, symbol: str, timeframe: str = "15min", outputsize: int = 150) -> dict:
        symbol_upper = symbol.upper()
        twelve_symbol = SYMBOL_MAP.get(symbol_upper)
        if not twelve_symbol:
            raise Exception(f"Data unavailable for instrument '{symbol}'. Supported: {', '.join(SYMBOL_MAP.keys())}")

        twelve_tf = TIMEFRAME_MAP.get(timeframe)
        if not twelve_tf:
            raise Exception(f"Unsupported timeframe: '{timeframe}'. Supported: {', '.join(set(TIMEFRAME_MAP.values()))}")

        # Cache key per symbol + timeframe + outputsize
        cache_key = f"candles_{symbol_upper}_{twelve_tf}_{outputsize}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        url = f"{self.base_url}/time_series"
        params = {
            "symbol": twelve_symbol,
            "interval": twelve_tf,
            "outputsize": min(max(outputsize, 50), 500),
            "apikey": self.api_key
        }

        try:
            async with httpx.AsyncClient(timeout=14.0) as client:
                response = await client.get(url, params=params)

            if response.status_code == 429:
                if cache_key in self.cache:
                    return self.cache[cache_key]["data"]
                raise Exception("Twelve Data API rate limit reached (8 calls/min limit). Please wait a few seconds before retrying.")

            if response.status_code != 200:
                raise Exception(f"Twelve Data API returned status {response.status_code}")

            data = response.json()
            if data.get("status") == "error":
                raise Exception(data.get("message", "Market data provider returned an error."))

            raw_values = data.get("values", [])
            if not raw_values:
                raise Exception(f"No candle data returned by Twelve Data for {symbol} ({twelve_tf})")

            candles = []
            seen_timestamps = set()

            for item in raw_values:
                dt_str = item.get("datetime", "")
                if not dt_str:
                    continue

                try:
                    if len(dt_str) == 10:  # YYYY-MM-DD
                        dt = datetime.strptime(dt_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    elif len(dt_str) == 19:  # YYYY-MM-DD HH:MM:SS
                        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
                    else:
                        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                    
                    timestamp = int(dt.timestamp())
                except Exception as parse_err:
                    logger.warning(f"Skipping malformed date {dt_str}: {parse_err}")
                    continue

                # Remove duplicate timestamps
                if timestamp in seen_timestamps:
                    continue
                seen_timestamps.add(timestamp)

                open_val = item.get("open")
                high_val = item.get("high")
                low_val = item.get("low")
                close_val = item.get("close")
                vol_val = item.get("volume")

                if None in (open_val, high_val, low_val, close_val):
                    continue

                try:
                    o = float(open_val)
                    h = float(high_val)
                    l = float(low_val)
                    c = float(close_val)
                    v = float(vol_val) if vol_val not in (None, "", "null") else 0.0
                except (ValueError, TypeError):
                    continue

                # Validation: low <= min(open, close) and high >= max(open, close)
                h = max(h, o, c)
                l = min(l, o, c)

                candles.append({
                    "time": timestamp,
                    "open": o,
                    "high": h,
                    "low": l,
                    "close": c,
                    "volume": v,
                })

            if not candles:
                raise Exception(f"No valid OHLC candles parsed for {symbol} ({twelve_tf})")

            # Sort chronologically ascending (oldest first) for Lightweight Charts
            candles.sort(key=lambda c: c["time"])

            # Set TTL based on timeframe
            ttl = 30 if twelve_tf in ("1min", "3min", "5min") else (60 if twelve_tf in ("15min", "30min", "1h") else 300)

            result = {
                "symbol": symbol_upper,
                "timeframe": twelve_tf,
                "count": len(candles),
                "candles": candles,
                "source": "Twelve Data Live",
            }

            self._set_cache(cache_key, result, ttl_seconds=ttl)
            return result

        except httpx.TimeoutException:
            if cache_key in self.cache:
                return self.cache[cache_key]["data"]
            raise Exception("Timeout connecting to Twelve Data. Please try again.")
        except Exception as e:
            logger.error(f"Error fetching candles for {symbol} {timeframe}: {str(e)}")
            raise e
