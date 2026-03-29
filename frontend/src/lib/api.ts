/**
 * API Client for Inbox Copilot Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface UserProfile {
  email: string;
  name?: string;
  picture?: string;
}

export interface SenderInfo {
  email: string;
  full_name: string;
  count: number;
  category: string;
  category_info: {
    name: string;
    color: string;
    icon: string;
  };
  date_range: string;
  spam_score: number;
  size_kb: number;
  emails: EmailPreview[];
}

export interface EmailPreview {
  id: string;
  subject: string;
  snippet: string;
  date: string;
}

export interface ScanResponse {
  success: boolean;
  total_senders: number;
  total_emails: number;
  senders: SenderInfo[];
  scan_time_seconds: number;
}

export interface InboxHealth {
  score: number;
  status: string;
  emails_analyzed: number;
  active_senders: number;
  clutter_removed: number;
  storage_saved_mb: number;
}

export interface UserQuota {
  lifetime_deleted: number;
  free_limit: number;
  remaining: number;
  is_premium: boolean;
  quota_percent: number;
}

// API Client class
class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  setTokens(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
    }
  }

  loadTokens() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
    return !!this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    if (this.refreshToken) {
      headers['X-Refresh-Token'] = this.refreshToken;
    }
    return headers;
  }

  // Auth endpoints
  async getAuthUrl(): Promise<string> {
    const res = await fetch(`${API_URL}/auth/login`);
    const data = await res.json();
    return data.auth_url;
  }

  async exchangeToken(code: string, redirectUri: string): Promise<{ access_token: string; refresh_token?: string }> {
    const res = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });
    return res.json();
  }

  async getProfile(): Promise<UserProfile | null> {
    if (!this.accessToken) return null;
    const res = await fetch(`${API_URL}/auth/profile?access_token=${this.accessToken}`);
    if (!res.ok) return null;
    return res.json();
  }

  // Email endpoints
  async scanInbox(limit: number = 1000): Promise<ScanResponse> {
    const res = await fetch(`${API_URL}/emails/scan`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ limit }),
    });
    return res.json();
  }

  async deleteEmails(senderEmails: string[]): Promise<{ success: boolean; deleted_count: number; message: string }> {
    const res = await fetch(`${API_URL}/emails/delete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ sender_emails: senderEmails }),
    });
    return res.json();
  }

  async getInboxHealth(limit: number = 1000): Promise<InboxHealth> {
    const res = await fetch(`${API_URL}/emails/health?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // User endpoints
  async getQuota(email: string): Promise<UserQuota> {
    const res = await fetch(`${API_URL}/user/quota?user_email=${encodeURIComponent(email)}`);
    return res.json();
  }

  async updateQuota(email: string, deletedCount: number): Promise<void> {
    await fetch(`${API_URL}/user/quota/add?user_email=${encodeURIComponent(email)}&deleted_count=${deletedCount}`, {
      method: 'POST',
    });
  }

  async activatePremium(email: string): Promise<void> {
    await fetch(`${API_URL}/user/premium/activate?user_email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
export default api;
