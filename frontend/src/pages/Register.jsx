import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import FaceCapture from '../components/FaceCapture'

const FACE_DESCRIPTOR_LENGTH = 128

function Register() {
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    password2: '',
    faceEmbedding: [],
    faceImageData: '',
  })
  const [error, setError] = useState('')
  const [isSigning, setIsigning] = useState(false)

  const navigate = useNavigate()

  const changeInputHandler = (e) => {
    setUserData((prevState) => {
      return { ...prevState, [e.target.name]: e.target.value }
    })
  }

  const handleFaceCapture = ({ embedding, faceImageData }) => {
    setUserData((prevState) => ({ ...prevState, faceEmbedding: embedding, faceImageData }))
    setError('')
  }

  const registerVoter = async (e) => {
    e.preventDefault()
    if (!Array.isArray(userData.faceEmbedding) || userData.faceEmbedding.length !== FACE_DESCRIPTOR_LENGTH || !userData.faceImageData) {
      setError('Please start camera and capture your face before registering.')
      return
    }

    try {
      setIsigning(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/voters/register`, userData)
      const email = response.data?.email || userData.email
      navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
      setIsigning(false)
    }
  }

  return (
    <section className="auth_page auth_page-register">
      <div className="container auth_page-container">
        <aside className="auth_pitch auth_pitch-register">
          <p className="auth_pitch-badge">Create Profile</p>
          <h1>Build Your Voter Identity In Minutes</h1>
          <p>
            Register once, verify your email code, and get approved to start participating in secure elections.
          </p>
          <div className="auth_pitch-steps">
            <article><span>1</span><p>Create account</p></article>
            <article><span>2</span><p>Enroll face scan</p></article>
            <article><span>3</span><p>Verify email OTP</p></article>
            <article><span>4</span><p>Get approved and vote</p></article>
          </div>
        </aside>

        <article className="auth_card">
          <div className="auth_card-head">
            <h2>Register</h2>
            <p>Create a new voter account.</p>
          </div>

          <form onSubmit={registerVoter}>
            {error && <p className="form_error-message">{error}</p>}

            <label htmlFor="register-name">Full Name</label>
            <input id="register-name" type="text" name="fullName" placeholder="Your full name" autoComplete="name" autoFocus onChange={changeInputHandler} required />

            <label htmlFor="register-email">Email Address</label>
            <input id="register-email" type="email" name="email" placeholder="you@example.com" autoComplete="email" onChange={changeInputHandler} required />

            <label htmlFor="register-password">Password</label>
            <input id="register-password" type="password" name="password" placeholder="Create password" autoComplete="new-password" onChange={changeInputHandler} required />

            <label htmlFor="register-password2">Confirm Password</label>
            <input id="register-password2" type="password" name="password2" placeholder="Repeat password" autoComplete="new-password" onChange={changeInputHandler} required />

            <FaceCapture onCapture={handleFaceCapture} label="Face Enrollment" buttonText="Capture Enrollment Face" previewText="Face enrolled for login" />

            <p className="auth_hint-text">
              Use 8+ characters with uppercase, lowercase, number, and special symbol.
            </p>

            <button type="submit" className="btn primary full auth_submit-btn">
              {isSigning ? 'Registering...' : 'Create Account'}
            </button>

            <p className="auth_switch-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </article>
      </div>
    </section>
  )
}

export default Register
