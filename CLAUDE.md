# CLAUDE.md — Project Flow (Root)

> This file provides project-wide context for AI coding assistants and human developers.
> For layer-specific details, see `frontend/CLAUDE.md` and `backend/CLAUDE.md`.

---

## Project Overview

**Project Flow** is a Kanban-style project management application with role-based access control.
Users can create projects, manage tasks across a drag-and-drop board (To Do → In Progress → Done),
assign team members, and collaborate via task comments.

---

## Architecture

```
fullstack-app/                 ← Monorepo root
├── frontend/                  ← React 19 + TypeScript + Vite 7
│   └── src/
│       ├── components/layout/ ← Layout shell (sidebar, topbar)
│       ├── pages/             ← Route-level page components
│       ├── styles/            ← Per-feature vanilla CSS files
│       ├── types/             ← Shared TypeScript interfaces
│       ├── utils/             ← Route guards, helpers
│       └── api.ts             ← Centralized API functions
├── backend/                   ← Express 5 + Mongoose 9 + Node.js
│   ├── server.js              ← Entry point
│   └── src/
│       ├── controllers/       ← Route handlers (business logic)
│       ├── models/            ← Mongoose schemas (User, Project, Task)
│       ├── routes/            ← Express route definitions
│       └── middleware/        ← Auth middleware (JWT verification)
└── package.json               ← Root scripts (concurrently)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| UI Library | MUI Material v7 |
| Drag & Drop | `@hello-pangea/dnd` |
| Routing | `react-router-dom` v7 |
| Styling | **Vanilla CSS only** (no Tailwind, no CSS Modules) |
| Backend | Express 5, Node.js |
| Database | MongoDB via Mongoose 9 |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| Dev Runner | `concurrently` |

---

## Quick Start

```bash
# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Run both servers concurrently
npm run dev

# Or run them individually
npm run server   # Backend on http://localhost:5000
npm run client   # Frontend on http://localhost:5173
```

---

## Auth Flow

1. User registers via `POST /users/register`
2. User logs in via `POST /users/login` → receives JWT token
3. Token is stored in `localStorage` under key `"token"`
4. All authenticated requests send `Authorization: Bearer <token>` header
5. Backend middleware (`src/middleware/auth.js`) verifies the token and attaches `req.user = { userId, role }`

### Roles
- **admin** — Full access: can see all tasks across all projects, create tasks, comment on any task
- **user** — Scoped access: can only see tasks assigned to them, can comment on their own tasks

---

## Coding Conventions (Project-Wide)

### Must Follow
- **No inline styles** — Always use CSS classes
- **No Axios** — Always use native `fetch()` for HTTP requests
- **No Tailwind** — Vanilla CSS only, organized in `frontend/src/styles/`
- **ESM preferred** — Use `import/export` syntax (the codebase is migrating to full ESM)

### Module System
- **Target: ES Modules (ESM)** throughout the project
- Some backend files still use `require()` (legacy) — new code should use `import/export`
- Frontend is fully ESM via TypeScript + Vite

### Naming
- Files: lowercase, camelCase for multi-word (`projectDetails.tsx`, `taskController.js`)
- CSS classes: kebab-case, BEM-like (`.task-card`, `.comment-thread`, `.kanban-header`)
- Components: PascalCase (`ProjectDetails`, `ProtectedRoute`)
- API functions: camelCase (`getUsers`, `createProject`)

---

## API Base URLs

| Service | URL |
|---|---|
| Backend API | `http://localhost:5000` |
| Frontend Dev | `http://localhost:5173` |
