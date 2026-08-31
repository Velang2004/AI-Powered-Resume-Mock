from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Signup Request Schema
class UserSignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Strong password (at least 8 chars)")

# Login Request Schema
class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

# Token Response Schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    email: str
    message: str

# User Response Schema
class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Member Statistics Response Schema
class MemberStatsResponse(BaseModel):
    total_registered_users: int
    total_logins_recorded: int
