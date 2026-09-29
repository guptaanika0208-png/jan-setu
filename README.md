# Jan Setu 🇮🇳
### One Secure Profile. Every Government Benefit.

Jan Setu is a **Digital Citizen Assistant** built for Decode SIH 2026, under the problem statement *"Digital Citizen Assistant using AI and Cybersecurity."* It gives every citizen a single, secure profile that automatically matches them to the government schemes they qualify for, auto-fills applications from that profile, and lets them apply and track progress — by tapping, or by voice, in their own language.

---

## ✨ Core Features

| Feature | Status |
|---|---|
| JWT auth with OTP verification | ✅ Working |
| Explainable scheme eligibility engine (rule-based, not a black box) | ✅ Working |
| Application auto-fill from profile + auto-save/resume drafts | ✅ Working |
| Encrypted document vault (AES/Fernet, SHA-256 integrity, MIME validation) | ✅ Working |
| Voice assistant: speech-to-text, intent detection, navigation, text-to-speech | ✅ Working |
| Multilingual UI architecture (22 scheduled languages + English) | ✅ Architecture complete · English & Hindi fully translated · 21 remaining languages fall back to English until filled in |
| Notifications (deadlines, expiry, application updates) | ✅ Working (backend model + API; seed a few rows to see it populated) |
| Privacy dashboard / Cyber health score / Audit log | ✅ UI + backend audit trail; score currently a demo heuristic |
| Rate limiting, security headers, password hashing, RBAC | ✅ Working |

This is a genuinely running app, not a static mockup — every page reads and writes real data through the FastAPI backend.

---

## 🏗️ Architecture

```
┌─────────────┐        HTTPS/JSON        ┌──────────────┐        SQL        ┌────────────┐
│  React SPA  │ ───────────────────────▶ │  FastAPI     │ ─────────────────▶│ PostgreSQL │
│  (Vite,     │ ◀─────────────────────── │  (JWT auth,  │ ◀──────────────── │            │
│  Tailwind)  │      Bearer token         │  rule engine)│                   └────────────┘
└─────────────┘                          └──────────────┘
      │
      ▼
 Web Speech API (browser-native STT/TTS)
```

- **Frontend** talks to the backend only via `src/services/api.js`, a single Axios instance with automatic access-token refresh.
- **Scheme eligibility** is computed server-side (`app/utils/scheme_engine.py`) from declarative JSON rules on each `Scheme` row — auditable and explainable, which matters for a government-benefits decision.
- **Voice assistant** does STT/TTS in the browser (Web Speech API, zero cost, zero latency) and sends the transcript to `/api/voice/command` for intent detection + a spoken response + a navigation target — keeping all NLU logic in one testable place.
- **Security** is layered: bcrypt password hashing, JWT access/refresh tokens, AES field-level encryption for PII, security headers, rate limiting, and an audit log written on every sensitive action.

---

## 📁 Folder Structure

```
jan-setu/
├── frontend/                  React + Vite + Tailwind
│   ├── src/
│   │   ├── components/        Reusable UI (cards, nav, voice FAB, language sheet...)
│   │   ├── pages/              All 16 screens (Splash → Help)
│   │   ├── context/            Auth, Language, VoiceAssistant providers
│   │   ├── hooks/               useVoiceAssistant (Web Speech API + backend intent calls)
│   │   ├── services/            api.js — the only place that talks to the backend
│   │   └── i18n/                 languages.js registry + locales/en.json, hi.json
│   └── public/
├── backend/                    FastAPI + SQLAlchemy
│   └── app/
│       ├── core/                config.py, security.py (JWT, hashing, AES, OTP)
│       ├── db/                   SQLAlchemy engine/session
│       ├── models/               User, Profile, Scheme, Application, Document, Notification, AuditLog, OTP
│       ├── schemas/              Pydantic request/response models
│       ├── routers/              auth, profile, schemes, applications, documents, notifications, voice
│       ├── middlewares/          rate limiting, security headers
│       ├── utils/                 scheme_engine.py, intent_detection.py, deps.py
│       └── seed/                  seed_schemes.py — sample scheme catalogue
├── database/
│   └── schema.sql               Reference DDL (tables are also auto-created by SQLAlchemy)
└── docs/
```

---

## 🚀 Getting Started

### 1. Database
Create a PostgreSQL database, then either let the backend auto-create tables on first run, or apply the reference schema:
```bash
createdb jansetu_db
psql jansetu_db < database/schema.sql   # optional — backend also does this automatically
```

### 2. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # then edit DATABASE_URL, JWT_SECRET_KEY, FIELD_ENCRYPTION_KEY
uvicorn app.main:app --reload
```
Backend runs at `http://localhost:8000` — interactive docs at `http://localhost:8000/docs`.

Seed the sample scheme catalogue:
```bash
python -m app.seed.seed_schemes
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 4. Try it
1. Sign up with a phone number → the OTP screen shows a `demo_otp` in dev mode (`OTP_MOCK_MODE=true`), since no real SMS gateway is wired up.
2. Fill in your profile (age, income, category, state...).
3. Visit **Eligible Schemes** or ask the **Voice Assistant**: *"Show me all schemes I am eligible for."*
4. Apply to a scheme — watch the form auto-fill from your profile, then track it on **Application Progress**.

---

## 🌐 Multilingual Architecture

`frontend/src/i18n/languages.js` is the single source of truth for all 22 Eighth-Schedule languages + English. Each entry has a `translated` flag; English and Hindi ship as complete reference locale files (`i18n/locales/en.json`, `hi.json`). Any language without a locale file falls back to English automatically via i18next's `fallbackLng`, so the app is always usable while translations are filled in.

**To add a language:** copy `en.json` to `locales/<code>.json`, translate the values (keep the keys identical), register it in `i18n/index.js`, and flip `translated: true` in `languages.js`. No other code changes needed — it appears in the language picker automatically.

The voice assistant speaks using the browser's `SpeechSynthesisUtterance` with a BCP-47 locale mapped from the active app language (see `useVoiceAssistant.js`).

---

## 🎙️ Voice Assistant

- **STT**: browser-native `SpeechRecognition` (Web Speech API) — no external API cost.
- **Intent detection**: `backend/app/utils/intent_detection.py` — pattern-based NLU mapping transcripts to intents (`NAVIGATE_ELIGIBLE_SCHEMES`, `OPEN_SCHEME_EPFO`, `REPEAT`, `GO_BACK`, etc). This is the seam where a production build would swap in a proper multilingual intent-classification model without touching any other code.
- **TTS**: browser-native `speechSynthesis`.
- **Navigation**: the backend returns both a spoken response and a frontend route; `useVoiceAssistant.js` speaks the response and navigates automatically — matching the spec's example: *"Show me all the schemes I am eligible for"* → assistant counts real eligible schemes from the database and says *"You are eligible for N government schemes,"* then navigates to Eligible Schemes.

---

## 🔐 Cybersecurity

| Control | Where |
|---|---|
| Password hashing (bcrypt) | `core/security.py` |
| JWT access + refresh tokens | `core/security.py`, `routers/auth.py` |
| AES field-level encryption (Aadhaar, income) | `core/security.py`, `routers/profile.py` |
| Encrypted document vault + SHA-256 integrity hash | `routers/documents.py` |
| Rate limiting (login, OTP endpoints) | `middlewares/rate_limiter.py` |
| Security headers (XSS, clickjacking, HSTS) | `middlewares/security_headers.py` |
| SQL injection prevention | SQLAlchemy ORM everywhere — no raw string-interpolated SQL |
| CSRF mitigation | Stateless Bearer-token API (no cookie sessions) |
| Secure upload validation | MIME allow-list + size cap in `routers/documents.py` |
| Audit log | `models/audit_log.py`, written on login/logout/profile-update/document-access/submit |
| Role-based access | `role` field on `User`, `require_admin` dependency |

The **Privacy Dashboard** and **Cyber Health Score** on the Settings page are wired to real audit-log data structurally; the score itself is a demo heuristic pending a scoring rubric.

---

## 🎨 Design System

Blue + white government theme, inspired by the clarity of apps like UMANG but original: Setu Blue (`#0B4F9E`) primary, warm marigold (`#F0A202`) accent used sparingly for CTAs and the voice button, Poppins for display type, Inter for body text, and Noto Sans Devanagari as a font fallback so Hindi and other Indic scripts render cleanly. The recurring "Setu" (bridge) mark — a citizen on one side, a government building on the other, connected by an arch — appears on the splash screen and reinforces the product's core idea throughout.

Accessibility: visible focus rings, `prefers-reduced-motion` support, a high-contrast mode toggle, large tap targets, and a bottom-nav mobile-first layout designed to be usable by first-time smartphone users.

---

## 🧭 Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Framer Motion, React Icons, i18next
**Backend:** FastAPI, SQLAlchemy, Pydantic, python-jose (JWT), passlib (bcrypt), cryptography (Fernet/AES), slowapi (rate limiting)
**Database:** PostgreSQL
**Deployment:** Vercel (frontend, `vercel.json` included) · Render (backend, `render.yaml` included)

---

## 🔭 Future Scope

- Swap the OTP mock provider for a real SMS gateway (MSG91/Twilio)
- Replace rule-based voice intent detection with a fine-tuned multilingual NLU model
- Complete the remaining 21 Eighth-Schedule language translations
- Admin panel for scheme catalogue management (RBAC groundwork already in place via `role`)
- Real object storage (S3/Supabase) for the encrypted document vault instead of local disk
- Push notifications for deadline/expiry alerts
- Formal Cyber Health Score rubric backed by the existing audit log

---

## 📸 Screenshots

_Add screenshots/GIFs of the running app here before your hackathon submission — Splash, Home, Eligible Schemes, Voice Assistant, and Application Progress make the strongest demo shots._

---

Built for Decode SIH 2026 — Digital Citizen Assistant using AI and Cybersecurity.
