# CLAUDE.md — Frontend (React + TypeScript + Vite)

> Frontend-specific guidance for AI coding assistants and developers.
> For project-wide context, see the root `../CLAUDE.md`.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 7 | Dev server & bundler |
| MUI Material | 7 | UI component library |
| `@hello-pangea/dnd` | 18 | Drag-and-drop (Kanban board) |
| `react-router-dom` | 7 | Client-side routing |
| `jwt-decode` | 4 | Decode JWT tokens on the client |
| `chart.js` | 4 | Dashboard charts |
| React Compiler | via babel plugin | Automatic memoization |

---

## Project Structure

```
frontend/src/
├── api.ts                     ← Centralized API layer (all fetch calls)
├── App.tsx                    ← Route definitions
├── main.tsx                   ← React entry point
├── index.css                  ← Global reset & base styles
├── App.css                    ← App-level styles
├── components/
│   └── layout/
│       ├── layout.tsx         ← Layout shell (sidebar + content)
│       ├── sidebar.tsx        ← Navigation sidebar
│       └── topbar.tsx         ← Top bar (currently unused)
├── pages/
│   ├── authPage.tsx           ← Login/Register toggle page
│   ├── login.tsx              ← Login form
│   ├── register.tsx           ← Registration form
│   ├── dashboard.tsx          ← Dashboard with stats & charts
│   ├── projects.tsx           ← Project listing page
│   └── projectDetails.tsx     ← Kanban board (tasks, drag-drop, comments)
├── styles/
│   ├── auth.css               ← Auth pages styling
│   ├── dashboard.css          ← Dashboard styling
│   ├── layout.css             ← Layout/sidebar styling
│   ├── project.css            ← Projects page styling
│   └── task.css               ← Kanban board & task card styling
├── types/
│   ├── project.ts             ← Project interface
│   └── user.ts                ← User interface
└── utils/
    └── ProtectedRoutes.tsx    ← Route guard (redirects if no token)
```

---

## Component Patterns

### Page Components
- Each page is a standalone functional component in `pages/`
- Pages wrap their content in `<Layout>` for the sidebar shell
- Pages import their CSS file from `styles/`
- Page-specific types are defined **inline** at the top of the page file
- Shared types go in `src/types/`

```tsx
// Pattern for a page component
import Layout from "../components/layout/layout"
import "../styles/feature.css"

type FeatureItem = { _id: string; name: string }

function FeaturePage() {
  const [items, setItems] = useState<FeatureItem[]>([])
  // ...
  return (
    <Layout>
      <div className="feature-page">
        {/* content */}
      </div>
    </Layout>
  )
}

export default FeaturePage
```

### Layout Pattern
- `<Layout>` wraps `<Sidebar>` + a `.content` area
- Every protected page **must** be wrapped in `<Layout>`
- Topbar exists but is currently commented out

### Protected Routes
- `<ProtectedRoute>` checks for `token` in `localStorage`
- If no token → redirects to `/login`
- Wrap all authenticated routes in `<ProtectedRoute>` in `App.tsx`

---

## API Layer

All API calls are centralized in `src/api.ts`. The pattern:

```tsx
export const getResource = async () => {
  const token = localStorage.getItem("token")
  const res = await fetch(`${API_URL}/resource`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}
```

### Rules
- **Always use `fetch()`** — never Axios
- **Always retrieve token** from `localStorage.getItem("token")`
- **API_URL** is `http://localhost:5000` (hardcoded in `api.ts`)
- New API functions should be added to `api.ts`  
- Some pages also call `fetch` directly — prefer centralizing in `api.ts` for new code

---

## Styling Rules

### Principles
- **Vanilla CSS only** — no Tailwind, no CSS Modules, no styled-components
- **No inline styles** — always use CSS classes
- **One CSS file per feature** in `src/styles/`
- Global reset and base styles in `index.css`

### File Naming
| Feature | CSS File |
|---|---|
| Auth (login/register) | `styles/auth.css` |
| Dashboard | `styles/dashboard.css` |
| Layout & sidebar | `styles/layout.css` |
| Projects page | `styles/project.css` |
| Kanban board & tasks | `styles/task.css` |

### Class Naming Convention
Use **kebab-case**, BEM-inspired names:
```css
/* Block */
.task-card { }
.comment-thread { }

/* Element */
.task-card .card-top { }
.task-card .card-footer { }

/* Modifier */
.badge-high { }
.badge-medium { }
.is-dragging { }
```

### Import Pattern
```tsx
// At the top of each page
import "../styles/task.css"
```

---

## Routing

Defined in `App.tsx` using React Router v7:

| Path | Component | Auth Required |
|---|---|---|
| `/auth` | `AuthPage` | No |
| `/projects` | `Projects` | Yes |
| `/projects/:id` | `ProjectDetails` | Yes |
| `/dashboard` | `Dashboard` | Yes |
| `*` | Redirects to `/auth` | — |

---

## State Management

- **No global state library** (no Redux, Zustand, etc.)
- Use `useState` + `useEffect` for local component state
- Auth state is derived from `localStorage` token (decoded via `jwt-decode`)
- Data is fetched on mount via `useEffect(() => { fetch... }, [])`

---

## Key Conventions Summary

| Rule | Details |
|---|---|
| Styling | Vanilla CSS, no inline styles, no Tailwind |
| HTTP Client | `fetch()` only, never Axios |
| Components | Functional, `function` declarations (not arrow), PascalCase |
| Exports | `export default ComponentName` at bottom |
| File names | Lowercase, camelCase (`projectDetails.tsx`) |
| Types | `type` keyword preferred over `interface` for component props |
| State | Local `useState`, no global store |
| Layout | Always wrap pages in `<Layout>` |

---

## Dev Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```
