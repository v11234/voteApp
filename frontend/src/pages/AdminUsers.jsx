import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AdminUserModal from '../components/AdminUserModal'

function AdminUsers() {
  const token = useSelector((state) => state?.vote?.currentVoter?.token)
  const isAdmin = useSelector((state) => state?.vote?.currentVoter?.isAdmin)
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/')
    }
  }, [token, isAdmin, navigate])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token || !isAdmin) {
        return
      }

      try {
        setError('')
        setIsLoading(true)
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(response.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load users.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [token, isAdmin])

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return users
    }

    return users.filter((user) => {
      return (
        String(user.fullName || '').toLowerCase().includes(q) ||
        String(user.email || '').toLowerCase().includes(q) ||
        String(user.role || '').toLowerCase().includes(q) ||
        String(user.idVerificationStatus || '').toLowerCase().includes(q)
      )
    })
  }, [users, query])

  if (!token || !isAdmin) {
    return null
  }

  return (
    <section className="admin_dashboard">
      <div className="container admin_dashboard-container">
        <header className="admin_dashboard-header">
          <div>
            <h2>All Users</h2>
            <p>Complete list of every user in the system.</p>
          </div>
          <button className="btn" type="button" onClick={() => navigate('/admin')}>
            Back To Dashboard
          </button>
        </header>

        <article className="admin_dashboard-card">
          <input
            type="text"
            placeholder="Search by name, email, role, or ID status"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </article>

        {error && <p className="form_error-message">{error}</p>}

        {isLoading ? (
          <article className="admin_dashboard-card">
            <p>Loading users...</p>
          </article>
        ) : (
          <article className="admin_dashboard-card">
            <h4>Users ({filteredUsers.length})</h4>
            {filteredUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="admin_dashboard-list">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="admin_dashboard-list-item">
                    <div>
                      <h5>{user.fullName || 'Unnamed User'}</h5>
                      <small>{user.email || 'No email'} | {user.role || 'voter'}</small>
                    </div>
                    <div className="admin_dashboard-actions">
                      <small>
                        {user.isApproved ? 'Approved' : 'Pending'} | {user.idVerificationStatus || 'not_submitted'}
                      </small>
                      <button className="btn small" type="button" onClick={() => setSelectedUser(user)}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        )}
      </div>

      <AdminUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </section>
  )
}

export default AdminUsers
