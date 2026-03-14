import { sum } from "react-three-fiber/dist/declarations/src/core/utils";

export const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface EmailData {
  id: string;
  subject: string;
  snippet: string;
  date: string;
  timestamp: number | null;
}

export interface SenderData {
  email: string;
  count: number;
  fullName: string;
  category: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  dateRange: string;
  emails: EmailData[];
  oldest: number | null;
  newest: number | null;
}

export const EMAIL_CATEGORIES: Record<string, { name: string; color: string; icon: string; keywords: string[] }> = {
  'shopping': {
      name: '🛍️ Shopping', color: '#FF6B6B', icon: '🛒',
      keywords: ['amazon', 'flipkart', 'zepto', 'myntra', 'ajio', 'nykaa', 'snapdeal', 'ebay', 'aliexpress']
  },
  'social': {
      name: '👥 Social', color: '#4ECDC4', icon: '👤',
      keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'whatsapp', 'telegram', 'discord', 'reddit']
  },
  'promotions': {
      name: '🎯 Promotions', color: '#FFD166', icon: '🔥',
      keywords: ['offer', 'deal', 'discount', 'sale', 'promo', 'coupon', 'flash', 'bargain']
  },
  'newsletters': {
      name: '📰 Newsletters', color: '#06D6A0', icon: '📨',
      keywords: ['newsletter', 'digest', 'weekly', 'daily', 'update', 'subscribe', 'unsubscribe']
  },
  'finance': {
      name: '💰 Finance', color: '#118AB2', icon: '💳',
      keywords: ['bank', 'paytm', 'phonepe', 'gpay', 'upi', 'credit', 'loan', 'investment', 'statement']
  },
  'updates': {
      name: '📢 Updates', color: '#9D4EDD', icon: '📢',
      keywords: ['alert', 'notification', 'reminder', 'confirm', 'verification'] // 'update' removed to prevent false positives
  },
  'unknown': {
      name: '❓ Unknown', color: '#6C757D', icon: '❓',
      keywords: []
  }
};

const getEmailAddress = (headerValue: string) => {
  if (!headerValue) return "Unknown";
  const match = headerValue.match(/<(.+?)>/);
  return match ? match[1].toLowerCase() : headerValue.toLowerCase();
};

const categorizeSender = (email: string, subject: string = "") => {
  const emailLower = email.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  for (const [category, info] of Object.entries(EMAIL_CATEGORIES)) {
      if (category === 'unknown') continue;
      for (const keyword of info.keywords) {
          if (emailLower.includes(keyword) || subjectLower.includes(keyword)) {
              return { id: category, ...info };
          }
      }
  }
  return { id: 'unknown', ...EMAIL_CATEGORIES['unknown'] };
};

// --- API ACTIONS ---

export async function getUserProfile(token: string) {
  try {
    const res = await fetch(`${GMAIL_API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to get profile", error);
    return null;
  }
}

export async function scanInbox(token: string, limit: number, onProgress: (progress: number, label: string) => void): Promise<SenderData[]> {
  const messages: any[] = [];
  let pageToken: string | null = null;
  
  onProgress(0.1, "Fetching message IDs...");

  // 1. Paginated Fetching
  while (messages.length < limit) {
    const remaining = limit - messages.length;
    let url = `${GMAIL_API_BASE}/messages?maxResults=${Math.min(500, remaining)}&q=in:inbox`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to list emails. Check permissions.");
    
    const data = await res.json();
    if (data.messages) {
      messages.push(...data.messages);
    }
    
    const progress = Math.min(messages.length / limit, 1.0) * 0.4; // First 40% of progress
    onProgress(progress, `Found ${messages.length} messages...`);

    pageToken = data.nextPageToken;
    if (!pageToken || messages.length >= limit) break;
  }

  // Trim to exact limit
  messages.splice(limit);
  if (messages.length === 0) return [];

  const senderMap = new Map<string, any>();
  let processed = 0;

  onProgress(0.5, "Downloading metadata...");

  // 2. Fetch metadata in chunks (to simulate Python's batch HTTP client, JS Promise.all with chunking is best)
  const CHUNK_SIZE = 50; 
  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (msg) => {
      try {
        const msgRes = await fetch(`${GMAIL_API_BASE}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];
        
        let fromEmail = "";
        let subject = "";
        
        for (const h of headers) {
          if (h.name === 'From') fromEmail = h.value;
          if (h.name === 'Subject') subject = h.value;
        }

        if (fromEmail) {
          const email = getEmailAddress(fromEmail);
          const date = msgData.internalDate ? parseInt(msgData.internalDate) : null;
          
          if (!senderMap.has(email)) {
            senderMap.set(email, {
              fullName: fromEmail,
              emails: [],
              count: 0
            });
          }

          const sender = senderMap.get(email);
          sender.count += 1;
          sender.emails.push({
             id: msgData.id,
             subject: subject || "(No Subject)",
             snippet: msgData.snippet ? msgData.snippet.substring(0, 150) + "..." : "",
             date: date ? new Date(date).toLocaleDateString() : "Unknown",
             timestamp: date
          });
        }
      } catch (e) {
        console.error("Err fetching msg", msg.id, e);
      }
    }));

    processed += chunk.length;
    const progress = 0.5 + Math.min(processed / messages.length, 1.0) * 0.5; // Last 50%
    onProgress(progress, `Analyzing ${processed} of ${messages.length}...`);
  }

  // 3. Transform Map into SenderData array and sort by count
  const results: SenderData[] = [];
  
  senderMap.forEach((data, email) => {
    // Only process senders that exist
    const firstSubject = data.emails.length > 0 ? data.emails[0].subject : "";
    const cat = categorizeSender(email, firstSubject);
    
    // Dates
    const validDates = data.emails.map((e: any) => e.timestamp).filter((t: any) => t !== null);
    let oldest = null;
    let newest = null;
    let dateRange = "Unknown";
    
    if (validDates.length > 0) {
       oldest = Math.min(...validDates);
       newest = Math.max(...validDates);
       dateRange = `${new Date(oldest).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})} - ${new Date(newest).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}`;
    }

    results.push({
      email,
      count: data.count,
      fullName: data.fullName,
      category: cat.id,
      categoryName: cat.name,
      categoryColor: cat.color,
      categoryIcon: cat.icon,
      dateRange,
      emails: data.emails,
      oldest,
      newest
    });
  });

  return results.sort((a, b) => b.count - a.count);
}


export async function deleteSpecificEmails(token: string, emailIds: string[]): Promise<number> {
  if (!emailIds || emailIds.length === 0) return 0;

  let totalDeleted = 0;
  const CHUNK_SIZE = 1000;
  
  for (let i = 0; i < emailIds.length; i += CHUNK_SIZE) {
    const chunk = emailIds.slice(i, i + CHUNK_SIZE);
    try {
      await fetch(`${GMAIL_API_BASE}/messages/batchDelete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: chunk })
      });
      totalDeleted += chunk.length;
    } catch (e) {
      console.error("Error batch deleting emails", e);
    }
  }

  return totalDeleted;
}

export async function blockAndPurge(token: string, emailAddress: string): Promise<number> {
  // 1. Create Filter to auto-trash future emails
  try {
     const filterBody = {
       criteria: { from: emailAddress },
       action: { removeLabelIds: ['INBOX'], addLabelIds: ['TRASH'] }
     };
     
     await fetch(`${GMAIL_API_BASE}/settings/filters`, {
       method: 'POST',
       headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
       },
       body: JSON.stringify(filterBody)
     });
  } catch(e) {
     console.warn(`Could not create block filter for ${emailAddress}:`, e);
  }

  // 2. Find all existing emails
  let allIds: string[] = [];
  try {
    let pageToken: string | null = null;
    do {
      let url = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(`from:${emailAddress}`)}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      
      if (data.messages) {
        allIds.push(...data.messages.map((m: any) => m.id));
      }
      pageToken = data.nextPageToken;
    } while(pageToken);
    
  } catch (e) {
     console.error(`Error finding emails for ${emailAddress}`, e);
  }

  // 3. Batch delete them
  if (allIds.length > 0) {
    return await deleteSpecificEmails(token, allIds);
  }
  
  return 0;
}
