import "../../styles/layout.css"

function Topbar() {
  return (
    <div className="topbar">

      <input
        className="search"
        placeholder="Search projects..."
      />

      <div className="user">
        👤
      </div>

    </div>
  )
}

export default Topbar