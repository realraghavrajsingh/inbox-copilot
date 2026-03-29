"""
Gmail Service - Core business logic for Gmail operations
Extracted from the original Streamlit app for use with FastAPI
"""
import collections
import re
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Callable
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from ..core.config import settings
from ..models.schemas import (
    EmailCategory, EmailPreview, CategoryInfo, SenderInfo, 
    ScanResponse, DeleteResponse, InboxHealth, CategoryStats
)

# Email Categories Configuration
EMAIL_CATEGORIES = {
    'spam': {'name': 'Spam', 'color': '#ef4444', 'icon': '🚫', 'keywords': ['spam', 'winner', 'prize', 'lottery', 'claim', 'urgent']},
    'shopping': {'name': 'Shopping', 'color': '#f97316', 'icon': '🛒', 'keywords': ['amazon', 'flipkart', 'myntra', 'ajio', 'ebay', 'shopify']},
    'social': {'name': 'Social', 'color': '#06b6d4', 'icon': '👥', 'keywords': ['facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp']},
    'promotions': {'name': 'Promos', 'color': '#eab308', 'icon': '🔥', 'keywords': ['offer', 'deal', 'discount', 'sale', 'promo', 'coupon']},
    'newsletters': {'name': 'News', 'color': '#22c55e', 'icon': '📰', 'keywords': ['newsletter', 'digest', 'weekly', 'subscribe', 'substack']},
    'finance': {'name': 'Finance', 'color': '#3b82f6', 'icon': '💳', 'keywords': ['bank', 'paytm', 'gpay', 'credit', 'loan', 'statement']},
    'updates': {'name': 'Updates', 'color': '#a855f7', 'icon': '🔔', 'keywords': ['update', 'alert', 'notification', 'security', 'github']},
    'unknown': {'name': 'Other', 'color': '#64748b', 'icon': '📧', 'keywords': []}
}


class GmailService:
    """Service class for Gmail operations"""
    
    def __init__(self, credentials: Credentials):
        self.credentials = credentials
        self.service = build('gmail', 'v1', credentials=credentials)
    
    @staticmethod
    def get_email_address(from_field: str) -> str:
        """Extract email address from 'From' header"""
        match = re.search(r'<(.+?)>', from_field)
        if match:
            return match.group(1).lower()
        return from_field.lower().strip()
    
    @staticmethod
    def categorize_sender(email: str, subject: str = "") -> Tuple[str, Dict]:
        """Categorize sender based on email and subject patterns"""
        combined = f"{email} {subject}".lower()
        for cat, info in EMAIL_CATEGORIES.items():
            if cat == 'unknown':
                continue
            for keyword in info['keywords']:
                if keyword in combined:
                    return cat, info
        return 'unknown', EMAIL_CATEGORIES['unknown']
    
    def scan_inbox(
        self, 
        limit: int = 1000, 
        progress_callback: Optional[Callable[[float, str], None]] = None
    ) -> ScanResponse:
        """
        Scan inbox and return categorized sender information
        
        Args:
            limit: Maximum number of emails to scan
            progress_callback: Optional callback for progress updates (progress: 0-1, status: str)
        
        Returns:
            ScanResponse with sender data
        """
        import time
        start_time = time.time()
        
        sender_counter = collections.Counter()
        sender_data = {}
        
        try:
            # Fetch message IDs
            messages = []
            page_token = None
            
            while len(messages) < limit:
                remaining = limit - len(messages)
                max_results = min(500, remaining)
                
                request = self.service.users().messages().list(
                    userId='me', 
                    q='in:inbox', 
                    maxResults=max_results, 
                    pageToken=page_token
                )
                results = request.execute()
                batch_messages = results.get('messages', [])
                messages.extend(batch_messages)
                
                if progress_callback:
                    progress_callback(
                        min(len(messages) / limit, 0.5), 
                        f"Fetching messages: {len(messages)}/{limit}"
                    )
                
                page_token = results.get('nextPageToken')
                if not page_token or len(messages) >= limit:
                    break
            
            if not messages:
                return ScanResponse(
                    success=True,
                    total_senders=0,
                    total_emails=0,
                    senders=[],
                    scan_time_seconds=time.time() - start_time
                )
            
            messages = messages[:limit]
            
            # Process messages in batches
            def batch_callback(request_id, response, exception):
                if exception is None:
                    headers = response.get('payload', {}).get('headers', [])
                    from_email, subject, snippet = "", "", response.get('snippet', '')
                    date = response.get('internalDate', '')
                    
                    for h in headers:
                        if h['name'] == 'From':
                            from_email = h['value']
                        if h['name'] == 'Subject':
                            subject = h['value']
                    
                    if from_email:
                        email = self.get_email_address(from_email)
                        sender_counter[email] += 1
                        
                        if email not in sender_data:
                            sender_data[email] = {
                                'full_name': from_email,
                                'emails': [],
                                'dates': [],
                                'subjects': []
                            }
                        
                        email_date = None
                        if date:
                            try:
                                email_date = datetime.fromtimestamp(int(date) / 1000)
                            except:
                                email_date = datetime.now()
                        
                        sender_data[email]['emails'].append({
                            'id': response['id'],
                            'subject': subject or '(No Subject)',
                            'snippet': snippet[:300] if snippet else '',
                            'date': email_date.strftime('%Y-%m-%d %H:%M') if email_date else 'Unknown'
                        })
                        sender_data[email]['dates'].append(email_date)
                        sender_data[email]['subjects'].append(subject)
            
            # Execute batch requests
            total_batches = (len(messages) + 99) // 100
            for i in range(0, len(messages), 100):
                batch = self.service.new_batch_http_request(callback=batch_callback)
                for msg in messages[i:i+100]:
                    batch.add(
                        self.service.users().messages().get(
                            userId='me',
                            id=msg['id'],
                            format='metadata',
                            metadataHeaders=['From', 'Subject']
                        )
                    )
                batch.execute()
                
                if progress_callback:
                    batch_num = (i // 100) + 1
                    progress_callback(
                        0.5 + (batch_num / total_batches) * 0.5,
                        f"Analyzing messages: {batch_num}/{total_batches}"
                    )
            
            # Build response
            senders = []
            for email, count in sender_counter.most_common(100):
                category, category_info = self.categorize_sender(
                    email,
                    sender_data[email]['subjects'][0] if sender_data[email]['subjects'] else ""
                )
                
                dates = [d for d in sender_data[email]['dates'] if d]
                if dates:
                    date_range = f"{min(dates).strftime('%b %d')} - {max(dates).strftime('%b %d')}"
                else:
                    date_range = "Unknown"
                
                # Calculate spam score
                base_scores = {
                    'spam': 90, 'promotions': 70, 'newsletters': 50,
                    'shopping': 60, 'social': 40, 'updates': 30,
                    'finance': 20, 'unknown': 35
                }
                spam_score = min(base_scores.get(category, 35) + min(count // 10, 10), 99)
                
                senders.append(SenderInfo(
                    email=email,
                    full_name=sender_data[email]['full_name'],
                    count=count,
                    category=EmailCategory(category),
                    category_info=CategoryInfo(
                        name=category_info['name'],
                        color=category_info['color'],
                        icon=category_info['icon']
                    ),
                    date_range=date_range,
                    spam_score=spam_score,
                    size_kb=count * settings.AVG_EMAIL_SIZE_KB,
                    emails=[
                        EmailPreview(**em) for em in sender_data[email]['emails'][:25]
                    ]
                ))
            
            return ScanResponse(
                success=True,
                total_senders=len(senders),
                total_emails=sum(s.count for s in senders),
                senders=senders,
                scan_time_seconds=time.time() - start_time
            )
            
        except Exception as e:
            return ScanResponse(
                success=False,
                total_senders=0,
                total_emails=0,
                senders=[],
                scan_time_seconds=time.time() - start_time
            )
    
    def delete_emails_from_sender(self, sender_email: str) -> DeleteResponse:
        """
        Delete all emails from a specific sender
        
        Args:
            sender_email: Email address of the sender
        
        Returns:
            DeleteResponse with deletion status
        """
        try:
            # Create filter to auto-trash future emails from this sender
            filter_body = {
                'criteria': {'from': sender_email},
                'action': {'removeLabelIds': ['INBOX'], 'addLabelIds': ['TRASH']}
            }
            try:
                self.service.users().settings().filters().create(
                    userId='me', body=filter_body
                ).execute()
            except:
                pass  # Filter might already exist
            
            # Get all messages from sender
            result = self.service.users().messages().list(
                userId='me', q=f"from:{sender_email}"
            ).execute()
            messages = result.get('messages', [])
            
            if messages:
                ids = [m['id'] for m in messages]
                # Batch delete in chunks of 1000
                for i in range(0, len(ids), 1000):
                    self.service.users().messages().batchDelete(
                        userId='me', body={'ids': ids[i:i+1000]}
                    ).execute()
                
                return DeleteResponse(
                    success=True,
                    deleted_count=len(ids),
                    message=f"Successfully deleted {len(ids)} emails from {sender_email}"
                )
            
            return DeleteResponse(
                success=True,
                deleted_count=0,
                message=f"No emails found from {sender_email}"
            )
            
        except Exception as e:
            return DeleteResponse(
                success=False,
                deleted_count=0,
                message=f"Error deleting emails: {str(e)}"
            )
    
    def delete_multiple_senders(self, sender_emails: List[str]) -> DeleteResponse:
        """Delete emails from multiple senders"""
        total_deleted = 0
        errors = []
        
        for email in sender_emails:
            result = self.delete_emails_from_sender(email)
            if result.success:
                total_deleted += result.deleted_count
            else:
                errors.append(f"{email}: {result.message}")
        
        if errors:
            return DeleteResponse(
                success=len(errors) < len(sender_emails),
                deleted_count=total_deleted,
                message=f"Deleted {total_deleted} emails. Errors: {'; '.join(errors)}"
            )
        
        return DeleteResponse(
            success=True,
            deleted_count=total_deleted,
            message=f"Successfully deleted {total_deleted} emails from {len(sender_emails)} senders"
        )
    
    def get_inbox_health(self, scan_result: ScanResponse) -> InboxHealth:
        """Calculate inbox health score based on scan results"""
        if not scan_result.senders:
            return InboxHealth(
                score=100,
                status="Clean",
                emails_analyzed=0,
                active_senders=0,
                clutter_removed=0,
                storage_saved_mb=0.0
            )
        
        # Calculate health score (100 = clean, 0 = very cluttered)
        total_emails = scan_result.total_emails
        spam_emails = sum(
            s.count for s in scan_result.senders 
            if s.category in [EmailCategory.SPAM, EmailCategory.PROMOTIONS]
        )
        
        clutter_ratio = spam_emails / total_emails if total_emails > 0 else 0
        score = max(0, min(100, int(100 - (clutter_ratio * 100))))
        
        if score >= 80:
            status = "Clean"
        elif score >= 50:
            status = "Moderate clutter"
        else:
            status = "Needs attention"
        
        return InboxHealth(
            score=score,
            status=status,
            emails_analyzed=total_emails,
            active_senders=scan_result.total_senders,
            clutter_removed=0,  # Updated after deletions
            storage_saved_mb=0.0
        )


def generate_email_text(emails: List[Dict], sender: str) -> str:
    """Generate plain text export of emails"""
    text = f"Emails from: {sender}\n"
    text += f"Exported: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
    text += "=" * 60 + "\n\n"
    
    for i, em in enumerate(emails, 1):
        text += f"[{i}] Subject: {em.get('subject', '(No Subject)')}\n"
        text += f"    Date: {em.get('date', 'Unknown')}\n"
        text += f"    Preview:\n    {em.get('snippet', 'No preview')}\n"
        text += "-" * 40 + "\n"
    
    return text


def generate_email_csv(emails: List[Dict]) -> str:
    """Generate CSV export of emails"""
    csv_data = "Subject,Date,Preview\n"
    for em in emails:
        subj = em.get('subject', '').replace('"', '""')
        date_str = em.get('date', '')
        snip = em.get('snippet', '').replace('"', '""').replace('\n', ' ')
        csv_data += f'"{subj}","{date_str}","{snip}"\n'
    return csv_data
