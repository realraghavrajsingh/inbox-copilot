"""
Authentication API Routes
"""
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import RedirectResponse

from ..services.auth_service import AuthService
from ..models.schemas import TokenRequest, TokenResponse, UserProfile, AuthStatus
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/login")
async def login(redirect_uri: str = Query(default=None)):
    """
    Initiate Google OAuth login flow
    Returns the authorization URL to redirect the user to
    """
    if not redirect_uri:
        redirect_uri = f"{settings.BACKEND_URL}/auth/callback"
    
    auth_url = AuthService.get_authorization_url(redirect_uri)
    return {"auth_url": auth_url}


@router.get("/callback")
async def oauth_callback(code: str = Query(...), state: str = Query(default=None)):
    """
    Handle OAuth callback from Google
    Exchanges code for tokens and redirects to frontend
    """
    redirect_uri = f"{settings.BACKEND_URL}/auth/callback"
    
    tokens = await AuthService.exchange_code_for_tokens(code, redirect_uri)
    
    if not tokens:
        raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
    
    # Redirect to frontend with tokens (in production, use secure cookies or session)
    frontend_url = f"{settings.FRONTEND_URL}/dashboard?access_token={tokens.access_token}"
    if tokens.refresh_token:
        frontend_url += f"&refresh_token={tokens.refresh_token}"
    
    return RedirectResponse(url=frontend_url)


@router.post("/token", response_model=TokenResponse)
async def exchange_token(request: TokenRequest):
    """
    Exchange authorization code for access tokens
    Used when frontend handles the OAuth callback
    """
    tokens = await AuthService.exchange_code_for_tokens(
        request.code, 
        request.redirect_uri
    )
    
    if not tokens:
        raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
    
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    tokens = await AuthService.refresh_access_token(refresh_token)
    
    if not tokens:
        raise HTTPException(status_code=400, detail="Failed to refresh token")
    
    return tokens


@router.get("/profile", response_model=UserProfile)
async def get_profile(access_token: str = Query(...)):
    """Get user profile from Google"""
    profile = await AuthService.get_user_profile(access_token)
    
    if not profile:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return profile


@router.get("/status", response_model=AuthStatus)
async def check_auth_status(access_token: str = Query(default=None)):
    """Check if user is authenticated"""
    if not access_token:
        return AuthStatus(authenticated=False, user=None)
    
    profile = await AuthService.get_user_profile(access_token)
    
    if profile:
        return AuthStatus(authenticated=True, user=profile)
    
    return AuthStatus(authenticated=False, user=None)
