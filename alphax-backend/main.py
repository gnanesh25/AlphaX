import os
import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from services.market_data_service import MarketDataService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("alphax-backend")

app = FastAPI(
    title="AlphaX Market Data API",
    description="Real Market Data API powered by Twelve Data",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

market_service = MarketDataService()

@app.get("/")
def read_root():
    return {"name": "AlphaX Market Data API", "status": "online", "version": "1.0.0"}

@app.get("/api/health")
def read_health():
    return {"status": "ok", "provider": "Twelve Data", "cache_entries": len(market_service.cache)}

@app.get("/api/markets")
def get_markets():
    """List all supported market instruments."""
    return {"markets": market_service.get_supported_markets()}

@app.get("/api/market/{symbol}/quote")
async def get_market_quote(symbol: str):
    """Get real-time price quote for a symbol."""
    try:
        quote = await market_service.get_quote(symbol)
        return quote
    except Exception as e:
        logger.error(f"Quote error for {symbol}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/market/{symbol}/candles")
async def get_market_candles(
    symbol: str,
    timeframe: str = Query("15min", description="Candle timeframe (e.g. 1min, 5min, 15min, 30min, 1h, 4h, 1day)"),
    outputsize: int = Query(150, description="Number of candles to return (max 500)")
):
    """Get historical OHLC candle data for chart rendering."""
    try:
        result = await market_service.get_candles(symbol, timeframe, outputsize)
        return result
    except Exception as e:
        logger.error(f"Candles error for {symbol} {timeframe}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
