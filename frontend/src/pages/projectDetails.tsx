import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Layout from "../components/layout/layout"
import "../styles/task.css"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"

type Priority = "high" | "medium" | "low"

type Task = {
  _id: string
  title: string
  description?: string
  status: "todo" | "inprogress" | "done"
  priority: Priority
  due?: string
  assignee?: string
}

const COLUMNS: { id: Task["status"]; label: string; cls: string }[] = [
  { id: "todo",       label: "To do",       cls: "column-todo"  },
  { id: "inprogress", label: "In progress", cls: "column-inprog" },
  { id: "done",       label: "Done",        cls: "column-done"  },
]

// ── helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split("T")[0]
}

function fmtDate(d?: string) {
  if (!d) return null
  const dt = new Date(d + "T00:00:00")
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function isOverdue(due?: string, status?: string) {
  return due && due < today() && status !== "done"
}

// ── Toast ────────────────────────────────────────────────────────────────────

type ToastItem = { id: number; msg: string; type: "toast-move" | "toast-del" | "toast-add" }

function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const addToast = (msg: string, type: ToastItem["type"] = "toast-move") => {
    const id = counter.current++
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2400)
  }

  return { toasts, addToast }
}

// ── Main Component ───────────────────────────────────────────────────────────

function ProjectDetails() {
  const { id } = useParams()
  const [tasks, setTasks]         = useState<Task[]>([])
  const [title, setTitle]         = useState("")
  const [due, setDue]             = useState("")
  const [priority, setPriority]   = useState<Priority>("medium")
  const [assignee, setAssignee]   = useState("")
  const [search, setSearch]       = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [filterAssignee, setFilterAssignee] = useState("")
  const [confirmTask, setConfirmTask] = useState<Task | null>(null)
  const { toasts, addToast }      = useToasts()

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    const token = localStorage.getItem("token")
    const res = await fetch(`http://localhost:5000/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setTasks(await res.json())
  }

  const createTask = async () => {
    if (!title.trim()) return
    const token = localStorage.getItem("token")
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, priority, due: due || null, assignee: assignee || null }),
    })
    setTitle("")
    setDue("")
    setPriority("medium")
    setAssignee("")
    fetchTasks()
    addToast("Task added", "toast-add")
  }

  const deleteTask = async (task: Task) => {
    setConfirmTask(null)
    setTasks(prev => prev.filter(t => t._id !== task._id))
    const token = localStorage.getItem("token")
    await fetch(`http://localhost:5000/tasks/${task._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => fetchTasks())
    addToast(`"${task.title.slice(0, 28)}…" deleted`, "toast-del")
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const newStatus = result.destination.droppableId as Task["status"]
    const taskId = result.draggableId
    if (newStatus === result.source.droppableId) return

    // Optimistic update — instant, no flicker
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
    const colLabel = COLUMNS.find(c => c.id === newStatus)?.label ?? newStatus
    addToast(`Moved to ${colLabel}`, "toast-move")

    const token = localStorage.getItem("token")
    fetch(`http://localhost:5000/tasks/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => fetchTasks()) // rollback on failure
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  const visible = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterAssignee && t.assignee !== filterAssignee) return false
    return true
  })

  const byStatus = (s: Task["status"]) => visible.filter(t => t.status === s)
  const total     = tasks.length
  const doneCount = tasks.filter(t => t.status === "done").length
  const pct       = total ? Math.round((doneCount / total) * 100) : 0

  // unique assignees for filter dropdown
  const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean))) as string[]

  return (
    <Layout>
      <div className="kanban-page">

        {/* ── Header ── */}
        <div className="kanban-header">
          <div>
            <p className="kanban-eyebrow">Project board</p>
            <h1 className="kanban-title">Project Tasks</h1>
          </div>
          {total > 0 && (
            <div className="kanban-stats">
              {byStatus("todo").length > 0 && (
                <span className="stat-pill">{byStatus("todo").length} to do</span>
              )}
              {byStatus("inprogress").length > 0 && (
                <span className="stat-pill">{byStatus("inprogress").length} in progress</span>
              )}
              <span className="stat-pill">{doneCount}/{total} done</span>
            </div>
          )}
        </div>

        {/* ── Progress ── */}
        {total > 0 && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-label">{pct}% complete</span>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className="kb-toolbar">
          <div className="search-wrap">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6.5" cy="6.5" r="4" />
              <path d="M10.5 10.5l3 3" />
            </svg>
            <input
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sel-wrap">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </div>

          <div className="sel-wrap">
            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
              <option value="">All members</option>
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </div>
        </div>

        {/* ── Add Task ── */}
        <div className="task-create">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createTask()}
          />
          <input
            type="date"
            value={due}
            onChange={e => setDue(e.target.value)}
          />
          <div className="sel-wrap">
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Assignee"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            style={{ width: 110, flexShrink: 0 }}
          />
          <button
            className="task-add-btn"
            onClick={createTask}
            disabled={!title.trim()}
          >
            + Add task
          </button>
        </div>

        {/* ── Board ── */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban">
            {COLUMNS.map(col => {
              const colTasks = byStatus(col.id)
              return (
                <Droppable droppableId={col.id} key={col.id}>
                  {(provided, snapshot) => (
                    <div
                      className={`column ${col.cls}${snapshot.isDraggingOver ? " drag-over" : ""}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <div className="col-header">
                        <div className="col-header-left">
                          <span className="col-dot" />
                          <span className="col-label">{col.label}</span>
                        </div>
                        <span className="col-count">{colTasks.length}</span>
                      </div>

                      <div className="col-body">
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="col-empty">Drop tasks here</div>
                        )}

                        {colTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                className={`task-card${snapshot.isDragging ? " is-dragging" : ""}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {/* Top row */}
                                <div className="card-top">
                                  <div className="drag-dots">
                                    <span /><span /><span />
                                  </div>
                                  <span className="task-title">{task.title}</span>
                                  <button
                                    className="task-del-btn"
                                    onClick={() => setConfirmTask(task)}
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Footer row */}
                                <div className="card-footer">
                                  <div className="card-footer-left">
                                    <span className={`badge badge-${task.priority}`}>
                                      {task.priority}
                                    </span>
                                    {task.due && (
                                      <span className={`due-date${isOverdue(task.due, task.status) ? " overdue" : ""}`}>
                                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                          <rect x="2" y="3" width="12" height="11" rx="1.5" />
                                          <path d="M5 1v4M11 1v4M2 7h12" />
                                        </svg>
                                        {fmtDate(task.due)}
                                      </span>
                                    )}
                                  </div>
                                  {task.assignee && (
                                    <span className="avatar">
                                      {task.assignee.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              )
            })}
          </div>
        </DragDropContext>

        {/* ── Confirm Delete ── */}
        {confirmTask && (
          <div className="confirm-overlay" onClick={() => setConfirmTask(null)}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
              <p className="confirm-title">Delete task?</p>
              <p className="confirm-sub">
                "{confirmTask.title}" will be permanently removed.
              </p>
              <div className="confirm-actions">
                <button className="confirm-cancel-btn" onClick={() => setConfirmTask(null)}>
                  Cancel
                </button>
                <button className="confirm-del-btn" onClick={() => deleteTask(confirmTask)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toasts ── */}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              <span className="toast-dot" />
              {t.msg}
            </div>
          ))}
        </div>

      </div>
    </Layout>
  )
}

export default ProjectDetails