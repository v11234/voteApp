import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AdminUserModal from '../components/AdminUserModal'

function AdminDashboard() {
  const token = useSelector((state) => state?.vote?.currentVoter?.token)
  const isAdmin = useSelector((state) => state?.vote?.currentVoter?.isAdmin)
  const navigate = useNavigate()

  const [pendingUsers, setPendingUsers] = useState([])
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [elections, setElections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [approvingUserId, setApprovingUserId] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate('/')
    }
  }, [token, isAdmin, navigate])

  const fetchData = useCallback(async (options = { silent: false }) => {
    const authHeaders = { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }

    if (!options.silent) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    setError('')

    try {
      const [pendingRes, usersRes, logsRes, electionsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/admin/voters/pending`, authHeaders),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, authHeaders),
        axios.get(`${import.meta.env.VITE_API_URL}/admin/logs?limit=50`, authHeaders),
        axios.get(`${import.meta.env.VITE_API_URL}/elections`, authHeaders),
      ])

      const pending = pendingRes.data || []
      const allUsers = usersRes.data || []

      setPendingUsers(pending)
      setUsers(allUsers)
      setLogs(logsRes.data || [])
      setElections(electionsRes.data || [])

      if (selectedUser?._id) {
        const updated = allUsers.find((user) => user._id === selectedUser._id) || pending.find((user) => user._id === selectedUser._id)
        setSelectedUser(updated || null)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admin dashboard data.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [token, selectedUser?._id])

  useEffect(() => {
    if (token && isAdmin) {
      fetchData()
    }
  }, [token, isAdmin, fetchData])

  const openUserModal = (user) => {
    setSelectedUser(user)
  }

  const approveUser = async (id) => {
    const authHeaders = { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
    setApprovingUserId(id)

    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/voters/${id}/approve`, {}, authHeaders)
      await fetchData({ silent: true })
      if (selectedUser?._id === id) {
        setSelectedUser(null)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to approve user.')
    } finally {
      setApprovingUserId('')
    }
  }

  const dashboardStats = useMemo(() => {
    const verifiedUsers = users.filter((user) => user.isVerified).length
    const approvedUsers = users.filter((user) => user.isApproved).length
    const adminUsers = users.filter((user) => user.role === 'admin').length
    const totalTurnout = elections.reduce((total, election) => total + (election.voters?.length || 0), 0)
    const averageTurnout = elections.length ? Math.round(totalTurnout / elections.length) : 0

    return [
      { label: 'Total Users', value: users.length },
      { label: 'Verified Users', value: verifiedUsers },
      { label: 'Approved Users', value: approvedUsers },
      { label: 'Pending Approvals', value: pendingUsers.length },
      { label: 'Admin Accounts', value: adminUsers },
      { label: 'Elections', value: elections.length },
      { label: 'Total Ballots Cast', value: totalTurnout },
      { label: 'Avg. Election Turnout', value: averageTurnout },
    ]
  }, [users, pendingUsers, elections])

  const recentLogs = useMemo(() => logs.slice(0, 20), [logs])

  if (!token || !isAdmin) {
    return null
  }

  return (
    <section className="admin_dashboard">
      <div className="container admin_dashboard-container">
        <header className="admin_dashboard-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Review pending users, verify documents, and approve accounts.</p>
          </div>
          <div className="admin_dashboard-actions-row">
            <button className="btn" type="button" onClick={() => navigate('/admin/users')}>
              View All Users
            </button>
            <button className="btn primary" type="button" onClick={() => fetchData({ silent: true })} disabled={isRefreshing || isLoading}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {error && <p className="form_error-message">{error}</p>}

        {isLoading ? (
          <div className="admin_dashboard-card">
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <section className="admin_dashboard-stats">
              {dashboardStats.map((stat) => (
                <article className="admin_dashboard-stat" key={stat.label}>
                  <h4>{stat.label}</h4>
                  <p>{stat.value}</p>
                </article>
              ))}
            </section>

            <section className="admin_dashboard-grid">
              <article className="admin_dashboard-card">
                <h4>Pending Approvals</h4>
                {pendingUsers.length === 0 ? (
                  <p>No pending users.</p>
                ) : (
                  <div className="admin_dashboard-list">
                    {pendingUsers.map((user) => (
                      <div key={user._id} className="admin_dashboard-list-item">
                        <div>
                          <h5>{user.fullName || 'Unnamed User'}</h5>
                          <small>{user.email}</small>
                        </div>
                        <button className="btn small" type="button" onClick={() => openUserModal(user)}>
                          Review User
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="admin_dashboard-card">
                <h4>Recent Audit Logs</h4>
                {recentLogs.length === 0 ? (
                  <p>No audit logs found.</p>
                ) : (
                  <div className="admin_dashboard-list">
                    {recentLogs.map((log) => (
                      <div key={log._id} className="admin_dashboard-list-item">
                        <div>
                          <h5>{log.action}</h5>
                          <small>{new Date(log.createdAt).toLocaleString()}</small>
                        </div>
                        <small>{log.actorRole || 'system'}</small>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </div>

      <AdminUserModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onApprove={approveUser}
        approvingUserId={approvingUserId}
      />
    </section>
  )
}

export default AdminDashboard
