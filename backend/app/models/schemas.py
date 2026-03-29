"""
Pydantic schemas for API requests and responses
"""
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# ============ ENUMS ============
class EmailCategory(str, Enum):
    SPAM = "spam"
    SHOPPING = "shopping"
    SOCIAL = "social"
    PROMOTIONS = "promotions"
    NEWSLETTERS = "newsletters"
    FINANCE = "finance"
    UPDATES = "updates"
    UNKNOWN = "unknown"

# ============ AUTH SCHEMAS ============
class TokenRequest(BaseModel):
    code: str
    redirect_uri: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: int
    token_type: str = "Bearer"

class UserProfile(BaseModel):
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None

class AuthStatus(BaseModel):
    authenticated: bool
    user: Optional[UserProfile] = None

# ============ EMAIL SCHEMAS ============
class EmailPreview(BaseModel):
    id: str
    subject: str
    snippet: str
    date: str

class CategoryInfo(BaseModel):
    name: str
    color: str
    icon: str

class SenderInfo(BaseModel):
    email: str
    full_name: str
    count: int
    category: EmailCategory
    category_info: CategoryInfo
    date_range: str
    spam_score: int
    size_kb: float
    emails: List[EmailPreview]

class ScanRequest(BaseModel):
    limit: int = 1000

class ScanResponse(BaseModel):
    success: bool
    total_senders: int
    total_emails: int
    senders: List[SenderInfo]
    scan_time_seconds: float

class ScanProgress(BaseModel):
    progress: float  # 0.0 to 1.0
    status: str
    current_count: int
    total_count: int

# ============ DELETE SCHEMAS ============
class DeleteRequest(BaseModel):
    sender_emails: List[str]

class DeleteResponse(BaseModel):
    success: bool
    deleted_count: int
    message: str

# ============ USER/QUOTA SCHEMAS ============
class UserQuota(BaseModel):
    lifetime_deleted: int
    free_limit: int
    remaining: int
    is_premium: bool
    quota_percent: float

class UserStats(BaseModel):
    total_scanned: int
    total_deleted: int
    storage_saved_mb: float
    last_scan: Optional[datetime] = None

# ============ INBOX HEALTH ============
class InboxHealth(BaseModel):
    score: int  # 0-100
    status: str  # "Clean", "Moderate clutter", "Needs attention"
    emails_analyzed: int
    active_senders: int
    clutter_removed: int
    storage_saved_mb: float

# ============ CATEGORY STATS ============
class CategoryStats(BaseModel):
    category: EmailCategory
    count: int
    percentage: float

class ClutterBreakdown(BaseModel):
    categories: List[CategoryStats]
    top_senders: List[SenderInfo]
