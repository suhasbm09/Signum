"""Auth domain models"""
from pydantic import BaseModel
from typing import Optional

class ProfileUpdate(BaseModel):
    displayName: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list] = None
    preferredLanguage: Optional[str] = None
    timezone: Optional[str] = None

class WalletUpdate(BaseModel):
    walletAddress: str
