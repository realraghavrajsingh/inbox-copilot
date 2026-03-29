# 🚀 Inbox Copilot

AI-Powered Email Management Platform - Clean your inbox intelligently.

![Inbox Copilot](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🏗️ Architecture

This project follows a modern **separated frontend/backend architecture**:

```
inbox-copilot/
├── frontend/          # Next.js + React + Tailwind CSS
│   ├── src/
│   │   ├── app/       # Pages (App Router)
│   │   ├── components/# Reusable UI components
│   │   └── lib/       # API client, utilities
│   └── package.json
│
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── models/    # Pydantic schemas
│   │   └── core/      # Config, settings
│   └── requirements.txt
│
├── docker-compose.yml # Local development setup
├── inbox_copilot.py   # Legacy Streamlit app (still works!)
└── README.md
```

## ✨ Features

- **🔍 Smart Email Scanning** - Analyze up to 25,000 emails
- **📊 Inbox Health Score** - Visual health metrics
- **🏷️ AI Categorization** - Auto-categorize spam, promos, newsletters
- **🗑️ Bulk Delete** - Clean up emails by sender
- **📥 Export** - Download emails as TXT or CSV
- **🔒 Secure** - Google OAuth 2.0, no passwords stored
- **💎 Freemium** - 1,000 free deletions, then upgrade

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/realraghavrajsingh/inbox-copilot.git
cd inbox-copilot

# 2. Create .env file with your Google credentials
cp .env.example .env
# Edit .env with your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

# 3. Start the services
docker-compose up --build

# 4. Open http://localhost:3000
```

### Option 2: Manual Setup

#### Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GOOGLE_CLIENT_ID=your_client_id
export GOOGLE_CLIENT_SECRET=your_client_secret

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Run the development server
npm run dev

# Open http://localhost:3000
```

### Option 3: Legacy Streamlit App

The original Streamlit app is still available:

```bash
# Install dependencies
pip install -r requirements.txt

# Run Streamlit
streamlit run inbox_copilot.py
```

## 🔧 API Endpoints

### Authentication
- `GET /auth/login` - Get Google OAuth URL
- `POST /auth/token` - Exchange code for tokens
- `GET /auth/profile` - Get user profile

### Emails
- `POST /emails/scan` - Scan inbox
- `POST /emails/delete` - Delete emails from senders
- `GET /emails/health` - Get inbox health score
- `GET /emails/export/txt` - Export as text
- `GET /emails/export/csv` - Export as CSV

### User
- `GET /user/quota` - Get deletion quota
- `POST /user/quota/add` - Update quota after deletion
- `POST /user/premium/activate` - Activate premium

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
vercel --prod
```

### Backend → Google Cloud Run

```bash
cd backend
gcloud run deploy inbox-copilot-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLIENT_ID=...,GOOGLE_CLIENT_SECRET=..."
```

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `FRONTEND_URL` | Frontend URL (for CORS) |
| `BACKEND_URL` | Backend URL (for redirects) |
| `NEXT_PUBLIC_API_URL` | API URL for frontend |

## 🔒 Security

- OAuth 2.0 authentication (no passwords)
- Tokens stored in localStorage (use httpOnly cookies in production)
- CORS configured for frontend domain
- Rate limiting recommended for production

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

Made with ❤️ for a cleaner inbox.
