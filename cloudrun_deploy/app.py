# app.py - Inbox Copilot - AI-Powered Email Management Platform
import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import time
import os
import collections
import re
import base64
from datetime import datetime, timedelta

# Load logo as base64 for embedding in HTML
def get_logo_base64():
    logo_path = os.path.join(os.path.dirname(__file__), 'logo.png')
    if os.path.exists(logo_path):
        with open(logo_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')
    return None

LOGO_BASE64 = get_logo_base64()

# Google API imports
try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow, Flow
    from googleapiclient.discovery import build
    import google.auth.transport.requests
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False

import urllib.parse
import requests as http_requests

# --- CONFIGURATION ---
AVG_EMAIL_SIZE_KB = 50
SCOPES = ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.settings.basic', 'https://www.googleapis.com/auth/userinfo.email']
TOKEN_FILE = 'token.json'
CREDS_FILE = 'credentials.json'

# Check if running on Cloud/Remote
IS_CLOUD = os.environ.get('GOOGLE_CLIENT_ID') is not None or os.environ.get('K_SERVICE') is not None

def get_redirect_uri():
    """Get the appropriate redirect URI based on environment"""
    # Prefer explicit redirect URI if provided (Render/Cloud Run/any host)
    explicit_redirect = os.environ.get('REDIRECT_URI')
    if explicit_redirect:
        return explicit_redirect
    # Cloud Run - use the URL that user actually visits
    if os.environ.get('K_SERVICE'):
        return "https://inbox-copilot-165125627588.us-central1.run.app"
    # Local development
    return "http://localhost:8501"

def get_oauth_credentials():
    """Get OAuth client credentials from environment or file"""
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    if client_id and client_secret:
        return client_id, client_secret
    
    # Fall back to local credentials.json
    if os.path.exists(CREDS_FILE):
        import json
        with open(CREDS_FILE, 'r') as f:
            creds = json.load(f)
            installed = creds.get('installed') or creds.get('web', {})
            return installed.get('client_id'), installed.get('client_secret')
    
    return None, None

def get_google_auth_url():
    """Generate Google OAuth authorization URL"""
    client_id, _ = get_oauth_credentials()
    if not client_id:
        return None
    
    redirect_uri = get_redirect_uri()
    
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': ' '.join(SCOPES),
        'response_type': 'code',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return auth_url

def exchange_code_for_tokens(code):
    """Exchange authorization code for access and refresh tokens"""
    client_id, client_secret = get_oauth_credentials()
    if not client_id or not client_secret:
        return None
    
    redirect_uri = get_redirect_uri()
    
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    }
    
    try:
        response = http_requests.post(token_url, data=data)
        if response.status_code == 200:
            tokens = response.json()
            # Create Credentials object
            creds = Credentials(
                token=tokens.get('access_token'),
                refresh_token=tokens.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=client_id,
                client_secret=client_secret,
                scopes=SCOPES
            )
            return creds
        else:
            st.error(f"Token exchange failed: {response.text}")
            return None
    except Exception as e:
        st.error(f"Token exchange error: {e}")
        return None

# --- FREEMIUM LIMITS ---
FREE_DELETION_LIMIT = 1000  # Free tier: 1000 email deletions
SCAN_MIN = 500
SCAN_MAX = 25000
SCAN_DEFAULT = 1000
SCAN_STEP = 500

# --- EMAIL CATEGORIES ---
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

# Page Configuration with custom logo
st.set_page_config(
    page_title="Inbox Copilot - AI Email Management", 
    page_icon="logo.png" if os.path.exists(os.path.join(os.path.dirname(__file__), 'logo.png')) else "📬",
    layout="wide", 
    initial_sidebar_state="collapsed"
)

# Force title and favicon update with JavaScript
favicon_html = ""
if LOGO_BASE64:
    favicon_html = f"""
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'shortcut icon';
    link.href = 'data:image/png;base64,{LOGO_BASE64[:5000]}...';
    document.getElementsByTagName('head')[0].appendChild(link);
    """

st.markdown(f"""
<script>
    document.title = "Inbox Copilot - AI Email Management";
    setInterval(function() {{
        if (!document.title.includes("Inbox Copilot")) {{
            document.title = "Inbox Copilot - AI Email Management";
        }}
    }}, 100);
</script>
""", unsafe_allow_html=True)


# --- HELPER FUNCTIONS ---
def get_email_address(header_value):
    if not header_value: return "Unknown"
    match = re.search(r'<(.+?)>', header_value)
    return match.group(1).lower() if match else header_value.lower()

def categorize_sender(email, subject=""):
    email_lower = email.lower()
    subject_lower = subject.lower() if subject else ""
    for category, info in EMAIL_CATEGORIES.items():
        if category == 'unknown': continue
        for keyword in info['keywords']:
            if keyword in email_lower or keyword in subject_lower:
                return category, info
    return 'unknown', EMAIL_CATEGORIES['unknown']

def authenticate():
    """Handle authentication - redirects to Google OAuth"""
    if not GOOGLE_API_AVAILABLE: 
        st.error("Google API libraries not available")
        return None
    
    client_id, client_secret = get_oauth_credentials()
    if not client_id or not client_secret:
        st.error("❌ Missing credentials! Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.")
        return None
    
    # For cloud deployment, use web OAuth redirect
    if IS_CLOUD:
        auth_url = get_google_auth_url()
        if auth_url:
            # Redirect user to Google OAuth
            st.markdown(f'<meta http-equiv="refresh" content="0;url={auth_url}">', unsafe_allow_html=True)
            st.info("Redirecting to Google for authentication...")
            return None
    else:
        # Local development - use InstalledAppFlow
        try:
            if os.path.exists(TOKEN_FILE): os.remove(TOKEN_FILE)
            creds_config = {
                "installed": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": ["http://localhost"]
                }
            }
            flow = InstalledAppFlow.from_client_config(creds_config, SCOPES)
            creds = flow.run_local_server(port=0, prompt='select_account', open_browser=True)
            with open(TOKEN_FILE, 'w') as token: token.write(creds.to_json())
            return creds
        except Exception as e:
            st.error(f"Auth failed: {e}")
            return None
    return None

def load_saved_credentials():
    if not GOOGLE_API_AVAILABLE: return None
    if os.path.exists(TOKEN_FILE):
        try:
            creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
            if creds and creds.valid: return creds
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
                with open(TOKEN_FILE, 'w') as token: token.write(creds.to_json())
                return creds
        except: pass
    return None

def get_user_profile(service):
    try:
        profile = service.users().getProfile(userId='me').execute()
        return profile.get('emailAddress', 'Unknown'), profile
    except: return 'Unknown', {}

def scan_inbox(service, limit=1000, progress_callback=None):
    sender_counter = collections.Counter()
    sender_data = {}
    try:
        messages = []
        page_token = None
        while len(messages) < limit:
            remaining = limit - len(messages)
            max_results = min(500, remaining)
            request = service.users().messages().list(userId='me', q='in:inbox', maxResults=max_results, pageToken=page_token)
            results = request.execute()
            batch_messages = results.get('messages', [])
            messages.extend(batch_messages)
            if progress_callback:
                progress_callback(min(len(messages) / limit, 1.0), f"Fetching: {len(messages)}/{limit}")
            page_token = results.get('nextPageToken')
            if not page_token or len(messages) >= limit: break
        if not messages: return pd.DataFrame(), {}
        messages = messages[:limit]

        def batch_cb(request_id, response, exception):
            if exception is None:
                headers = response.get('payload', {}).get('headers', [])
                from_email, subject, snippet = "", "", response.get('snippet', '')
                date = response.get('internalDate', '')
                for h in headers:
                    if h['name'] == 'From': from_email = h['value']
                    if h['name'] == 'Subject': subject = h['value']
                if from_email:
                    email = get_email_address(from_email)
                    sender_counter[email] += 1
                    if email not in sender_data:
                        sender_data[email] = {'full_name': from_email, 'emails': [], 'dates': [], 'subjects': []}
                    email_date = None
                    if date:
                        try: email_date = datetime.fromtimestamp(int(date)/1000)
                        except: email_date = datetime.now()
                    sender_data[email]['emails'].append({
                        'id': response['id'], 'subject': subject or '(No Subject)',
                        'snippet': snippet[:300] if snippet else '', 'date': email_date.strftime('%Y-%m-%d %H:%M') if email_date else 'Unknown'
                    })
                    sender_data[email]['dates'].append(email_date)
                    sender_data[email]['subjects'].append(subject)

        total_batches = (len(messages) + 99) // 100
        for i in range(0, len(messages), 100):
            batch = service.new_batch_http_request(callback=batch_cb)
            for msg in messages[i:i+100]:
                batch.add(service.users().messages().get(userId='me', id=msg['id'], format='metadata', metadataHeaders=['From', 'Subject']))
            batch.execute()
            if progress_callback:
                batch_num = (i // 100) + 1
                progress_callback(0.5 + (batch_num / total_batches) * 0.5, f"Analyzing: {batch_num}/{total_batches}")
    except Exception as e:
        st.error(f"Scan error: {e}")
        return pd.DataFrame(), {}

    data = []
    for email, count in sender_counter.most_common(100):
        category, category_info = categorize_sender(email, sender_data[email]['subjects'][0] if sender_data[email]['subjects'] else "")
        dates = [d for d in sender_data[email]['dates'] if d]
        date_range = f"{min(dates).strftime('%b %d')} - {max(dates).strftime('%b %d')}" if dates else "Unknown"
        base_scores = {'spam': 90, 'promotions': 70, 'newsletters': 50, 'shopping': 60, 'social': 40, 'updates': 30, 'finance': 20, 'unknown': 35}
        spam_score = min(base_scores.get(category, 35) + min(count // 10, 10), 99)
        data.append({
            "Email": email, "Count": count, "Full Name": sender_data[email]['full_name'],
            "Category": category, "Category Name": category_info['name'], "Category Color": category_info['color'],
            "Category Icon": category_info['icon'], "Date Range": date_range, "Emails": sender_data[email]['emails'][:25],
            "Spam Score": spam_score, "Size KB": count * AVG_EMAIL_SIZE_KB
        })
    return pd.DataFrame(data), sender_data

def delete_emails_from_sender(service, email):
    try:
        filter_body = {'criteria': {'from': email}, 'action': {'removeLabelIds': ['INBOX'], 'addLabelIds': ['TRASH']}}
        try: service.users().settings().filters().create(userId='me', body=filter_body).execute()
        except: pass
        result = service.users().messages().list(userId='me', q=f"from:{email}").execute()
        messages = result.get('messages', [])
        if messages:
            ids = [m['id'] for m in messages]
            for i in range(0, len(ids), 1000):
                service.users().messages().batchDelete(userId='me', body={'ids': ids[i:i+1000]}).execute()
            return len(ids)
        return 0
    except Exception as e:
        st.error(f"Delete error: {e}")
        return 0


# --- SESSION STATE ---
def init_session_state():
    defaults = {
        'authenticated': False, 'creds': None, 'user_email': '', 'user_profile': {},
        'emails_df': None, 'sender_data': {}, 'selected_senders': [], 'scan_complete': False,
        'total_deleted': 0, 'storage_saved': 0, 'expanded_sender': None, 'filter_category': 'all',
        'modal_open': False, 'modal_sender': None, 'modal_emails': [], 'modal_size': 0, 'modal_category': None,
        'lifetime_deleted': 0, 'is_premium': False, 'show_premium_modal': False, 'dark_mode': True,
    }
    for key, value in defaults.items():
        if key not in st.session_state: st.session_state[key] = value
    if not st.session_state.authenticated and not st.session_state.creds:
        saved_creds = load_saved_credentials()
        if saved_creds:
            st.session_state.creds = saved_creds
            st.session_state.authenticated = True


# --- EMAIL EXPORT FUNCTIONS ---
def generate_email_text(emails, sender):
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


# ==================== LANDING PAGE ====================
def render_landing_page():
    # Get auth URL for the sign-in button
    auth_url = get_google_auth_url()
    
    # Debug: Show auth URL if not generated
    if not auth_url:
        st.error("OAuth URL not generated. Check GOOGLE_CLIENT_ID environment variable.")
        st.write("GOOGLE_CLIENT_ID set:", bool(os.environ.get('GOOGLE_CLIENT_ID')))
        return

    # Use the navbar sign-in button inside the landing page
    
    # Hide Streamlit elements and set cosmic background
    st.markdown("""<style>
        #MainMenu, footer, header, .stDeployButton {visibility: hidden; display: none;}
        div[data-testid="stToolbar"] {display: none;}
        .stApp { 
            background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%) !important; 
            min-height: 100vh; 
        }
        .block-container { padding-top: 0 !important; padding-bottom: 0 !important; max-width: 100% !important; }
        
        /* Teal CTA Button styling */
        .stButton > button, a[data-testid="baseLinkButton-secondary"] {
            background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
            color: white !important; border: none !important;
            padding: 0.75rem 1.5rem !important; border-radius: 8px !important;
            font-weight: 600 !important; font-size: 0.9rem !important;
            min-height: auto !important; height: auto !important;
            box-shadow: 0 4px 20px rgba(20,184,166,0.3) !important;
            transition: all 0.3s ease !important;
        }
        .stButton > button:hover, a[data-testid="baseLinkButton-secondary"]:hover {
            background: linear-gradient(135deg, #2dd4bf, #14b8a6) !important;
            box-shadow: 0 6px 25px rgba(20,184,166,0.4) !important;
            transform: translateY(-2px) !important;
        }
        a[data-testid="baseLinkButton-secondary"] p { color: white !important; }
    </style>""", unsafe_allow_html=True)
    
    # PART 1: Complete Landing Page matching mockup design
    landing_html = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
            body { background: transparent; color: white; overflow-x: hidden; }
            
            /* Cosmic space background */
            .page-bg {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
                background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 40%, #1a2744 70%, #0a1628 100%);
            }
            .stars {
                position: absolute; width: 100%; height: 100%;
                background-image: 
                    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4), transparent),
                    radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(2px 2px at 50% 10%, rgba(255,255,255,0.5), transparent),
                    radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(1px 1px at 90% 30%, rgba(255,255,255,0.4), transparent),
                    radial-gradient(2px 2px at 20% 80%, rgba(255,255,255,0.3), transparent),
                    radial-gradient(1px 1px at 80% 90%, rgba(255,255,255,0.4), transparent);
                background-size: 100% 100%;
                animation: twinkle 5s ease-in-out infinite alternate;
            }
            @keyframes twinkle { from { opacity: 0.6; } to { opacity: 1; } }
            
            /* Navbar */
            .navbar {
                padding: 0.75rem 2rem; display: flex; justify-content: space-between; align-items: center;
                background: rgba(10,22,40,0.9); backdrop-filter: blur(10px);
            }
            .logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 1rem; color: white; }
            .logo-img { width: 36px; height: 36px; border-radius: 8px; object-fit: contain; }
            .logo-icon { font-size: 1.25rem; }
            .nav-links { display: flex; gap: 1.5rem; align-items: center; font-size: 0.85rem; }
            .nav-links a { color: #94a3b8; text-decoration: none; display: flex; align-items: center; gap: 0.35rem; }
            .nav-links a:hover { color: white; }
            .nav-btn-outline { color: #94a3b8; background: none; border: none; cursor: pointer; font-size: 0.85rem; }
            .nav-btn-google {
                display: flex; align-items: center; gap: 0.5rem;
                background: transparent; color: white;
                padding: 0.5rem 1rem; border-radius: 25px; 
                border: 1px solid rgba(255,255,255,0.3);
                font-weight: 500; font-size: 0.85rem; cursor: pointer;
                text-decoration: none; transition: all 0.2s ease;
                font-family: 'Inter', sans-serif;
            }
            .nav-btn-google:hover {
                background: rgba(255,255,255,0.1);
                border-color: rgba(255,255,255,0.5);
            }
            .nav-btn-google svg {
                width: 18px; height: 18px;
            }
            .cta-btn {
                background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.75rem 1.25rem; border-radius: 8px; border: none; font-weight: 600;
                font-size: 0.9rem; cursor: pointer; white-space: nowrap;
                display: inline-flex; align-items: center; gap: 0.4rem;
                font-family: 'Inter', sans-serif;
            }
            .cta-btn:hover {
                background: linear-gradient(135deg, #2dd4bf, #14b8a6);
            }
            .nav-btn-primary {
                background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.5rem 1rem; border-radius: 6px; border: none; font-weight: 500;
                font-size: 0.85rem; cursor: pointer;
            }
            
            /* Hero Section */
            .hero { display: flex; padding: 2rem 3rem; gap: 2rem; max-width: 1300px; margin: 0 auto; align-items: flex-start; }
            .hero-left { flex: 1; padding-top: 1rem; }
            .hero-title { font-size: 2.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 1rem; color: #f1f5f9; }
            .hero-subtitle { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; max-width: 420px; }
            
            /* Email input form */
            .email-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; max-width: 400px; }
            .email-input {
                flex: 1; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
                background: rgba(255,255,255,0.05); color: white; font-size: 0.9rem;
            }
            .email-input::placeholder { color: #64748b; }
            
            /* Benefits list */
            .benefits { display: flex; flex-direction: column; gap: 0.6rem; }
            .benefit { display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.9rem; }
            .benefit-check { color: #14b8a6; }
            
            /* Dashboard Preview Card */
            .hero-right { flex: 1.2; }
            .dashboard-card {
                background: linear-gradient(145deg, rgba(20,35,60,0.95), rgba(15,25,45,0.98));
                border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;
                padding: 1.25rem; box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            }
            .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
            .card-logo { display: flex; align-items: center; gap: 0.5rem; }
            .card-logo-icon { font-size: 1.1rem; }
            .card-logo span { font-weight: 600; font-size: 0.9rem; }
            .card-user { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748b; }
            .user-avatar { width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; }
            
            /* Health Section */
            .health-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
            .health-left h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; }
            .health-left h3 span { color: #64748b; font-weight: 400; }
            .health-status { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #94a3b8; }
            .status-dot { width: 8px; height: 8px; border-radius: 50%; }
            .status-yellow { background: #eab308; }
            .health-desc { font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; line-height: 1.4; }
            
            .health-right { text-align: center; }
            .health-circle {
                width: 80px; height: 80px; border-radius: 50%; position: relative;
                background: conic-gradient(#22c55e 0% 68%, rgba(255,255,255,0.1) 68% 100%);
                display: flex; align-items: center; justify-content: center; margin: 0 auto 0.25rem;
            }
            .health-circle::before { content: ''; position: absolute; width: 64px; height: 64px; background: #0f1a2e; border-radius: 50%; }
            .health-score { position: relative; z-index: 1; font-size: 1.5rem; font-weight: 700; }
            .health-score small { font-size: 0.7rem; color: #64748b; font-weight: 400; }
            .health-label { font-size: 0.7rem; color: #64748b; }
            .health-sublabel { font-size: 0.65rem; color: #94a3b8; }
            .scan-btn-small {
                background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.4rem 0.75rem; border-radius: 6px; border: none; font-size: 0.7rem;
                font-weight: 500; margin-top: 0.5rem; cursor: pointer;
            }
            
            /* Stats Grid */
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; margin-bottom: 1rem; }
            .stat-box {
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px; padding: 0.75rem 0.5rem; text-align: center;
            }
            .stat-value { font-size: 1.25rem; font-weight: 700; color: white; }
            .stat-label { font-size: 0.65rem; color: #64748b; margin-top: 0.2rem; }
            
            /* Scan Section */
            .scan-section {
                background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px; padding: 1rem; display: flex; gap: 1rem; align-items: center;
            }
            .scan-info { flex: 1; }
            .scan-title { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.25rem; }
            .scan-desc { font-size: 0.75rem; color: #64748b; line-height: 1.4; }
            .scan-image { width: 100px; height: 70px; background: linear-gradient(135deg, #1e3a5f, #2d4a6f); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
            .scan-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
            .scan-btn-primary {
                background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.5rem 1rem; border-radius: 6px; border: none; font-size: 0.8rem;
                font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;
            }
            .scan-btn-secondary {
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
                color: white; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.8rem;
                cursor: pointer;
            }
            .scan-footer { display: flex; justify-content: space-between; margin-top: 0.75rem; font-size: 0.7rem; color: #64748b; }
            
            /* Features Section */
            .features { padding: 1.5rem 3rem; max-width: 1200px; margin: 0 auto; }
            .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 1.5rem; }
            .feature-card {
                background: linear-gradient(145deg, rgba(20,35,60,0.8), rgba(15,25,45,0.9));
                border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem;
            }
            .feature-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 1rem; }
            .feature-icon.blue { background: rgba(59,130,246,0.2); }
            .feature-icon.purple { background: rgba(139,92,246,0.2); }
            .feature-icon.teal { background: rgba(20,184,166,0.2); }
            .feature-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #f1f5f9; }
            .feature-desc { font-size: 0.8rem; color: #94a3b8; line-height: 1.5; }
            
            /* Benefits Footer */
            .benefits-footer { display: flex; justify-content: center; gap: 2rem; padding: 1rem 0; }
            .benefit-item { display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; font-size: 0.85rem; }
            .benefit-check { color: #14b8a6; }
            
            @media (max-width: 900px) {
                .hero { flex-direction: column; padding: 1.5rem; }
                .features-grid { grid-template-columns: 1fr; }
                .stats-grid { grid-template-columns: repeat(2, 1fr); }
                .navbar { padding: 0.75rem 1rem; }
                .nav-links a:not(:last-child):not(:nth-last-child(2)) { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="page-bg"><div class="stars"></div></div>
        
        <!-- Navbar -->
        <nav class="navbar">
            <div class="logo">
                <img src="__LOGO_DATA__" alt="Inbox Copilot" class="logo-img" onerror="this.style.display='none'">
                Inbox Copilot
            </div>
            <div class="nav-links">
                <a href="#">Features</a>
                <a href="#">Insights</a>
                <a href="#">Automation</a>
                <a href="#">Pricing</a>
                <a href="#">Reviews</a>
                <a href="__AUTH_URL__" class="nav-btn-google" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                </a>
            </div>
        </nav>
        
        <!-- Hero Section -->
        <section class="hero">
            <div class="hero-left">
                <h1 class="hero-title">Take control of your inbox<br>with AI-powered assistance</h1>
                <p class="hero-subtitle">Declutter your inbox, manage subscriptions, and gain valuable insights with AI-driven automation.</p>
                <div class="email-form">
                    <input type="email" class="email-input" placeholder="Enter your email" readonly>
                    <a href="__AUTH_URL__" class="cta-btn" target="_blank" rel="noopener">Get Started for Free →</a>
                </div>
                <div class="benefits">
                    <div class="benefit"><span class="benefit-check">✓</span> Reduce Email Clutter</div>
                    <div class="benefit"><span class="benefit-check">✓</span> Unsubscribe from Junk</div>
                    <div class="benefit"><span class="benefit-check">✓</span> Save Your Time</div>
                </div>
            </div>
            
            <div class="hero-right">
                <div class="dashboard-card">
                    <div class="card-header">
                        <div class="card-logo">
                            <img src="__LOGO_DATA__" alt="Logo" style="width:24px; height:24px; border-radius:4px;">
                            <span>Inbox Copilot</span>
                        </div>
                        <div class="card-user"><div class="user-avatar">U</div>user@gmail.com<span style="color:#22c55e;">● Connected</span></div>
                    </div>
                    
                    <div class="health-row">
                        <div class="health-left">
                            <h3>Inbox Health: 68 <span>/100</span></h3>
                            <div class="health-status"><span class="status-dot status-yellow"></span> Moderate clutter</div>
                            <p class="health-desc">Your inbox is in good state as collection reports of organizing improved your folders.</p>
                        </div>
                        <div class="health-right">
                            <div class="health-circle"><span class="health-score">68<small>/100</small></span></div>
                            <div class="health-label">Inbox Health</div>
                            <div class="health-sublabel">Moderate clutter</div>
                            <button class="scan-btn-small">Scan My Inbox</button>
                        </div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-box"><div class="stat-value">982</div><div class="stat-label">Emails Analyzed</div></div>
                        <div class="stat-box"><div class="stat-value">127</div><div class="stat-label">Active Senders</div></div>
                        <div class="stat-box"><div class="stat-value">3,248</div><div class="stat-label">Clutter Removed</div></div>
                        <div class="stat-box"><div class="stat-value">5.8 MB</div><div class="stat-label">Storage Saved</div></div>
                    </div>
                    
                    <div class="scan-section">
                        <div class="scan-info">
                            <div class="scan-title">Start a Scan</div>
                            <div class="scan-desc">Reduce inbox noise to improve your focus and reclaim precious time.</div>
                            <div class="scan-actions">
                                <button class="scan-btn-primary">▶ Scan My Inbox</button>
                                <button class="scan-btn-secondary">> 2 min</button>
                            </div>
                        </div>
                        <div class="scan-image">📧</div>
                    </div>
                    <div class="scan-footer">
                        <span>⏱ Estimated time: ~2 min</span>
                        <span>Estimated time: ~2 min</span>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Features -->
        <section class="features">
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon blue">🛡️</div>
                    <div class="feature-title">Safe Email Cleanup</div>
                    <div class="feature-desc">AI scans your emails and identifies clutter for safe, one-click cleanup.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon purple">🚫</div>
                    <div class="feature-title">Smart Unsubscribe</div>
                    <div class="feature-desc">Effortlessly unsubscribe from unwanted newsletters and recurring junk mail.</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon teal">📊</div>
                    <div class="feature-title">Actionable Insights</div>
                    <div class="feature-desc">Gain valuable insights into your email habits and declutter smarter.</div>
                </div>
            </div>
            <div class="benefits-footer">
                <div class="benefit-item"><span class="benefit-check">✓</span> Reduce Email Clutter</div>
                <div class="benefit-item"><span class="benefit-check">✓</span> Unsubscribe from Junk</div>
                <div class="benefit-item"><span class="benefit-check">✓</span> Save Your Time</div>
            </div>
        </section>
    </body>
    </html>
    """
    # Replace placeholders
    landing_html = landing_html.replace("__AUTH_URL__", auth_url)
    logo_data = f"data:image/png;base64,{LOGO_BASE64}" if LOGO_BASE64 else ""
    landing_html = landing_html.replace("__LOGO_DATA__", logo_data)
    components.html(landing_html, height=850, scrolling=False)
    
    # Add working Sign-in button using Streamlit's native link_button (works outside iframe)
    st.markdown("""
    <style>
        /* Style the Streamlit link button to match our design */
        a[data-testid="baseLinkButton-secondary"] {
            background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
            color: white !important;
            border: none !important;
            padding: 0.875rem 2rem !important;
            border-radius: 10px !important;
            font-weight: 600 !important;
            font-size: 1rem !important;
            box-shadow: 0 4px 20px rgba(20,184,166,0.4) !important;
            transition: all 0.3s ease !important;
            text-decoration: none !important;
        }
        a[data-testid="baseLinkButton-secondary"]:hover {
            background: linear-gradient(135deg, #2dd4bf, #14b8a6) !important;
            box-shadow: 0 6px 30px rgba(20,184,166,0.5) !important;
            transform: translateY(-2px) !important;
        }
        a[data-testid="baseLinkButton-secondary"] p {
            color: white !important;
            margin: 0 !important;
        }
    </style>
    """, unsafe_allow_html=True)
    
    # Prominent Sign-in Section
    st.markdown("""
    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(20,184,166,0.1), rgba(59,130,246,0.1)); border-radius: 16px; margin: 20px auto; max-width: 500px;">
        <h2 style="color: #f1f5f9; margin-bottom: 10px;">Ready to clean your inbox?</h2>
        <p style="color: #94a3b8; margin-bottom: 20px;">Sign in with Google to get started</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if IS_CLOUD:
            st.link_button("🚀 Sign in with Google", auth_url, use_container_width=True)
        else:
            if st.button("🚀 Sign in with Google", use_container_width=True):
                with st.spinner("Redirecting to Google..."):
                    creds = authenticate()
                    if creds:
                        st.session_state.creds = creds
                        st.session_state.authenticated = True
                        st.rerun()
    
    # Debug info (remove after fixing)
    with st.expander("Debug Info (click to expand)"):
        st.code(auth_url, language=None)
        st.write("Click the URL above manually if button doesn't work")


# ==================== DASHBOARD ====================
def render_dashboard():
    # Theme - always dark for this design
    theme = {
        'bg': '#0a1628',
        'card_bg': 'rgba(20,35,60,0.95)',
        'card_border': 'rgba(255,255,255,0.08)',
        'text': '#f1f5f9',
        'text_muted': '#94a3b8',
        'text_dim': '#64748b',
        'teal': '#14b8a6',
        'yellow': '#eab308',
        'orange': '#f97316',
        'red': '#ef4444',
        'purple': '#a78bfa',
        'blue': '#3b82f6',
    }
    
    # Complete Dashboard CSS matching mockup design
    st.markdown(f"""
    <style>
        .stApp {{ background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%) !important; }}
        #MainMenu, footer, header, .stDeployButton {{ visibility: hidden; display: none; }}
        div[data-testid="stToolbar"] {{ display: none; }}
        .block-container {{ padding: 0 !important; max-width: 100% !important; }}
        h1, h2, h3, p, span, div, label {{ color: {theme['text']} !important; }}
        
        /* Buttons */
        .stButton > button {{
            background: rgba(255,255,255,0.05) !important;
            color: {theme['text']} !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 8px !important; font-size: 0.8rem !important;
            transition: all 0.2s ease !important;
        }}
        .stButton > button:hover {{
            background: rgba(20,184,166,0.15) !important;
            border-color: {theme['teal']} !important;
        }}
        div[data-testid="stButton"] button[kind="primary"] {{
            background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
            color: #fff !important; border: none !important;
        }}
        .stSlider > div > div > div > div {{ background: {theme['teal']} !important; }}
        .stCheckbox > label {{ color: {theme['text_muted']} !important; font-size: 0.8rem !important; }}
    </style>
    """, unsafe_allow_html=True)
    
    service = build('gmail', 'v1', credentials=st.session_state.creds)
    if not st.session_state.user_email:
        st.session_state.user_email, st.session_state.user_profile = get_user_profile(service)
    
    # Calculate DYNAMIC stats based on actual user data
    df = st.session_state.emails_df
    has_data = df is not None and not df.empty
    total_emails = df['Count'].sum() if has_data else 0
    unique_senders = len(df) if has_data else 0
    mb_saved = (st.session_state.total_deleted * AVG_EMAIL_SIZE_KB) / 1024
    clutter_removed = st.session_state.total_deleted
    # Calculate inbox health: starts at 100, decreases based on emails found
    if has_data:
        inbox_health = max(30, 100 - min(70, total_emails // 20))
    else:
        inbox_health = 100  # Clean inbox if no scan done yet
    
    # Status text based on health
    if inbox_health >= 80:
        health_status = "Good health"
        health_desc = "Your inbox is in great shape. Keep it up!"
    elif inbox_health >= 50:
        health_status = "Moderate clutter"
        health_desc = "Consider cleaning up some clutter to improve your score."
    else:
        health_status = "Needs attention"
        health_desc = "Your inbox has significant clutter. Start a scan to clean it up."
    
    # Generate dynamic top senders HTML
    top_senders_html = ""
    colors = ["#f97316", "#eab308", "#ef4444", "#14b8a6", "#8b5cf6"]
    if has_data:
        top_5 = df.nlargest(5, 'Count')
        for i, (_, row) in enumerate(top_5.iterrows()):
            sender_name = row['Email'].split('@')[0][:15]
            sender_domain = '@' + row['Email'].split('@')[1].split('.')[0] if '@' in row['Email'] else ''
            count = row['Count']
            color = colors[i % len(colors)]
            top_senders_html += f'''<div class="sender-item">
                <span class="sender-color" style="background: {color};"></span>
                <div class="sender-info">
                    <div class="sender-name">{sender_name}</div>
                    <div class="sender-email-small">{sender_domain}</div>
                </div>
                <span class="sender-count">{count} emails</span>
            </div>'''
    else:
        top_senders_html = '<div style="text-align:center; padding:1rem; color:#64748b;">Run a scan to see top senders</div>'
    
    # Render complete dashboard HTML
    dashboard_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }}
            body {{ background: transparent; color: #f1f5f9; }}
            
            /* Navbar */
            .navbar {{
                display: flex; justify-content: space-between; align-items: center;
                padding: 0.75rem 1.5rem; background: rgba(10,22,40,0.95);
                border-bottom: 1px solid rgba(255,255,255,0.08);
            }}
            .nav-logo {{ display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }}
            .nav-logo span {{ font-size: 1.1rem; }}
            .nav-tabs {{ display: flex; gap: 0.25rem; }}
            .nav-tab {{
                padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; color: #94a3b8;
                cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem;
            }}
            .nav-tab:hover {{ background: rgba(255,255,255,0.05); color: #f1f5f9; }}
            .nav-tab.active {{ background: rgba(20,184,166,0.15); color: #14b8a6; }}
            .nav-user {{
                display: flex; align-items: center; gap: 0.75rem;
                background: rgba(255,255,255,0.05); padding: 0.4rem 0.75rem 0.4rem 0.4rem;
                border-radius: 30px; border: 1px solid rgba(255,255,255,0.08);
            }}
            .user-avatar {{
                width: 28px; height: 28px; border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                display: flex; align-items: center; justify-content: center;
                font-size: 0.75rem; font-weight: 600;
            }}
            .user-info {{ font-size: 0.75rem; }}
            .user-email {{ color: #f1f5f9; }}
            .user-status {{ color: #22c55e; font-size: 0.65rem; }}
            
            /* Main Layout */
            .dashboard {{ display: flex; gap: 1.25rem; padding: 1.25rem; }}
            .main-col {{ flex: 2; display: flex; flex-direction: column; gap: 1rem; }}
            .side-col {{ flex: 1; display: flex; flex-direction: column; gap: 1rem; max-width: 320px; }}
            
            /* Cards */
            .card {{
                background: linear-gradient(145deg, rgba(20,35,60,0.95), rgba(15,25,45,0.98));
                border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem;
            }}
            .card-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }}
            .card-title {{ font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }}
            .card-title span {{ color: #64748b; font-weight: 400; }}
            
            /* Inbox Health */
            .health-row {{ display: flex; justify-content: space-between; align-items: flex-start; }}
            .health-left {{ flex: 1; }}
            .health-status {{ display: flex; align-items: center; gap: 0.4rem; margin-top: 0.5rem; font-size: 0.8rem; color: #94a3b8; }}
            .status-dot {{ width: 8px; height: 8px; border-radius: 50%; }}
            .status-yellow {{ background: #eab308; }}
            .status-green {{ background: #22c55e; }}
            .health-desc {{ font-size: 0.75rem; color: #64748b; margin-top: 0.75rem; line-height: 1.5; }}
            .health-right {{ text-align: center; }}
            .health-circle {{
                width: 90px; height: 90px; border-radius: 50%; position: relative;
                background: conic-gradient(#22c55e 0% {inbox_health}%, rgba(255,255,255,0.1) {inbox_health}% 100%);
                display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem;
            }}
            .health-circle::before {{
                content: ''; position: absolute; width: 72px; height: 72px;
                background: linear-gradient(145deg, #0f1a2e, #142240); border-radius: 50%;
            }}
            .health-score {{ position: relative; z-index: 1; font-size: 1.75rem; font-weight: 700; }}
            .health-score small {{ font-size: 0.8rem; color: #64748b; font-weight: 400; }}
            .health-label {{ font-size: 0.7rem; color: #64748b; }}
            
            /* Stats Grid */
            .stats-row {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 1rem; }}
            .stat-box {{
                background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px; padding: 0.875rem; text-align: center;
            }}
            .stat-value {{ font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }}
            .stat-label {{ font-size: 0.65rem; color: #64748b; margin-top: 0.25rem; }}
            
            /* Scan Section */
            .scan-section {{ display: flex; gap: 1rem; align-items: flex-start; }}
            .scan-content {{ flex: 1; }}
            .scan-title {{ font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }}
            .scan-desc {{ font-size: 0.8rem; color: #64748b; margin-bottom: 1rem; line-height: 1.5; }}
            .scan-actions {{ display: flex; gap: 0.5rem; }}
            .btn-teal {{
                background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.6rem 1rem; border-radius: 8px; border: none; font-size: 0.8rem;
                font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
            }}
            .btn-outline {{
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15);
                color: #f1f5f9; padding: 0.6rem 0.75rem; border-radius: 8px; font-size: 0.8rem;
                cursor: pointer;
            }}
            .scan-image {{
                width: 140px; height: 100px; border-radius: 12px;
                background: linear-gradient(145deg, #1e3a5f, #2d4a6f);
                display: flex; align-items: center; justify-content: center; font-size: 3rem;
            }}
            .scan-footer {{ display: flex; justify-content: space-between; margin-top: 0.75rem; font-size: 0.7rem; color: #64748b; }}
            
            /* Free Plan Card */
            .plan-card {{
                background: linear-gradient(145deg, rgba(20,35,60,0.95), rgba(15,25,45,0.98));
                border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.25rem;
            }}
            .plan-header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }}
            .plan-title {{ font-size: 1rem; font-weight: 600; }}
            .plan-remaining {{ font-size: 0.75rem; color: #64748b; }}
            .plan-btn {{
                width: 100%; background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.75rem; border-radius: 8px; border: none; font-size: 0.85rem;
                font-weight: 600; cursor: pointer; margin-top: 0.75rem;
            }}
            
            /* AI Cleanup Suggestions */
            .suggestion-item {{
                display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }}
            .suggestion-item:last-child {{ border-bottom: none; }}
            .suggestion-dot {{ width: 10px; height: 10px; border-radius: 50%; }}
            .dot-blue {{ background: #3b82f6; }}
            .dot-purple {{ background: #a78bfa; }}
            .dot-orange {{ background: #f97316; }}
            .suggestion-text {{ flex: 1; font-size: 0.85rem; color: #94a3b8; }}
            .suggestion-actions {{ display: flex; gap: 0.5rem; }}
            
            /* Top Sender Clutter */
            .sender-item {{
                display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
            }}
            .sender-item:last-child {{ border-bottom: none; }}
            .sender-color {{ width: 10px; height: 10px; border-radius: 50%; }}
            .sender-info {{ flex: 1; }}
            .sender-name {{ font-size: 0.85rem; font-weight: 500; }}
            .sender-email-small {{ font-size: 0.7rem; color: #64748b; }}
            .sender-count {{ font-size: 0.8rem; color: #f97316; font-weight: 600; }}
            
            /* Charts Section */
            .charts-row {{ display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }}
            .chart-placeholder {{
                height: 120px; background: rgba(255,255,255,0.02); border-radius: 8px;
                display: flex; align-items: center; justify-content: center; color: #64748b;
                font-size: 0.8rem;
            }}
            
            /* Clutter Source */
            .clutter-stat {{ display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.8rem; }}
            .clutter-label {{ color: #94a3b8; }}
            .clutter-value {{ color: #f1f5f9; font-weight: 500; }}
            
            /* Storage Bar */
            .storage-bar {{ margin-bottom: 0.75rem; }}
            .storage-label {{ display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.35rem; }}
            .storage-track {{ height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }}
            .storage-fill {{ height: 100%; border-radius: 4px; }}
            .fill-blue {{ background: linear-gradient(90deg, #3b82f6, #60a5fa); }}
            .fill-purple {{ background: linear-gradient(90deg, #8b5cf6, #a78bfa); }}
            .fill-teal {{ background: linear-gradient(90deg, #14b8a6, #2dd4bf); }}
            
            /* Clean Banner */
            .clean-banner {{
                background: linear-gradient(135deg, rgba(20,184,166,0.15), rgba(6,182,212,0.1));
                border: 1px solid rgba(20,184,166,0.3); border-radius: 14px;
                padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; margin-top: 1rem;
            }}
            .banner-icon {{ font-size: 3rem; }}
            .banner-content h3 {{ font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }}
            .banner-content p {{ font-size: 0.85rem; color: #94a3b8; }}
            .banner-btn {{
                background: linear-gradient(135deg, #14b8a6, #0d9488); color: white;
                padding: 0.75rem 1.25rem; border-radius: 8px; border: none;
                font-size: 0.85rem; font-weight: 600; cursor: pointer; white-space: nowrap;
            }}
            
            @media (max-width: 1024px) {{
                .dashboard {{ flex-direction: column; }}
                .side-col {{ max-width: 100%; }}
                .stats-row {{ grid-template-columns: repeat(2, 1fr); }}
                .charts-row {{ grid-template-columns: 1fr; }}
            }}
        </style>
    </head>
    <body>
        <!-- Navbar -->
        <nav class="navbar">
            <div class="nav-logo">
                <img src="__DASH_LOGO__" alt="Logo" style="width:28px; height:28px; border-radius:6px;">
                Inbox Copilot
            </div>
            <div class="nav-tabs">
                <div class="nav-tab">📊 Dashboard</div>
                <div class="nav-tab">🔍 Scan</div>
                <div class="nav-tab active">✨ Insights</div>
                <div class="nav-tab">⚙️ Automation</div>
                <div class="nav-tab">🔧 Settings</div>
            </div>
            <div class="nav-user">
                <div class="user-avatar">{st.session_state.user_email[0].upper()}</div>
                <div class="user-info">
                    <div class="user-email">{st.session_state.user_email}</div>
                    <div class="user-status">● Connected</div>
                </div>
            </div>
        </nav>
        
        <!-- Main Dashboard -->
        <div class="dashboard">
            <!-- Left Column -->
            <div class="main-col">
                <!-- Inbox Health Card -->
                <div class="card">
                    <div class="health-row">
                        <div class="health-left">
                            <div class="card-title">Inbox Health: {inbox_health} <span>/100</span></div>
                            <div class="health-status">
                                <span class="status-dot {'status-green' if inbox_health >= 70 else 'status-yellow'}"></span>
                                {health_status}
                            </div>
                            <p class="health-desc">{health_desc}</p>
                        </div>
                        <div class="health-right">
                            <div class="health-circle">
                                <span class="health-score">{inbox_health}<small>/100</small></span>
                            </div>
                            <div class="health-label">Out of 100</div>
                        </div>
                    </div>
                    
                    <!-- Stats Row -->
                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-value">{total_emails:,}</div>
                            <div class="stat-label">Emails Analyzed</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">{unique_senders}</div>
                            <div class="stat-label">Active Senders</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">{clutter_removed:,}</div>
                            <div class="stat-label">Clutter Removed</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">{mb_saved:.1f} MB</div>
                            <div class="stat-label">Storage Saved</div>
                        </div>
                    </div>
                </div>
                
                <!-- Scan Status -->
                <div class="card">
                    <div class="scan-section">
                        <div class="scan-content">
                            <div class="scan-title">{'✅ Scan Complete' if has_data else '🔍 Ready to Scan'}</div>
                            <div class="scan-desc">{'Found ' + str(unique_senders) + ' senders with ' + str(total_emails) + ' emails. Use controls below to manage.' if has_data else 'Use the scan controls below to analyze your inbox and find clutter.'}</div>
                        </div>
                        <div class="scan-image">{'✨' if has_data else '📧'}</div>
                    </div>
                </div>
                
                <!-- AI Cleanup Suggestions -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">AI Cleanup Suggestions ℹ️</div>
                        <span style="font-size: 0.75rem; color: #14b8a6;">{'SEE ALL' if has_data else ''}</span>
                    </div>
                    {'<div class="suggestion-item"><span class="suggestion-dot dot-blue"></span><span class="suggestion-text">Screen ' + str(total_emails) + ' emails from ' + str(unique_senders) + ' senders</span></div>' if has_data else '<div class="suggestion-item"><span class="suggestion-dot dot-blue"></span><span class="suggestion-text">Run a scan to get suggestions</span></div>'}
                    {'<div class="suggestion-item"><span class="suggestion-dot dot-purple"></span><span class="suggestion-text">' + str(clutter_removed) + ' emails already cleaned</span></div>' if clutter_removed > 0 else '<div class="suggestion-item"><span class="suggestion-dot dot-purple"></span><span class="suggestion-text">No emails cleaned yet</span></div>'}
                    <div class="suggestion-item">
                        <span class="suggestion-dot dot-orange"></span>
                        <span class="suggestion-text">{'Use scan controls below to clean' if has_data else 'Start scanning to identify clutter'}</span>
                    </div>
                </div>
                
                <!-- Charts Row -->
                <div class="charts-row">
                    <div class="card">
                        <div class="card-title" style="margin-bottom: 1rem;">📈 Email Volume Trend</div>
                        <div class="chart-placeholder">
                            <svg width="200" height="80" viewBox="0 0 200 80">
                                <polyline fill="none" stroke="#14b8a6" stroke-width="2" points="0,60 30,50 60,55 90,30 120,35 150,20 180,25 200,15"/>
                                <polyline fill="none" stroke="#3b82f6" stroke-width="2" points="0,70 30,65 60,60 90,55 120,50 150,45 180,40 200,35" stroke-dasharray="5,5"/>
                            </svg>
                        </div>
                        <div style="display: flex; justify-content: space-around; font-size: 0.65rem; color: #64748b; margin-top: 0.5rem;">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-title" style="margin-bottom: 1rem;">📊 Clutter Source</div>
                        <div class="clutter-stat">
                            <span class="clutter-label">• 72 min/week</span>
                            <span class="clutter-value">62 emails</span>
                        </div>
                        <div class="clutter-stat">
                            <span class="clutter-label">• Automated@example.com</span>
                            <span class="clutter-value">30 emails</span>
                        </div>
                        <div class="clutter-stat">
                            <span class="clutter-label">• newsletter@promotions</span>
                            <span class="clutter-value">46 emails</span>
                        </div>
                    </div>
                </div>
                
                <!-- Storage Summary -->
                <div class="card">
                    <div class="card-title" style="margin-bottom: 1rem;">💾 Storage Summary</div>
                    <div class="storage-bar">
                        <div class="storage-label">
                            <span style="color: #94a3b8;">Emails Analyzed</span>
                            <span>{total_emails}</span>
                        </div>
                        <div class="storage-track">
                            <div class="storage-fill fill-blue" style="width: {min(100, total_emails // 10) if has_data else 0}%;"></div>
                        </div>
                    </div>
                    <div class="storage-bar">
                        <div class="storage-label">
                            <span style="color: #94a3b8;">Emails Cleaned</span>
                            <span>{clutter_removed}</span>
                        </div>
                        <div class="storage-track">
                            <div class="storage-fill fill-purple" style="width: {min(100, clutter_removed // 5) if clutter_removed > 0 else 0}%;"></div>
                        </div>
                    </div>
                    <div class="storage-bar">
                        <div class="storage-label">
                            <span style="color: #94a3b8;">Storage Saved</span>
                            <span>{mb_saved:.1f} MB</span>
                        </div>
                        <div class="storage-track">
                            <div class="storage-fill fill-teal" style="width: {min(100, int(mb_saved * 10)) if mb_saved > 0 else 0}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Column -->
            <div class="side-col">
                <!-- Free Plan -->
                <div class="plan-card">
                    <div class="plan-header">
                        <div class="plan-title">{'👑 Premium Plan' if st.session_state.is_premium else '🎁 Free Plan'}</div>
                    </div>
                    <div class="plan-remaining">{'Unlimited emails remaining' if st.session_state.is_premium else f'{max(0, FREE_DELETION_LIMIT - st.session_state.lifetime_deleted):,} emails remaining'}</div>
                    {'<button class="plan-btn">✨ Premium Active</button>' if st.session_state.is_premium else '<button class="plan-btn">Upgrade Plan →</button>'}
                </div>
                
                <!-- Upgrade Plan Details -->
                <div class="card">
                    <div class="card-title" style="margin-bottom: 1rem;">Upgrade Plan</div>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1rem;">Emails that require suggestion action they now allow user scan insights.</p>
                    <div style="font-size: 0.8rem; color: #94a3b8;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="color: #22c55e;">✓</span> 1,100 email/1,000 emails remaining
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="color: #eab308;">⚡</span> 120 Unread
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="color: #f97316;">📢</span> 90 Promotions
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: #3b82f6;">📰</span> 51 Newsletters
                        </div>
                    </div>
                </div>
                
                <!-- Top Sender Clutter -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Top Sender Clutter</div>
                        <span style="font-size: 0.7rem; color: #64748b;">{str(unique_senders) + ' SENDERS' if has_data else 'NO DATA'}</span>
                    </div>
                    {top_senders_html}
                </div>
            </div>
        </div>
        
        <!-- Clean Banner -->
        <div style="padding: 0 1.25rem 1.25rem;">
            <div class="clean-banner">
                <div class="banner-icon">🚀</div>
                <div class="banner-content" style="flex: 1;">
                    <h3>Your inbox looks clean!</h3>
                    <p>You removed {clutter_removed:,} emails and saved {mb_saved:.0f}+ minutes daily.</p>
                </div>
                <button class="banner-btn">Enable Auto Clean →</button>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Replace logo placeholder in dashboard
    logo_data = f"data:image/png;base64,{LOGO_BASE64}" if LOGO_BASE64 else ""
    dashboard_html = dashboard_html.replace("__DASH_LOGO__", logo_data)
    components.html(dashboard_html, height=1400, scrolling=True)
    
    # ===== FUNCTIONAL SCAN & DELETE SECTION =====
    st.markdown("""<div style="padding: 0 1rem;">
        <h3 style="color: #14b8a6 !important; margin: 1rem 0;">🔧 Email Management Controls</h3>
    </div>""", unsafe_allow_html=True)
    
    # Premium Modal
    if st.session_state.show_premium_modal:
        col1, col2 = st.columns(2)
        with col1:
            if st.button("💳 Upgrade Now", type="primary", use_container_width=True):
                st.session_state.is_premium = True
                st.session_state.show_premium_modal = False
                st.success("🎉 Welcome to Premium!")
                time.sleep(1)
                st.rerun()
        with col2:
            if st.button("Maybe Later", use_container_width=True):
                st.session_state.show_premium_modal = False
                st.rerun()
    
    # Scan Controls
    scan_col1, scan_col2, scan_col3 = st.columns([2, 1, 1])
    with scan_col1:
        scan_limit = st.slider("📊 Emails to scan", SCAN_MIN, SCAN_MAX, SCAN_DEFAULT, SCAN_STEP)
    with scan_col2:
        scan_btn = st.button("🚀 Start Scan", type="primary", use_container_width=True)
    with scan_col3:
        if st.button("🚪 Sign Out", use_container_width=True):
            if os.path.exists(TOKEN_FILE): os.remove(TOKEN_FILE)
            st.session_state.clear()
            st.rerun()
    
    if scan_btn:
        progress = st.progress(0)
        status = st.empty()
        def update(p, t):
            progress.progress(p)
            status.caption(t)
        st.session_state.emails_df, st.session_state.sender_data = scan_inbox(service, scan_limit, update)
        st.session_state.scan_complete = True
        progress.empty()
        status.empty()
        st.success(f"✅ Scan complete! Found {len(st.session_state.emails_df)} senders.")
        time.sleep(1)
        st.rerun()
    
    # ===== RESULTS =====
    if df is not None and not df.empty:
        # Category Filter
        st.markdown(f"""
        <div style="display:flex; align-items:center; gap:0.75rem; margin:1.5rem 0 1rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <span style="font-size:1.25rem;">📊</span>
            <span style="font-size:1rem; font-weight:600; color:#f1f5f9;">Results</span>
            <span style="background:rgba(20,184,166,0.15); color:#14b8a6; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:600;">{len(df)} senders</span>
        </div>
        """, unsafe_allow_html=True)
        
        # Filter buttons
        filter_cols = st.columns(9)
        with filter_cols[0]:
            if st.button(f"All ({len(df)})", use_container_width=True, type="primary" if st.session_state.filter_category == 'all' else "secondary"):
                st.session_state.filter_category = 'all'
                st.rerun()
        
        cat_mapping = {'spam': 1, 'shopping': 2, 'social': 3, 'promotions': 4, 'newsletters': 5, 'finance': 6, 'updates': 7, 'unknown': 8}
        for cat, idx in cat_mapping.items():
            cnt = len(df[df['Category'] == cat])
            if cnt > 0:
                with filter_cols[idx]:
                    info = EMAIL_CATEGORIES[cat]
                    if st.button(f"{info['icon']} {cnt}", use_container_width=True, type="primary" if st.session_state.filter_category == cat else "secondary"):
                        st.session_state.filter_category = cat
                        st.rerun()
        
        filtered = df if st.session_state.filter_category == 'all' else df[df['Category'] == st.session_state.filter_category]
        
        # Bulk Actions Bar
        st.markdown("""
        <div style="display:flex; align-items:center; gap:0.75rem; margin:1.5rem 0 1rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.08);">
            <span style="font-size:1.25rem;">⚡</span>
            <span style="font-size:1rem; font-weight:600; color:#f1f5f9;">Quick Actions</span>
        </div>
        """, unsafe_allow_html=True)
        
        ac1, ac2, ac3, ac4 = st.columns([0.8, 2, 1, 0.8])
        with ac1:
            sel_all = st.checkbox("Select All", key="select_all_cb")
            if sel_all:
                st.session_state.selected_senders = filtered['Email'].tolist()
        with ac2:
            sel_cnt = len(st.session_state.selected_senders)
            sel_emails = filtered[filtered['Email'].isin(st.session_state.selected_senders)]['Count'].sum() if sel_cnt > 0 else 0
            st.markdown(f"<div style='padding:0.5rem 0;'><span style='color:#64748b !important;'>Selected:</span> <span style='color:#14b8a6 !important; font-weight:600;'>{sel_cnt} senders</span> <span style='color:#64748b !important;'>({sel_emails:,} emails)</span></div>", unsafe_allow_html=True)
        with ac3:
            remaining_free = max(0, FREE_DELETION_LIMIT - st.session_state.lifetime_deleted)
            can_delete = st.session_state.is_premium or remaining_free > 0
            
            if st.button("🗑️ Delete Selected", disabled=(sel_cnt == 0 or not can_delete), use_container_width=True):
                if not st.session_state.is_premium and sel_emails > remaining_free:
                    st.session_state.show_premium_modal = True
                    st.rerun()
                else:
                    with st.spinner("Deleting emails..."):
                        deleted = 0
                        for email in st.session_state.selected_senders:
                            deleted += delete_emails_from_sender(service, email)
                        st.session_state.total_deleted += deleted
                        st.session_state.lifetime_deleted += deleted
                        st.session_state.emails_df = df[~df['Email'].isin(st.session_state.selected_senders)]
                        st.session_state.selected_senders = []
                    st.success(f"✅ Deleted {deleted} emails!")
                    time.sleep(1)
                    st.rerun()
        with ac4:
            if st.button("Clear", use_container_width=True):
                st.session_state.selected_senders = []
                st.rerun()
        
        # Two-panel layout: Senders List | Email Preview
        if st.session_state.get('modal_open', False) and st.session_state.get('modal_sender'):
            # Split view: Senders on left, Email preview on right
            list_col, preview_col = st.columns([1, 1.2])
        else:
            list_col = st.container()
            preview_col = None
        
        with list_col:
            st.markdown(f"""
            <div style="display:flex; align-items:center; gap:0.75rem; margin:1.5rem 0 1rem; padding-bottom:0.75rem; border-bottom:1px solid rgba(255,255,255,0.08);">
                <span style="font-size:1.25rem;">📬</span>
                <span style="font-size:1rem; font-weight:600; color:#f1f5f9;">Senders</span>
                <span style="background:rgba(20,184,166,0.15); color:#14b8a6; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:600;">{len(filtered)}</span>
            </div>
            """, unsafe_allow_html=True)
            
            # Professional sender list with card style
            for idx, row in filtered.iterrows():
                email = row['Email']
                count = row['Count']
                cat = row['Category']
                cat_info = EMAIL_CATEGORIES[cat]
                size_mb = row['Size KB'] / 1024
                is_sel = email in st.session_state.selected_senders
                is_viewing = st.session_state.get('modal_sender') == email
                
                # Professional card styling
                if is_viewing:
                    card_bg = "linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.08))"
                    border_style = "border-left: 4px solid #14b8a6;"
                elif is_sel:
                    card_bg = "rgba(139,92,246,0.08)"
                    border_style = "border-left: 4px solid #a78bfa;"
                else:
                    card_bg = "rgba(20,35,60,0.95)"
                    border_style = "border-left: 4px solid transparent;"
                
                # Main sender card row
                sender_cols = st.columns([0.3, 3, 1, 1])
                
                with sender_cols[0]:
                    chk = st.checkbox("", value=is_sel, key=f"sel_{email}", label_visibility="collapsed")
                    if chk and email not in st.session_state.selected_senders:
                        st.session_state.selected_senders.append(email)
                    elif not chk and email in st.session_state.selected_senders:
                        st.session_state.selected_senders.remove(email)
                
                with sender_cols[1]:
                    st.markdown(f"""
                    <div style="background:{card_bg}; {border_style} padding:0.75rem 1rem; border-radius:0 8px 8px 0; margin:0.15rem 0; border:1px solid rgba(255,255,255,0.08);">
                        <div style="font-weight:600; color:#f1f5f9 !important; font-size:0.9rem; margin-bottom:0.25rem;">
                            {cat_info['icon']} {email}
                        </div>
                        <div style="display:flex; gap:1rem; align-items:center;">
                            <span style="color:#f97316 !important; font-weight:600; font-size:0.8rem;">{count} emails</span>
                            <span style="color:#64748b !important; font-size:0.75rem;">•</span>
                            <span style="color:#64748b !important; font-size:0.75rem;">{size_mb:.1f}MB</span>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                
                with sender_cols[2]:
                    if st.button("👁 View", key=f"view_{email}", use_container_width=True):
                        st.session_state.modal_open = True
                        st.session_state.modal_sender = email
                        st.session_state.modal_emails = row['Emails']
                        st.session_state.modal_size = row['Size KB']
                        st.session_state.modal_category = cat_info
                        st.rerun()
                
                with sender_cols[3]:
                    remaining = max(0, FREE_DELETION_LIMIT - st.session_state.lifetime_deleted)
                    can_del = st.session_state.is_premium or remaining >= count
                    if st.button("🗑 Delete", key=f"del_{email}", use_container_width=True, disabled=not can_del):
                        if not st.session_state.is_premium and count > remaining:
                            st.session_state.show_premium_modal = True
                            st.rerun()
                        else:
                            with st.spinner("Deleting..."):
                                deleted = delete_emails_from_sender(service, email)
                                st.session_state.total_deleted += deleted
                                st.session_state.lifetime_deleted += deleted
                                st.session_state.emails_df = df[df['Email'] != email]
                            st.rerun()
        
        # Email Preview Panel (right side) - Professional Design
        if preview_col:
            with preview_col:
                sender = st.session_state.modal_sender
                emails = st.session_state.modal_emails
                size_kb = st.session_state.get('modal_size', 0)
                cat_info = st.session_state.get('modal_category', EMAIL_CATEGORIES['unknown'])
                
                # Professional Preview Header Card
                st.markdown(f"""
                <div style="background:linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.08)); 
                            border:1px solid rgba(20,184,166,0.3); border-radius:12px; 
                            padding:1rem 1.25rem; margin-bottom:1rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
                        <span style="font-size:1.5rem;">{cat_info['icon']}</span>
                        <div style="flex:1;">
                            <div style="font-weight:700; color:#f1f5f9 !important; font-size:1rem;">{sender}</div>
                            <div style="color:#94a3b8 !important; font-size:0.8rem;">{len(emails)} emails • {size_kb/1024:.2f} MB</div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                # Export & Close buttons row
                export_text = generate_email_text(emails, sender)
                csv_data = "Subject,Date,Preview\n"
                for em in emails:
                    subj = em.get('subject', '').replace('"', '""')
                    date_str = em.get('date', '')
                    snip = em.get('snippet', '').replace('"', '""').replace('\n', ' ')
                    csv_data += f'"{subj}","{date_str}","{snip}"\n'
                
                btn_cols = st.columns([1, 1, 1])
                with btn_cols[0]:
                    st.download_button("📄 TXT", export_text, f"emails_{sender.replace('@','_')}_{datetime.now().strftime('%Y%m%d')}.txt", "text/plain", key="dl_txt", use_container_width=True)
                with btn_cols[1]:
                    st.download_button("📊 CSV", csv_data, f"emails_{sender.replace('@','_')}_{datetime.now().strftime('%Y%m%d')}.csv", "text/csv", key="dl_csv", use_container_width=True)
                with btn_cols[2]:
                    if st.button("✕ Close", key="close_preview", use_container_width=True):
                        st.session_state.modal_open = False
                        st.session_state.modal_sender = None
                        st.rerun()
                
                # Email list with professional cards
                st.markdown(f"<div style='margin-top:1rem;'>", unsafe_allow_html=True)
                for em in emails:
                    import html as html_lib
                    subject = html_lib.escape(em.get('subject', '(No Subject)'))
                    snippet = html_lib.escape(em.get('snippet', ''))[:200]
                    date = em.get('date', 'Unknown')
                    
                    # Email card with professional styling
                    st.markdown(f"""
                    <div style="background:rgba(20,35,60,0.95); border:1px solid rgba(255,255,255,0.08); 
                                border-radius:10px; padding:1rem; margin-bottom:0.75rem;
                                transition: all 0.2s ease;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.5rem;">
                            <div style="font-weight:600; color:#f1f5f9 !important; font-size:0.9rem; flex:1; line-height:1.4;">{subject}</div>
                            <div style="background:rgba(20,184,166,0.15); color:#14b8a6 !important; 
                                        font-size:0.7rem; padding:0.25rem 0.5rem; border-radius:4px; 
                                        white-space:nowrap;">📅 {date}</div>
                        </div>
                        <div style="color:#94a3b8 !important; font-size:0.8rem; line-height:1.5;">
                            {snippet if snippet else '<span style="font-style:italic; opacity:0.6;">No preview available</span>'}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                st.markdown("</div>", unsafe_allow_html=True)
    
    elif st.session_state.scan_complete:
        st.info("✨ Your inbox is squeaky clean! No bulk senders found.")
    else:
        st.markdown("""
        <div class="empty-state">
            <div class="empty-icon">📬</div>
            <div class="empty-title">Ready to Clean Your Inbox?</div>
            <div class="empty-desc">Click "Start Deep Scan" above to analyze your emails and find clutter.</div>
        </div>
        """, unsafe_allow_html=True)
    


# ==================== MAIN ====================
def main():
    init_session_state()
    
    # Handle OAuth callback - check for 'code' in URL (compatible with multiple Streamlit versions)
    try:
        # Streamlit 1.30+
        query_params = dict(st.query_params)
        auth_code = query_params.get('code')
    except:
        # Older Streamlit versions
        query_params = st.experimental_get_query_params()
        auth_code = query_params.get('code', [None])[0]
    
    if auth_code and not st.session_state.authenticated:
        # Exchange code for tokens
        with st.spinner("Completing authentication..."):
            creds = exchange_code_for_tokens(auth_code)
            if creds:
                st.session_state.creds = creds
                st.session_state.authenticated = True
                # Clear the URL parameters
                try:
                    st.query_params.clear()
                except:
                    st.experimental_set_query_params()
                st.rerun()
            else:
                st.error("Authentication failed. Please try again.")
                try:
                    st.query_params.clear()
                except:
                    st.experimental_set_query_params()
    
    if st.session_state.authenticated and st.session_state.creds:
        render_dashboard()
    else:
        render_landing_page()

if __name__ == "__main__":
    main()
