import { useEffect, useState } from "react"
import { getUsers, deleteUser, createUser } from "../api"
import  type { User } from "../types/user"

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const data = await getUsers()
    setUsers(data)
  }

  const handleDelete = async (id: string) => {
    await deleteUser(id)
    fetchUsers()
  }

  const handleCreate = async () => {
    await createUser({ name, email, password, role })
    fetchUsers()
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/login"
  }

  return (
    <div>
      <h2>Users Dashboard</h2>

      <button onClick={handleLogout}>Logout</button>

      <h3>Create User</h3>

      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button onClick={handleCreate}>Add User</button>

      <h3>User List</h3>

      {users.map((user) => (
        <div key={user._id}>
          {user.name} - {user.email} - {user.role}

          <button onClick={() => handleDelete(user._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default Users