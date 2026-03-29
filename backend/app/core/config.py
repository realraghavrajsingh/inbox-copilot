"""
Configuration settings for Inbox Copilot Backend
"""
import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App Info
    APP_NAME: str = "Inbox Copilot API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.environ.get("DEBUG", "false").lower() == "true"
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    
    # OAuth Scopes
    GOOGLE_SCOPES: List[str] = [
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/gmail.settings.basic",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ]
    
    # Frontend URL (for CORS and redirects)
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.environ.get("BACKEND_URL", "http://localhost:8000")
    
    # Freemium Limits
    FREE_DELETION_LIMIT: int = 1000
    SCAN_MIN: int = 500
    SCAN_MAX: int = 25000
    SCAN_DEFAULT: int = 1000
    
    # Email Processing
    AVG_EMAIL_SIZE_KB: int = 50
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
