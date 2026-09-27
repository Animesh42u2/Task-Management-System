# Task Management System

A full-stack Task Management System built with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend), using PostgreSQL for storage and JWT (with refresh token rotation) for authentication.

## Features

- Register / login with JWT access + refresh tokens (refresh tokens are rotated and stored in the DB so they can be revoked)
- Task CRUD: create, edit, delete, mark complete
- Filter tasks by status (pending / in progress / completed) on the dashboard
- Responsive UI (mobile + desktop)
- Input validation and centralized error handling on the backend

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Axios
- **Backend:** Node.js, Express, TypeScript, TypeORM
- **Database:** PostgreSQL

## Project Structure

```
task-manager/
├── backend/
│   └── src/
│       ├── config/database.ts       # TypeORM DataSource config
│       ├── entities/                # User, Task, RefreshToken
│       ├── middleware/               # requireAuth, errorHandler
│       ├── controllers/              # auth + task logic
│       ├── routes/                   # /api/auth, /api/tasks
│       ├── utils/jwt.ts              # token sign/verify helpers
│       ├── app.ts                    # Express app setup
│       └── server.ts                 # entrypoint, connects DB, starts server
└── frontend/
    └── src/
        ├── api/axios.ts              # axios instance + auto refresh-on-401
        ├── context/AuthContext.tsx   # auth state, login/register/logout
        ├── components/               # TaskForm, TaskItem, TaskList, ProtectedRoute
        ├── pages/                    # Login, Register, Dashboard
        └── App.tsx                   # routes
```

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)

## Setup

### 1. Database

Create a database:

```sql
CREATE DATABASE task_manager;
```

The backend uses TypeORM's `synchronize: true` in dev, so tables are created automatically on first run — no manual migration needed.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your DB credentials and JWT secrets (use long random strings for `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`). Then:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. Health check: `GET /health`.

### 3. Frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173` and expects the API at the URL set in `VITE_API_URL`.

## API Overview

**Auth** (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a new user |
| POST | `/login` | Log in, returns access + refresh tokens |
| POST | `/refresh` | Exchange a refresh token for a new token pair |
| POST | `/logout` | Revoke a refresh token |

**Tasks** (`/api/tasks`, all require `Authorization: Bearer <accessToken>`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List tasks for the logged-in user (optional `?status=` filter) |
| GET | `/:id` | Get a single task |
| POST | `/` | Create a task |
| PUT | `/:id` | Update a task |
| PATCH | `/:id/complete` | Mark a task as completed |
| DELETE | `/:id` | Delete a task |

## How auth refresh works

The frontend axios instance stores the access token in `localStorage` and attaches it to every request. If a request comes back `401`, it automatically calls `/api/auth/refresh` with the stored refresh token, stores the new token pair, and retries the original request — so the user stays logged in without re-entering credentials until the refresh token itself expires or is revoked.

## Notes / assumptions

- `synchronize: true` is used for fast local setup for this assignment; a production app would use TypeORM migrations instead.
- Deployment was left out (optional per the assignment) to prioritize a complete, working core flow within the time available.
- Tests were left out (optional per the assignment) for the same reason.

## Deployed application URL

_(optional — add here if deployed)_
