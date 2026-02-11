
CLARITY

Clarity is a simple yet powerful personal finance tracker designed to simplify income and expense management. By combining a robust Express API with a type-safe React frontend, it offers a complete full-stack environment for tracking balances, filtering historical data, and visualizing financial health.


TECH STACK

Backend: Node.js, Express, MongoDB (Mongoose)
Security: JWT Authentication, bcrypt password hashing
Frontend: React, TypeScript, Axios, React Router
Styling: Responsive CSS with a focus on mobile usability


GETTING STARTED

1. Installation

Clone the repository and install dependencies for both the root (backend) and the client:

```bash
npm install
cd client && npm install && cd ..

```

2. Environment Setup

Created a `.env` file in the root directory and the client directory.

## Root `.env`:

```text
PORT=5050
MONGO_URI=mongodb+srv://oscardhamala117_db_user:pK8eelUnKT07MPsM@claritydb.nvkjn0o.mongodb.net/?appName=ClarityDB
JWT_SECRET=your_secret_key_here

```
## Client `.env`:

```text
REACT_APP_API_URL=http://localhost:5050

```

3. Execution

Launching the backend and frontend in separate terminals:

Terminal 1 (Backend): `npm run dev` (Runs on port 5050)
Terminal 2 (Frontend): `npm run client` (Runs on port 3000)

---

API & SCRIPTS

Available Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Spins up the API with `nodemon` for auto-reloads |
| `npm run client` | Launches the React development server |
| `npm run start` | Starts the API in production mode |
| `npm run client:build` | Compiles the React app for deployment |


API Endpoints

All transaction routes require a `Bearer <token>` in the Authorization header.

Auth: `POST /api/auth/register`, `POST /api/auth/login`
Transactions: `GET`, `POST` to `/api/transactions`
Management:`PUT`, `DELETE` to `/api/transactions/:id`
Filtering: `GET` requests support query params: `type`, `category`, `startDate`, and `endDate`.

---

KEY FEATURES 

Dynamic Dashboard: Real-time calculation of total income, expenses, and net balance.
Advanced Filtering: Sort through financial history by date ranges or specific categories.
Secure Auth: Full JWT implementation to ensure data remains private to the user.
Responsive UI: Fully optimized for desktop and mobile browsers.


IMPORTANT NOTES (AVOIDED ERROR)

macOS Port Conflict: Port `5000` is often occupied by AirPlay. This project defaults to `5050` to avoid conflicts.
