import { useEffect, useState } from "react"
import { getProjects, createProject, deleteProject } from "../api"
import type { Project } from "../types/project"
import Layout from "../components/layout/layout"
import "../styles/project.css"
import { useNavigate } from "react-router-dom"

function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [showDrawer, setShowDrawer] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const data = await getProjects()
    setProjects(data)
  }

  const handleCreate = async () => {
    if (!title.trim()) return
    await createProject({ title, description })
    setTitle("")
    setDescription("")
    setShowDrawer(false)
    fetchProjects()
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteProject(id)
    fetchProjects()
  }

  const closeDrawer = () => {
    setShowDrawer(false)
    setTitle("")
    setDescription("")
  }

  return (
    <Layout>
      <div className="projects-page">

        {/* ── Header ── */}
        <div className="pg-header">
          <div className="pg-header-left">
            <span className="pg-eyebrow">Workspace</span>
            <h1 className="pg-title">Projects</h1>
            <span className="pg-count">
              {projects.length === 0
                ? "No projects yet"
                : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          <button className="new-project-btn" onClick={() => setShowDrawer(true)}>
            New Project
          </button>
        </div>

        {/* ── Grid ── */}
        {projects.length === 0 ? (
          <div className="projects-empty">
            <div className="empty-glyph">◻</div>
            <p className="empty-title">No projects yet</p>
            <p className="empty-sub">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project, i) => (
              <div className="project-card" key={project._id}>
                <span className="card-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="card-title">{project.title}</h3>
                {project.description && (
                  <p className="card-description">{project.description}</p>
                )}
                <div className="card-actions">
                  <button
                    className="card-open-btn"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    Open →
                  </button>
                  <button
                    className="card-dlt-btn"
                    onClick={(e) => handleDelete(e, project._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Drawer ── */}
        {showDrawer && (
          <>
            <div className="drawer-overlay" onClick={closeDrawer} />
            <div className="drawer">
              <div className="drawer-top">
                <p className="drawer-eyebrow">New</p>
                <h2 className="drawer-title">Create Project</h2>
                <div className="drawer-divider" />
              </div>

              <div className="drawer-body">
                <div className="field">
                  <label htmlFor="proj-title">Title</label>
                  <input
                    id="proj-title"
                    placeholder="e.g. Marketing Dashboard"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>
                <div className="field">
                  <label htmlFor="proj-desc">Description</label>
                  <textarea
                    id="proj-desc"
                    placeholder="What is this project about? (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <div className="drawer-footer">
                <button className="drawer-cancel-btn" onClick={closeDrawer}>
                  Cancel
                </button>
                <button
                  className="drawer-create-btn"
                  onClick={handleCreate}
                  disabled={!title.trim()}
                >
                  Create Project
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </Layout>
  )
}

export default Projects