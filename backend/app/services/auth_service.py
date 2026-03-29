"""
Authentication Service - Google OAuth handling
"""
import urllib.parse
import httpx
from typing import Optional, Tuple
from google.oauth2.credentials import Credentials

from ..core.config import settings
from ..models.schemas import UserProfile, TokenResponse

class AuthService:
    """Service class for authentication operations"""
    
    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    
    @classmethod
    def get_authorization_url(cls, redirect_uri: str) -> str:
        """Generate Google OAuth authorization URL"""
        params = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'redirect_uri': redirect_uri,
            'scope': ' '.join(settings.GOOGLE_SCOPES),
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        return f"{cls.GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    
    @classmethod
    async def exchange_code_for_tokens(
        cls, 
        code: str, 
        redirect_uri: str
    ) -> Optional[TokenResponse]:
        """Exchange authorization code for tokens"""
        data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'code': code,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(cls.GOOGLE_TOKEN_URL, data=data)
            
            if response.status_code == 200:
                tokens = response.json()
                return TokenResponse(
                    access_token=tokens.get('access_token'),
                    refresh_token=tokens.get('refresh_token'),
                    expires_in=tokens.get('expires_in', 3600),
                    token_type=tokens.get('token_type', 'Bearer')
                )
            
            return None
    
    @classmethod
    async def refresh_access_token(cls, refresh_token: str) -> Optional[TokenResponse]:
        """Refresh access token using refresh token"""
        data = {
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'refresh_token': refresh_token,
            'grant_type': 'refresh_token'
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(cls.GOOGLE_TOKEN_URL, data=data)
            
            if response.status_code == 200:
                tokens = response.json()
                return TokenResponse(
                    access_token=tokens.get('access_token'),
                    refresh_token=refresh_token,  # Keep original refresh token
                    expires_in=tokens.get('expires_in', 3600),
                    token_type=tokens.get('token_type', 'Bearer')
                )
            
            return None
    
    @classmethod
    async def get_user_profile(cls, access_token: str) -> Optional[UserProfile]:
        """Get user profile from Google"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                cls.GOOGLE_USERINFO_URL,
                headers={'Authorization': f'Bearer {access_token}'}
            )
            
            if response.status_code == 200:
                data = response.json()
                return UserProfile(
                    email=data.get('email', ''),
                    name=data.get('name'),
                    picture=data.get('picture')
                )
            
            return None
    
    @classmethod
    def create_credentials(
        cls,
        access_token: str,
        refresh_token: Optional[str] = None
    ) -> Credentials:
        """Create Google Credentials object from tokens"""
        return Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=cls.GOOGLE_TOKEN_URL,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=settings.GOOGLE_SCOPES
        )
