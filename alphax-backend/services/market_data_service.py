import os
import logging
from datetime import datetime, timezone
import httpx

logger = logging.getLogger("market_data_service")

# Supported symbols mapping to Twelve Data symbols
SYMBOL_MAP = {
    "XAUUSD": "XAU/USD",
    "EURUSD": "EUR/USD",
    "GBPUSD": "GBP/USD",
    "USDJPY": "USD/JPY",
    "BTCUSD": "BTC/USD",
}

# Supported timeframe mapping
TIMEFRAME_MAP = {
    "1m": "1min",
    "1min": "1min",
    "5m": "5min",
    "5min": "5min",
    "15m": "15min",
    "15min": "15min",
    "30m": "30min",
    "30min": "30min",
    "1h": "1h",
    "1H": "1h",
    "4h": "4h",
    "4H": "4h",
    "1d": "1day",
    "1D": "1day",
    "1day": "1day",
}

SUPPORTED_MARKETS = [
    {"symbol": "XAUUSD", "name": "Gold / US Dollar", "category": "commodities"},
    {"symbol": "EURUSD", "name": "Euro / US Dollar", "category": "forex"},
    {"symbol": "GBPUSD", "name": "British Pound / US Dollar", "category": "forex"},
    {"symbol": "USDJPY", "name": "US Dollar / Japanese Yen", "category": "forex"},
    {"symbol": "BTCUSD", "name": "Bitcoin / US Dollar", "category": "crypto"},
]

class MarketDataService:
    def __init__(self):
        self.api_key = os.getenv("TWELVE_DATA_API_KEY", "0a3d716b3b944dc6a00dc941abd662ed")
        self.base_url = "https://api.twelvedata.com"

    def get_supported_markets(self):
        return SUPPORTED_MARKETS

    async def get_quote(self, symbol: str) -> dict:
        symbol_upper = symbol.upper()
        twelve_symbol = SYMBOL_MAP.get(symbol_upper, symbol_upper)

        url = f"{self.base_url}/quote"
        params = {
            "symbol": twelve_symbol,
            "apikey": self.api_key
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, params=params)
                
            if response.status_code == 429:
                raise Exception("Twelve Data API rate limit exceeded. Please wait a moment.")
            
            if response.status_code != 200:
                raise Exception(f"Twelve Data API returned status {response.status_code}")
                
            data = response.json()
            if data.get("status") == "error":
                raise Exception(data.get("message", "API returned an error"))

            return {
                "symbol": symbol_upper,
                "name": data.get("name", symbol_upper),
                "open": float(data.get("open", 0)),
                "high": float(data.get("high", 0)),
                "low": float(data.get("low", 0)),
                "close": float(data.get("close", 0)),
                "previous_close": float(data.get("previous_close", 0)),
                "change": float(data.get("change", 0)),
                "percent_change": float(data.get("percent_change", 0)),
                "datetime": data.get("datetime"),
                "is_market_open": data.get("is_market_open", False),
            }
        except httpx.TimeoutException:
            raise Exception("Market data request timed out. Please try again.")
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {str(e)}")
            raise e

    async def get_candles(self, symbol: str, timeframe: str = "15min", outputsize: int = 100) -> dict:
        symbol_upper = symbol.upper()
        twelve_symbol = SYMBOL_MAP.get(symbol_upper)
        if not twelve_symbol:
            raise Exception(f"Unsupported symbol: {symbol}. Supported symbols: {list(SYMBOL_MAP.keys())}")

        twelve_tf = TIMEFRAME_MAP.get(timeframe)
        if not twelve_tf:
            raise Exception(f"Unsupported timeframe: {timeframe}. Supported: 1min, 5min, 15min, 30min, 1h, 4h, 1day")

        url = f"{self.base_url}/time_series"
        params = {
            "symbol": twelve_symbol,
            "interval": twelve_tf,
            "outputsize": min(outputsize, 500),
            "apikey": self.api_key
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(url, params=params)

            if response.status_code == 429:
                raise Exception("Twelve Data API rate limit reached. Please wait a few seconds before retrying.")
            
            if response.status_code != 200:
                raise Exception(f"External API error (HTTP {response.status_code})")

            data = response.json()
            if data.get("status") == "error":
                raise Exception(data.get("message", "Market data error"))

            raw_values = data.get("values", [])
            if not raw_values:
                raise Exception(f"No candle data available for {symbol} ({timeframe})")

            candles = []
            for item in raw_values:
                dt_str = item.get("datetime", "")
                try:
                    if len(dt_str) == 10:  # YYYY-MM-DD
                        dt = datetime.strptime(dt_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                    else:  # YYYY-MM-DD HH:MM:SS
                        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
                    timestamp = int(dt.timestamp())
                except Exception:
                    continue

                candles.append({
                    "time": timestamp,
                    "open": float(item.get("open", 0)),
                    "high": float(item.get("high", 0)),
                    "low": float(item.get("low", 0)),
                    "close": float(item.get("close", 0)),
                    "volume": float(item.get("volume", 0)) if item.get("volume") else 0.0,
                })

            # Sort chronologically (oldest first) as required by Lightweight Charts
            candles.sort(key=lambda c: c["time"])

            return {
                "symbol": symbol_upper,
                "timeframe": twelve_tf,
                "count": len(candles),
                "candles": candles
            }

        except httpx.TimeoutException:
            raise Exception("Timeout connecting to market data provider. Please try again.")
        except Exception as e:
            logger.error(f"Error fetching candles for {symbol} {timeframe}: {str(e)}")
            raise e
