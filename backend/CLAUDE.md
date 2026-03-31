# CLAUDE.md — Backend (Express + MongoDB + Node.js)

> Backend-specific guidance for AI coding assistants and developers.
> For project-wide context, see the root `../CLAUDE.md`.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Express | 5 | HTTP framework |
| Mongoose | 9 | MongoDB ODM |
| bcryptjs | 3 | Password hashing |
| jsonwebtoken | 9 | JWT generation & verification |
| cors | 2 | Cross-origin resource sharing |
| dotenv | 17 | Environment variables |
| nodemon | 3 | Auto-restart in development |

---

## Project Structure

```
backend/
├── server.js                  ← Entry point (Express app setup)
├── .env                       ← Environment variables (MONGO_URI, JWT_SECRET)
└── src/
    ├── controllers/
    │   ├── userController.js  ← Auth (register, login), user CRUD
    │   ├── projectController.js ← Project CRUD
    │   └── taskController.js  ← Task CRUD, status updates, comments
    ├── models/
    │   ├── user.js            ← User schema (name, email, password, role)
    │   ├── project.js         ← Project schema (title, desc, owner, members)
    │   └── task.js            ← Task schema (title, status, priority, comments[])
    ├── routes/
    │   ├── userRoutes.js      ← /users/* routes
    │   ├── projectRoutes.js   ← /projects/* routes
    │   └── taskRoutes.js      ← /tasks/* routes
    └── middleware/
        └── auth.js            ← JWT verification middleware
```

---

## Module System

> **Target: ES Modules (ESM)**

The codebase is migrating to ESM. Current state:

| File Type | Current Style | Target |
|---|---|---|
| `server.js` | CommonJS (`require`) | Migrate to `import` |
| Routes (`src/routes/`) | CommonJS (`require`) | Migrate to `import` |
| Controllers (`src/controllers/`) | ✅ ESM (`import/export`) | Already correct |
| Middleware (`src/middleware/`) | CommonJS (`require`) | Migrate to `import` |
| Models (`src/models/`) | CommonJS (`require`) | Migrate to `import` |

**For all new code, always use ES module syntax:**

```js
// ✅ Do this
import Task from "../models/task.js"
export const getTasks = async (req, res) => { ... }

// ❌ Not this
const Task = require("../models/task")
module.exports = { getTasks }
```

---

## Authentication & Authorization

### Auth Middleware (`src/middleware/auth.js`)

Applied via `router.get("/", auth, controller.method)`:

1. Extracts `Bearer <token>` from `Authorization` header
2. Verifies token with `jwt.verify(token, process.env.JWT_SECRET)`
3. Attaches decoded payload to `req.user`:
   ```js
   req.user = { userId: "...", role: "admin" | "user" }
   ```

### JWT Payload

```js
jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
)
```

### Role-Based Access Patterns

```js
// Admin sees everything, user sees only their own
if (role === "admin") {
  tasks = await Task.find()
} else {
  tasks = await Task.find({ assignee: userId })
}

// Comment permission: admin OR assignee
const canComment = role === "admin" || task.assignee?.toString() === userId
```

---

## Database Models

### User
```js
{
  name: String,          // required, trimmed
  email: String,         // required, unique, lowercase
  password: String,      // required (bcrypt hashed)
  role: "user" | "admin" // default: "user"
  // timestamps: createdAt, updatedAt (auto)
}
```

### Project
```js
{
  title: String,         // required, trimmed
  description: String,   // trimmed
  owner: ObjectId → User, // required
  members: [ObjectId → User]
  // timestamps: createdAt, updatedAt (auto)
}
```

### Task
```js
{
  title: String,                    // required, trimmed
  description: String,              // default: ""
  status: "todo" | "inprogress" | "done",  // default: "todo"
  priority: "high" | "medium" | "low",     // default: "medium"
  due: String,                      // date string, nullable
  owner: ObjectId → User,           // required (creator)
  assignee: ObjectId → User,        // required (assigned to)
  project: ObjectId → Project,      // required
  comments: [{
    text: String,                    // required
    user: ObjectId → User,          // required
    createdAt: Date                  // default: Date.now
  }]
  // timestamps: createdAt, updatedAt (auto)
}
```

---

## API Routes

### Users — `/users`

| Method | Route | Auth | Handler | Description |
|---|---|---|---|---|
| POST | `/users/register` | No | `registerUser` | Create account |
| POST | `/users/login` | No | `loginUser` | Login → returns JWT |
| GET | `/users` | Yes | `getUsers` | List all users (no passwords) |
| DELETE | `/users/:id` | Yes | `deleteUser` | Delete a user |
| PUT | `/users/:id` | Yes | `updateUser` | Update user fields |

### Projects — `/projects`

| Method | Route | Auth | Handler | Description |
|---|---|---|---|---|
| POST | `/projects` | Yes | `createProject` | Create project |
| GET | `/projects` | Yes | `getProjects` | List all projects |
| DELETE | `/projects/:id` | Yes | `deleteProject` | Delete project |

### Tasks — `/tasks`

| Method | Route | Auth | Handler | Description |
|---|---|---|---|---|
| GET | `/tasks` | Yes | `getAllTasks` | All tasks (admin) or assigned (user) |
| GET | `/tasks/:projectId` | Yes | `getTasks` | Tasks for a specific project |
| POST | `/tasks/:projectId` | Yes | `createTask` | Create task in project |
| DELETE | `/tasks/:id` | Yes | `deleteTask` | Delete task |
| PUT | `/tasks/:id` | Yes | `updateTask` | Update task fields |
| PUT | `/tasks/:id/status` | Yes | `updateTaskStatus` | Update status only (drag-drop) |
| POST | `/tasks/:id/comment` | Yes | `addComment` | Add comment to task |

---

## Controller Patterns

### Standard CRUD handler

```js
export const getResource = async (req, res) => {
  try {
    const userId = req.user.userId
    const role = req.user.role

    // Role-based query
    let data
    if (role === "admin") {
      data = await Model.find().populate("ref", "field")
    } else {
      data = await Model.find({ assignee: userId }).populate("ref", "field")
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
```

### Response Patterns
- **Success**: `res.json(data)` or `res.status(201).json(data)`
- **Not found**: `res.status(404).json({ message: "Resource not found" })`
- **Auth error**: `res.status(401).json({ message: "..." })`
- **Forbidden**: `res.status(403).json({ message: "Not allowed" })`
- **Server error**: `res.status(500).json({ message: err.message })`

---

## Environment Variables

Required in `backend/.env`:

```
MONGO_URI=<mongodb connection string>
JWT_SECRET=<secret key for signing JWTs>
```

---

## Key Conventions Summary

| Rule | Details |
|---|---|
| Module system | ESM (`import/export`) for all new code |
| HTTP client | Never use in backend — this is the API server |
| Error handling | `try/catch` in every controller, return appropriate HTTP status |
| Auth | Apply `auth` middleware to all protected routes |
| Populate | Always `.populate()` refs when returning data that has ObjectId references |
| Passwords | Always hash with `bcrypt`, never store plain text, exclude from queries with `.select("-password")` |
| File naming | Lowercase camelCase (`taskController.js`, `userRoutes.js`) |
| Exports | Named exports from controllers (`export const handler = ...`) |

---

## Dev Commands

```bash
npm run dev    # Start with nodemon (auto-restart on changes)
npm start      # Production start (node --max-old-space-size=4096 index.js)
```

**Server runs on:** `http://localhost:5000`
