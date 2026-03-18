"""ForgeX AI Backend — FastAPI server for AI-powered vault analytics."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import HOST, PORT
from models import (
    StrategyRequest,
    RiskRequest,
    ChatRequest,
    InsightsRequest,
    AIResponse,
    HealthResponse,
)
from chain import fetch_user_portfolio, fetch_platform_stats
from ai_engine import (
    get_strategy_advice,
    get_risk_assessment,
    chat,
    get_dashboard_insights,
)

app = FastAPI(
    title="ForgeX AI",
    description="AI-powered analytics and strategy engine for ForgeX protocol",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint — API overview."""
    return {
        "name": "ForgeX AI Backend",
        "version": "1.0.0",
        "network": "Base Mainnet",
        "endpoints": {
            "GET /health": "Health check",
            "GET /api/platform-stats": "Platform statistics",
            "GET /api/portfolio/{address}": "User portfolio data",
            "POST /api/strategy": "AI yield strategy advice",
            "POST /api/risk": "AI risk assessment",
            "POST /api/chat": "AI chat assistant",
            "POST /api/insights": "AI dashboard insights",
        },
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok", version="1.0.0", network="Base Mainnet")


@app.get("/api/platform-stats")
async def platform_stats():
    """Get platform-level statistics."""
    try:
        stats = fetch_platform_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/portfolio/{user_address}")
async def get_portfolio(user_address: str):
    """Fetch on-chain portfolio data for a user."""
    try:
        portfolio = fetch_user_portfolio(user_address)
        return {"success": True, "data": portfolio}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/strategy", response_model=AIResponse)
async def strategy_advisor(req: StrategyRequest):
    """AI-powered yield strategy recommendations."""
    try:
        portfolio = fetch_user_portfolio(req.user_address)
        advice = get_strategy_advice(portfolio, req.risk_preference)
        return AIResponse(success=True, data=advice)
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))


@app.post("/api/risk", response_model=AIResponse)
async def risk_assessment(req: RiskRequest):
    """AI-powered risk assessment for user's vaults."""
    try:
        portfolio = fetch_user_portfolio(req.user_address)
        assessment = get_risk_assessment(portfolio)
        return AIResponse(success=True, data=assessment)
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))


@app.post("/api/chat", response_model=AIResponse)
async def chat_endpoint(req: ChatRequest):
    """AI chat assistant for vault operations and DeFi education."""
    try:
        portfolio = None
        if req.user_address:
            portfolio = fetch_user_portfolio(req.user_address)
        response = chat(portfolio, req.message, req.history)
        return AIResponse(success=True, data=response)
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))


@app.post("/api/insights", response_model=AIResponse)
async def dashboard_insights(req: InsightsRequest):
    """AI-generated dashboard insights and recommendations."""
    try:
        portfolio = fetch_user_portfolio(req.user_address)
        insights = get_dashboard_insights(portfolio)
        return AIResponse(success=True, data=insights)
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
