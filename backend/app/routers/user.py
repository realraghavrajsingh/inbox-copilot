"""
User API Routes - Quota, Stats, Preferences
"""
from fastapi import APIRouter, HTTPException, Query, Header
from typing import Optional

from ..models.schemas import UserQuota, UserStats
from ..core.config import settings

router = APIRouter(prefix="/user", tags=["User"])

# In-memory storage for demo (replace with database in production)
user_data = {}


def get_user_data(email: str) -> dict:
    """Get or create user data"""
    if email not in user_data:
        user_data[email] = {
            'lifetime_deleted': 0,
            'is_premium': False,
            'total_scanned': 0,
            'storage_saved_mb': 0.0,
            'last_scan': None
        }
    return user_data[email]


@router.get("/quota", response_model=UserQuota)
async def get_quota(user_email: str = Query(...)):
    """Get user's deletion quota status"""
    data = get_user_data(user_email)
    
    remaining = max(0, settings.FREE_DELETION_LIMIT - data['lifetime_deleted'])
    quota_percent = (data['lifetime_deleted'] / settings.FREE_DELETION_LIMIT) * 100
    
    return UserQuota(
        lifetime_deleted=data['lifetime_deleted'],
        free_limit=settings.FREE_DELETION_LIMIT,
        remaining=remaining if not data['is_premium'] else 999999,
        is_premium=data['is_premium'],
        quota_percent=min(quota_percent, 100)
    )


@router.get("/stats", response_model=UserStats)
async def get_stats(user_email: str = Query(...)):
    """Get user's usage statistics"""
    data = get_user_data(user_email)
    
    return UserStats(
        total_scanned=data['total_scanned'],
        total_deleted=data['lifetime_deleted'],
        storage_saved_mb=data['storage_saved_mb'],
        last_scan=data.get('last_scan')
    )


@router.post("/quota/add")
async def add_to_quota(
    user_email: str = Query(...),
    deleted_count: int = Query(...)
):
    """Add deleted emails to user's quota tracking"""
    data = get_user_data(user_email)
    data['lifetime_deleted'] += deleted_count
    data['storage_saved_mb'] += (deleted_count * 0.05)  # ~50KB per email
    
    return {
        "success": True,
        "new_total": data['lifetime_deleted'],
        "storage_saved_mb": data['storage_saved_mb']
    }


@router.post("/premium/activate")
async def activate_premium(user_email: str = Query(...)):
    """Activate premium for user (placeholder for payment integration)"""
    data = get_user_data(user_email)
    data['is_premium'] = True
    
    return {
        "success": True,
        "message": "Premium activated",
        "is_premium": True
    }


@router.get("/premium/status")
async def check_premium(user_email: str = Query(...)):
    """Check if user has premium status"""
    data = get_user_data(user_email)
    
    return {
        "is_premium": data['is_premium']
    }
