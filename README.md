# MarketPulse AI

AI-Powered Marketing Decision Intelligence Platform. Predicts campaign ROI, CAC,
revenue, conversion rate, and success probability using models trained on your
own historical campaign data, with Gemini-powered explainability, an AI copilot,
a scenario simulator, a budget optimizer, and PDF reporting.

```
marketpulse-ai/
├── frontend/   Next.js 15 App Router + TypeScript + Tailwind + shadcn-style UI
└── backend/    FastAPI + SQLAlchemy + scikit-learn + Gemini
```

---

## 1. Prerequisites

- Node.js 18+
- Python 3.11+
- A PostgreSQL database (Neon recommended: https://neon.tech)
- A Clerk application (https://clerk.com) — for auth
- A Google Gemini API key (https://aistudio.google.com/apikey)

## 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # fill in DATABASE_URL, CLERK_*, GEMINI_API_KEY

# Create tables, seed demo campaigns, train the ML models
python -c "from database.db import Base, engine; Base.metadata.create_all(bind=engine)"
python -m utils.seed_data
python -m ml.train

# Optional: generate a larger synthetic dataset for better model stability
python -m utils.seed_data 100

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Interactive docs at `/docs`.

### Clerk JWKS / issuer values
In your Clerk dashboard: Configure → API Keys gives you the publishable/secret
keys. Your JWKS URL and issuer are `https://<your-clerk-domain>/.well-known/jwks.json`
and `https://<your-clerk-domain>` respectively (found under **Configure → Domains**).

### Database migrations (Alembic)
The app auto-creates tables on startup for convenience. For real migrations:
```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local      # fill in Clerk publishable key + NEXT_PUBLIC_API_URL
npm run dev
```

Frontend runs at `http://localhost:3000`.

## 4. Retraining the model

Models retrain automatically after every CSV upload. To retrain manually:
```bash
cd backend
python -m ml.train
```

---

## 5. Deployment

### Frontend → Vercel
1. Push `frontend/` to a Git repo (or the whole monorepo, setting the Vercel
   project root directory to `frontend`).
2. Import the project in Vercel, set environment variables from
   `frontend/.env.example`.
3. `vercel.json` is already configured.

### Backend → Railway
1. Push `backend/` (or set root directory to `backend` in Railway).
2. Add a PostgreSQL plugin, or point `DATABASE_URL` at your Neon instance.
3. Set env vars from `backend/.env.example` in the Railway dashboard.
4. `railway.json` + `Procfile` are already configured — the release step
   seeds data and trains the model automatically on first deploy.

### Database → Neon
1. Create a Neon project, copy the pooled connection string into
   `DATABASE_URL` (both locally and in Railway).

---

## 6. What's implemented vs. what you still need to verify

**Implemented and functional:**
- All 8 SQLAlchemy models, seed script for 30 campaigns, Alembic scaffold
- RandomForestRegressor (ROI/CAC/Revenue/Conversion Rate) + RandomForestClassifier
  (Success), trained from live DB data, persisted with `joblib`
- Explainable AI via Gemini on every prediction (never returns numbers alone)
- AI Copilot chat grounded in live campaign data
- CSV upload pipeline: validate → store → retrain → ready, with status shown in UI
- Budget optimizer (ROI-weighted allocation across 4 platforms)
- PDF report generation (ReportLab) with AI-written executive summaries
- Clerk auth (frontend components + backend JWT verification), role-based
  authorization on the backend (`require_role`), default role = Analyst
- Landing page (hero, problem, how-it-works, features, preview, testimonials,
  FAQ, pricing, footer), dashboard (KPIs + charts), campaigns list/detail with
  industry benchmarks, prediction page, scenario simulator, reports page

**You should still do before calling this production-ready:**
- Run `npm run build` and `pip`-install to catch any environment-specific
  compile errors — this was hand-written, not build-verified in this session
- Wire actual RBAC UI gating on the frontend (e.g. hide "Upload"/"Optimizer"
  from Analyst role if you want stricter separation — backend already supports
  `require_role()` per endpoint if you add it to routes that should be
  Admin/Manager-only)
- Add automated tests (none are included)
- Review Gemini prompt outputs for your specific industries/tone
- Add rate limiting / request validation hardening for a public deployment
- Set up proper secrets management in Vercel/Railway rather than `.env` files
