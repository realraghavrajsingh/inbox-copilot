"""
Email Operations API Routes
"""
from fastapi import APIRouter, HTTPException, Query, Header, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import Optional
import asyncio

from ..services.gmail_service import GmailService, generate_email_text, generate_email_csv
from ..services.auth_service import AuthService
from ..models.schemas import (
    ScanRequest, ScanResponse, DeleteRequest, DeleteResponse,
    SenderInfo, InboxHealth, EmailCategory
)
from ..core.config import settings

router = APIRouter(prefix="/emails", tags=["Email Operations"])


def get_gmail_service(access_token: str, refresh_token: Optional[str] = None) -> GmailService:
    """Helper to create Gmail service from token"""
    credentials = AuthService.create_credentials(access_token, refresh_token)
    return GmailService(credentials)


@router.post("/scan", response_model=ScanResponse)
async def scan_inbox(
    request: ScanRequest,
    access_token: str = Header(..., alias="Authorization"),
    refresh_token: Optional[str] = Header(default=None, alias="X-Refresh-Token")
):
    """
    Scan inbox and return categorized sender information
    
    - **limit**: Maximum number of emails to scan (500-25000)
    """
    # Remove "Bearer " prefix if present
    if access_token.startswith("Bearer "):
        access_token = access_token[7:]
    
    # Validate limit
    limit = max(settings.SCAN_MIN, min(request.limit, settings.SCAN_MAX))
    
    try:
        gmail_service = get_gmail_service(access_token, refresh_token)
        result = gmail_service.scan_inbox(limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/delete", response_model=DeleteResponse)
async def delete_emails(
    request: DeleteRequest,
    access_token: str = Header(..., alias="Authorization"),
    refresh_token: Optional[str] = Header(default=None, alias="X-Refresh-Token")
):
    """
    Delete emails from specified senders
    
    - **sender_emails**: List of sender email addresses to delete emails from
    """
    if access_token.startswith("Bearer "):
        access_token = access_token[7:]
    
    if not request.sender_emails:
        raise HTTPException(status_code=400, detail="No sender emails provided")
    
    try:
        gmail_service = get_gmail_service(access_token, refresh_token)
        result = gmail_service.delete_multiple_senders(request.sender_emails)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.delete("/sender/{sender_email}", response_model=DeleteResponse)
async def delete_sender_emails(
    sender_email: str,
    access_token: str = Header(..., alias="Authorization"),
    refresh_token: Optional[str] = Header(default=None, alias="X-Refresh-Token")
):
    """Delete all emails from a specific sender"""
    if access_token.startswith("Bearer "):
        access_token = access_token[7:]
    
    try:
        gmail_service = get_gmail_service(access_token, refresh_token)
        result = gmail_service.delete_emails_from_sender(sender_email)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@router.get("/health", response_model=InboxHealth)
async def get_inbox_health(
    access_token: str = Header(..., alias="Authorization"),
    refresh_token: Optional[str] = Header(default=None, alias="X-Refresh-Token"),
    limit: int = Query(default=1000, ge=500, le=5000)
):
    """
    Get inbox health score based on quick scan
    Returns a health score from 0-100
    """
    if access_token.startswith("Bearer "):
        access_token = access_token[7:]
    
    try:
        gmail_service = get_gmail_service(access_token, refresh_token)
        scan_result = gmail_service.scan_inbox(limit=limit)
        health = gmail_service.get_inbox_health(scan_result)
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/export/txt")
async def export_emails_txt(
    sender_email: str = Query(...),
    access_token: str = Header(..., alias="Authorization"),
    refresh_token: Optional[str] = Header(default=None, alias="X-Refresh-Token")
):
    """Export emails from a sender as plain text"""
    if access_token.startswith("Bearer "):
        access_token = access_token[7:]
    
    try:
        gmail_service = get_gmail_service(access_token, refresh_token)
        # Quick scan to get sender data
        result = gmail_service.scan_inbox(limit=1000)
        
        sender = next((s for s in result.senders if s.email == sender_email), None)
        if not sender:
            raise HTTPException(status_code=404, detail="Sender not found")
        
        emails = [e.model_dump() for e in sender.emails]
        text_content = generate_email_text(emails, sender_email)
        
        return StreamingResponse(
            iter([text_content]),
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=emails_{sender_email.replace('@', '_')}.txt"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/export/csv")
async def export_emails_csv(
    sender_email: str = Query(...),
    access_token: str = Header(..., alias="Authorization"),
    refresh_token: Optional[str] = Header(default=None, alias="X-Refresh-Token")
):
    """Export emails from a sender as CSV"""
    if access_token.startswith("Bearer "):
        access_token = access_token[7:]
    
    try:
        gmail_service = get_gmail_service(access_token, refresh_token)
        result = gmail_service.scan_inbox(limit=1000)
        
        sender = next((s for s in result.senders if s.email == sender_email), None)
        if not sender:
            raise HTTPException(status_code=404, detail="Sender not found")
        
        emails = [e.model_dump() for e in sender.emails]
        csv_content = generate_email_csv(emails)
        
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=emails_{sender_email.replace('@', '_')}.csv"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.get("/categories")
async def get_categories():
    """Get list of email categories with metadata"""
    from ..services.gmail_service import EMAIL_CATEGORIES
    return EMAIL_CATEGORIES
