"""Pydantic models for API request/response schemas."""

from pydantic import BaseModel, Field


class StrategyRequest(BaseModel):
    user_address: str = Field(..., description="User's wallet address")
    risk_preference: str = Field(
        default="balanced",
        description="Risk preference: conservative, balanced, or aggressive",
    )


class RiskRequest(BaseModel):
    user_address: str = Field(..., description="User's wallet address")


class ChatRequest(BaseModel):
    user_address: str | None = Field(
        default=None, description="User's wallet address (optional for general questions)"
    )
    message: str = Field(..., description="User's chat message")
    history: list[dict] | None = Field(
        default=None, description="Previous chat messages [{role, content}]"
    )


class InsightsRequest(BaseModel):
    user_address: str = Field(..., description="User's wallet address")


class AIResponse(BaseModel):
    success: bool
    data: str
    error: str | None = None


class HealthResponse(BaseModel):
    status: str
    version: str
    network: str
