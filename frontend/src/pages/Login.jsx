import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { voteActions } from '../store/vote-lice'
import FaceCapture from '../components/FaceCapture'

function Login() {
  const [userData, setUserData] = useState({ email: '', password: '', faceEmbedding: [] })
  const [error, setError] = useState('')
  const [isSigning, setIsigning] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const changeInputHandler = (e) => {
    setUserData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value }
    })
  }

  const handleFaceCapture = ({ embedding }) => {
    setUserData((prevState) => ({ ...prevState, faceEmbedding: embedding }))
    setError('')
  }

  const loginVoter = async (e) => {
    e.preventDefault()
    try {
      setIsigning(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/voters/login`, userData)
      const newVoter = response.data

      if (newVoter?.requiresFaceEnrollment && newVoter?.faceEnrollToken) {
        localStorage.setItem('faceEnrollToken', newVoter.faceEnrollToken)
        const nextEmail = encodeURIComponent(newVoter.email || userData.email || '')
        navigate(`/enroll-face?email=${nextEmail}`)
        return
      }

      if (newVoter?.requires2FA) {
        localStorage.setItem('admin2faToken', newVoter.tempToken)
        navigate('/admin-2fa')
        return
      }

      localStorage.setItem('currentUser', JSON.stringify(newVoter))
      dispatch(voteActions.changeCurrentVoter(newVoter))
      navigate('/results')
    } catch (err) {
      const payload = err?.response?.data || {}
      if (payload?.requiresIdUpload && payload?.idUploadToken) {
        const nextEmail = encodeURIComponent(payload.email || userData.email || '')
        const nextFullName = encodeURIComponent(payload.fullName || '')
        const nextToken = encodeURIComponent(payload.idUploadToken)
        navigate(`/upload-id?token=${nextToken}&email=${nextEmail}&fullName=${nextFullName}`)
        return
      }

      setError(payload?.message || 'Login failed')
      setIsigning(false)
    }
  }

  return (
    <section className="auth_page auth_page-login">
      <div className="container auth_page-container">
        <aside className="auth_pitch">
          <p className="auth_pitch-badge">Voter Portal</p>
          <h1>Track Elections. Vote Securely. Stay Informed.</h1>
          <p>
            Your dashboard gives you realtime election visibility with secure ballot protection and account verification.
          </p>
          <div className="auth_pitch-metrics">
            <article>
              <strong>Realtime</strong>
              <small>Live candidate movement</small>
            </article>
            <article>
              <strong>Encrypted</strong>
              <small>Protected ballot records</small>
            </article>
            <article>
              <strong>Trusted</strong>
              <small>Verified voter access</small>
            </article>
          </div>
        </aside>

        <article className="auth_card">
          <div className="auth_card-head">
            <h2>Login</h2>
            <p>Access your account to continue.</p>
          </div>

          <form onSubmit={loginVoter}>
            {error && <p className="form_error-message">{error}</p>}

            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              onChange={changeInputHandler}
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter password"
              autoComplete="current-password"
              onChange={changeInputHandler}
              required
            />

            <FaceCapture
              onCapture={handleFaceCapture}
              label="Face Verification"
              buttonText="Capture Login Face"
              previewText="Face scan ready"
            />

            <button type="submit" className="btn primary full auth_submit-btn">
              {isSigning ? 'Logging in...' : 'Login To Dashboard'}
            </button>

            <p className="auth_switch-text">
              Need an account? <Link to="/register">Create one</Link>
            </p>
          </form>
        </article>
      </div>
    </section>
  )
}

export default Login
