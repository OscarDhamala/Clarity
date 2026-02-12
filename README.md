
"CLARITY", a full-stack personal finance tracker that keeps income, expenses, AI-assisted categorization, and visual insights in one place.

1. STACK CHOICES: 
  - Backend: Node.js + Express + MongoDB (Mongoose) for rapid REST APIs with flexible schema evolution.
  - Frontend: React + TypeScript + CRA for type-safe UI iteration, React Router for navigation, Axios for API calls.
  - AI Service: Google Generative AI (Gemini) to convert natural language prompts into structured transactions.

Why this approach?? We needed fast iteration with a single-language (TypeScript/JavaScript) codebase, easy deployment targets, and first-class JSON handling. Express/Mongo fits the CRUD/API needs; React + TS keeps UI predictable and safer for larger codebases; Gemini brings differentiating functionality without building a custom NLP model.


2. Timeline of Major Steps

    A. Launching app in Terminal (`npm run dev`, `npm run client`, combined tasks) and environment setup instructions.
    B. Implement backend modules (DB connection, auth, transactions, AI service, middleware).
    C. Implemention of CRUD functionality and JWT Authentication.
    D. Integrate Gemini AI for auto categorization.
    E. Harden security (password policy mirrored server-side, auth middleware) and UX details (loading states, error messages, placeholders).
    F. Documentation (README, notes on Gemini limits, etc.).


3. Backend Deep Dive
    3.1 server.js
    - Boots Express, loads `.env`, connects Mongo via `connectDB`, configures `cors`, `express.json`, `morgan`, and registers route modules.
   
    Why this approach? Keeps entry point minimal and declarative. Middleware order is explicit and testable.

    3.2 config/db.js
    - Wraps Mongoose connection with validation (fails fast if `MONGO_URI` missing), logs helpful messages.
    
    Why? Clear failure mode prevents the server from running in an invalid state.

    3.3 middleware/authMiddleware.js
    - Extracts Bearer token, verifies JWT, attaches `req.user`. Returns precise 401 messages.

    Why? Central guard so every protected route stays simple.

    3.4 models/User.js & Transaction.js
    - `User`: name/email/password with constraints; `Transaction`: fields for user, type, amount, category, dates, note.
 
    Why? Schema definitions ensure Mongo rejects invalid data and power Mongoose validation friendly errors.

     3.5 routes/authRoutes.js
    - `POST /register`: validates required fields, enforces server-side password policy (length, uppercase, lowercase, digit, special char), hashes with bcrypt, returns JWT.
    - `POST /login`: verifies credentials, returns JWT.
    
    Why? Aligns with security requirements—client-only validation is bypassable; server validation is authoritative.

    3.6 routes/transactionRoutes.js
        Auth: `POST /api/auth/register`, `POST /api/auth/login`
        Transactions: `GET`, `POST` to `/api/transactions`
        AI Transactions: `POST /api/transactions/ai`
        Management:`PUT`, `DELETE` to `/api/transactions/:id`
        Filtering: `GET` requests support query params: `type`, `category`, `startDate`, and `endDate`.

        Why? CRUD endpoints cover primary use cases; filters keep API flexible; AI route extends functionality without polluting core logic.

    3.7 services/clarityAi.js
    - Caches Gemini model, builds system prompt enforcing strict JSON contract, normalizes AI output, throws descriptive errors.
    
        Why? Deterministic normalization prevents malformed AI output from polluting DB, and caching avoids repeated model instantiation.

    3.8 Error & Detail Care
    - Consistent 4xx/5xx messages.
    - Logging at meaningful points (DB connect, auth failures, AI errors).
    - Validation ensures no silent failures.

 
4. Frontend Deep Dive

    4.1 `src/index.tsx`
    - Root render with StrictMode, imports global styles.

    4.2 `App.tsx`
    - Handles auth state (token/user) via `localStorage`, injects token into Axios, defines routes for Landing and Dashboard with protected route guard.

        Why? Central auth context keeps child components simple.

    4.3 Pages

    Dashboard
    - Layout with sidebar, dark-mode toggle, mobile-friendly collapsible nav, top-level routes (`/dashboard`, `/dashboard/income`, `/dashboard/expenses`).
    - Hooks into `useTransactions` for data.

        Why? Single page with nested routes avoids re-fetching data unnecessarily and keeps transitions smooth.

    4.4 Components
    
    AuthPanel: Handles login/register modes, inline validation, helpful hints, loading state.
    SummaryCards: Calculates totals via memoized loops, uses localized currency formatting.
    TransactionForm: Handles create/edit, includes Clarity AI section with rotating suggestions, status messaging (loading, success, error), resets appropriately, handles locked type for dedicated income/expense forms.
    TransactionList: Renders rows with fallback keys, edit/delete buttons, user-friendly formatting.
    FilterBar: Controlled inputs for type/category/date range; "Apply" and "Clear" actions.
    CategoryBarChart: Aggregates totals per category, sorts, shows fallback copy when no data.
    Hooks: `useTransactions` encapsulates API calls, optimistic state updates, error strings for UI.
    Services/api.ts: Axios instance with token setter, typed helper functions for each endpoint.

    4.5 Styling
     `App.css` + `index.css` define palette, responsive grid, dark theme, micro-interactions (hover translations, 
     toggles), custom typography.

    Why? Visual polish matters; the layout aims to look intentional, not boilerplate.

    4.6 Detail & UX Considerations
    - Loading messages: e.g., "Loading your data...", "Syncing data...".
    - Error messaging: clear, user-friendly text, not just codes.
    - Buttons disabled during submit to prevent duplicates.
    - AI form communicates status and resets gracefully.
    - Mobile nav overlay + accessible aria attributes.

    
5. Workflow & Tooling
    - Scripts:
    - `npm run dev` (backend via nodemon).
    - `npm run client` (CRA dev server).
    - `npm run client:build` (production build).
    - Environment separation (root `.env`, client `.env`).

    
6. Security & Quality Choices
    - JWT auth with server-side verification on every transaction route.
    - Password policy enforced both client & server, with server as source of truth.
    - Mongoose validation stops invalid data.
    - AI endpoint wrapped with error handling; `ClarityAIError` clarifies user-facing messages vs. server logs.
    - Axios intercept-like pattern with `setAuthToken` ensures headers stay in sync with stored token.


7. KEY FEATURES

    Dynamic Dashboard: Real-time calculation of total income, expenses, and net balance.
    Clarity AI Intake: Describe a transaction ("Spend 1500 on Biryani") and let Gemini auto-classify it from the dashboard.
    Advanced Filtering: Sort through financial history by date ranges or specific categories.
    Secure Auth: Full JWT implementation to ensure data remains private to the user.
    Responsive UI: Fully optimized for desktop and mobile browsers. 


8. Final Checklist
    - [x] Backend routes tested locally.
    - [x] Password policy enforced on both client and server.
    - [x] AI endpoint limited to authenticated users, handles edge cases.
    - [x] README updated.


9. Deployment and Live Website
    - The CLARITY Web App is Deployed in Vercel and Render.



IMPORTANT NOTES (AVOIDED ERROR)

macOS Port Conflict: Port `5000` is often occupied by AirPlay. This project defaults to `5050` to avoid conflicts. (Locally)

I have Implemented Clarity AI using Google Gemini API key but I am in Free Tier so it has limit of 20 requests per day.
