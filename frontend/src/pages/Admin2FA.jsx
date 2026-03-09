import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { voteActions } from '../store/vote-lice'

function Admin2FA() {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const normalizeOtp = (value) => value.replace(/\D/g, '').slice(0, 6)

  const verify2FA = async (e) => {
    e.preventDefault()
    setError('')
    const tempToken = localStorage.getItem('admin2faToken')
    if (!tempToken) {
      setError('2FA session expired. Please login again.')
      return
    }

    const cleanOtp = normalizeOtp(otp)
    if (cleanOtp.length !== 6) {
      setError('Enter the 6-digit OTP code.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/voters/verify-2fa`,
        { otp: cleanOtp },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      )
      const newVoter = response.data
      localStorage.removeItem('admin2faToken')
      localStorage.setItem("currentUser", JSON.stringify(newVoter))
      dispatch(voteActions.changeCurrentVoter(newVoter))
      navigate(newVoter?.isAdmin ? '/admin' : '/results')
    } catch (err) {
      setError(err?.response?.data?.message || '2FA verification failed')
    }
  }

  return (
    <section className='register'>
      <div className="container register_container">
        <h2>Admin 2FA</h2>
        <form onSubmit={verify2FA}>
          {error && <p className="form_error-message">{error}</p>}
          <input
            type="text"
            placeholder="Enter OTP code"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(normalizeOtp(e.target.value))}
            required
          />
          <button type="submit" className="btn primary">Verify</button>
        </form>
      </div>
    </section>
  )
}

export default Admin2FA
