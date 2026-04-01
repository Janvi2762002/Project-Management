import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getProjects, getAllTasks } from "../api"
import type { Project } from "../types/project"
import Layout from "../components/layout/layout"

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartData,
} from "chart.js"

// BarController is required for type:"bar" — BarElement alone is not enough
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

// ── Types ─────────────────────────────────────────────────────────────────────

interface Task {
  _id: string
  title: string
  status: "todo" | "inprogress" | "done"
  priority: "high" | "medium" | "low"
  project: {
    _id: string
  }
  due?: string
  createdAt?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split("T")[0]

const isOverdue = (t: Task) =>
  t.due && t.status !== "done" && t.due < todayStr()

function initials(name: string) {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Last 7 days labels
function last7Days() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return days[d.getDay()]
  })
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────

function CompletionChart({ tasks }: { tasks: Task[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Build per-day completed + created counts for last 7 days
    const completed = Array(7).fill(0)
    const created = Array(7).fill(0)

    tasks.forEach(t => {
      const dateStr = t.status === "done" ? t.due : t.createdAt
      if (!dateStr) return
      const d = new Date(dateStr)
      const today = new Date()
      const diffDays = Math.floor(
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays >= 0 && diffDays < 7) {
        const idx = 6 - diffDays
        if (t.status === "done") completed[idx]++
        else created[idx]++
      }
    })

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const gridColor = isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"
    const tickColor = isDark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.35)"

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: last7Days(),
        datasets: [
          {
            label: "Completed",
            data: completed,
            backgroundColor: "#3B6D11",
            borderRadius: 4,
            barPercentage: 0.45,
          },
          {
            label: "Created",
            data: created,
            backgroundColor: "#BA7517",
            borderRadius: 4,
            barPercentage: 0.45,
          },
        ],
      } as ChartData<"bar">,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: tickColor, font: { size: 11 }, stepSize: 1 },
            border: { display: false },
            min: 0,
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [tasks])

  return (
    <div className="db-card">
      <div className="db-card-head">
        <span className="db-card-title">Tasks completed (last 7 days)</span>
      </div>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-sq" style={{ background: "#3B6D11" }} />
          Completed
        </span>
        <span className="legend-item">
          <span className="legend-sq" style={{ background: "#BA7517" }} />
          Created
        </span>
      </div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [p, t] = await Promise.all([getProjects(), getAllTasks()])
      setProjects(p)
      setTasks(t)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <Layout>
        <p style={{ padding: "2rem", color: "var(--text-muted)", fontSize: 13 }}>
          Loading…
        </p>
      </Layout>
    )
  }

  // ── Derived stats ────────────────────────────────────────────────────────────

  const total = tasks.length
  const completed = tasks?.filter(t => t.status === "done").length
  const overdueTasks = tasks?.filter(isOverdue)
  const completionPct = total ? Math.round((completed / total) * 100) : 0

  const recentProjects = [...projects]
    .sort((a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )
    .slice(0, 5)

  const byStatus = (s: Task["status"]) => tasks?.filter(t => t.status === s).length
  const byPriority = (p: Task["priority"]) => tasks?.filter(t => t.priority === p).length

  const maxStatus = Math.max(byStatus("todo"), byStatus("inprogress"), byStatus("done"), 1)
  const maxPriority = Math.max(byPriority("high"), byPriority("medium"), byPriority("low"), 1)

  return (
    <Layout>
      <div className="dashboard">

        {/* ── Header ── */}
        <div className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">Overview</p>
            <h2>Dashboard</h2>
            <p className="dashboard-subtitle">
              Here's what's happening across your projects.
            </p>
          </div>
          <button className="goto-btn" onClick={() => navigate("/projects")}>
            Go to Projects →
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Projects</span>
              <span className="stat-icon-wrap">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" />
                  <path d="M2 7h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
                </svg>
              </span>
            </div>
            <div className="stat-value">{projects.length}</div>
            <div className="stat-sub">Active workspaces</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total tasks</span>
              <span className="stat-icon-wrap">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8l3 3 7-7" />
                  <rect x="1" y="1" width="14" height="14" rx="2" />
                </svg>
              </span>
            </div>
            <div className="stat-value">{total}</div>
            <div className="stat-sub">Across all projects</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Completed</span>
              <span className="stat-icon-wrap">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M5 8l2.5 2.5L11 5.5" />
                </svg>
              </span>
            </div>
            <div className="stat-value">{completed}</div>
            <div className="stat-sub">{completionPct}% completion rate</div>
          </div>

          <div className={`stat-card${overdueTasks.length > 0 ? " stat-card--accent" : ""}`}>
            <div className="stat-top">
              <span className="stat-label">Overdue</span>
              <span className="stat-icon-wrap">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 5v3.5l2 2" />
                </svg>
              </span>
            </div>
            <div className="stat-value">{overdueTasks.length}</div>
            <div className="stat-sub">Need attention</div>
          </div>
        </div>

        {/* ── Chart + Recent Projects ── */}
        <div className="two-col">
          <CompletionChart tasks={tasks} />

          <div className="db-card">
            <div className="db-card-head">
              <span className="db-card-title">Recent projects</span>
              <button className="db-card-link" onClick={() => navigate("/projects")}>
                View all →
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet.</p>
                <button className="empty-create-btn" onClick={() => navigate("/projects")}>
                  Create your first project
                </button>
              </div>
            ) : (
              recentProjects.map((project, i) => {
                const pt = tasks?.filter(t => t.project?._id?.toString() === project._id.toString());
                const done = pt.filter(t => t.status === "done").length
                const progress = pt.length ? Math.round((done / pt.length) * 100) : 0

                return (
                  <div
                    key={project._id}
                    className="proj-row"
                    onClick={() => navigate(`/projects/${project._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className={`proj-initial pi-${i % 5}`}>
                      {initials(project.title)}
                    </span>
                    <div className="proj-info">
                      <div className="proj-name">{project.title}</div>
                      <div className="proj-meta">{pt.length} task{pt.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div className="proj-progress">
                      <div className="mini-bar">
                        <div className="mini-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="mini-pct">{progress}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Status + Priority + Overdue ── */}
        {total > 0 && (
          <div className="three-col">

            {/* Task status */}
            <div className="db-card">
              <div className="db-card-head">
                <span className="db-card-title">Task status</span>
              </div>
              <div className="status-rows">
                {(["todo", "inprogress", "done"] as Task["status"][]).map(s => {
                  const count = byStatus(s)
                  const cls = s === "inprogress" ? "sr-prog" : `sr-${s}`
                  const label = s === "todo" ? "To do" : s === "inprogress" ? "In progress" : "Done"
                  return (
                    <div key={s} className={`sr-item ${cls}`}>
                      <span className="sr-dot" />
                      <span className="sr-label">{label}</span>
                      <div className="sr-bar-wrap">
                        <div className="sr-bar" style={{ width: `${Math.round((count / maxStatus) * 100)}%` }} />
                      </div>
                      <span className="sr-count">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority breakdown */}
            <div className="db-card">
              <div className="db-card-head">
                <span className="db-card-title">By priority</span>
              </div>
              <div className="priority-rows">
                {(["high", "medium", "low"] as Task["priority"][]).map(p => {
                  const count = byPriority(p)
                  const barCls = `pr-${p}-bar`
                  return (
                    <div key={p} className="pr-item">
                      <span className={`pr-badge pr-${p}`}>{p}</span>
                      <div className="pr-bar-wrap">
                        <div className={`pr-bar ${barCls}`} style={{ width: `${Math.round((count / maxPriority) * 100)}%` }} />
                      </div>
                      <span className="pr-count">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Overdue tasks */}
            <div className="db-card">
              <div className="db-card-head">
                <span className="db-card-title">Overdue tasks</span>
              </div>
              {overdueTasks.length === 0 ? (
                <div className="empty-state" style={{ padding: "20px 0", border: "none" }}>
                  <p>No overdue tasks 🎉</p>
                </div>
              ) : (
                <div className="overdue-list">
                  {overdueTasks.slice(0, 5).map(t => {
                    const proj = projects.find(
                      p => p._id?.toString() === t.project?.toString()
                    );
                    return (
                      <div
                        key={t._id}
                        className="od-item"
                        onClick={() => navigate(`/projects/${t.project}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="od-dot" />
                        <span className="od-title">{t.title}</span>
                        <span className="od-proj">{proj?.title?.split(" ")[0] ?? ""}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </Layout>
  )
}

export default Dashboard