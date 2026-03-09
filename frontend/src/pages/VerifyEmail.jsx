import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const presetEmail = query.get('email') || ''
  const [email, setEmail] = useState(presetEmail)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isResending, setIsResending] = useState(false)

  const normalizeOtp = (value) => value.replace(/\D/g, '').slice(0, 6)

  const verifyEmail = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = normalizeOtp(otp)

    if (cleanOtp.length !== 6) {
      setError('Enter the 6-digit OTP code.')
      return
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/voters/verify-email`, {
        email: cleanEmail,
        otp: cleanOtp
      })

      const payload = response.data || {}
      setSuccess(payload?.message || 'Email verified successfully.')

      if (payload?.requiresIdUpload && payload?.idUploadToken) {
        const nextEmail = encodeURIComponent(payload.email || cleanEmail)
        const nextFullName = encodeURIComponent(payload.fullName || '')
        const nextToken = encodeURIComponent(payload.idUploadToken)
        setTimeout(() => navigate(`/upload-id?token=${nextToken}&email=${nextEmail}&fullName=${nextFullName}`), 1200)
        return
      }

      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed')
    }
  }

  const resendOtp = async () => {
    setError('')
    setSuccess('')
    setIsResending(true)
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/voters/resend-otp`, {
        email: email.trim().toLowerCase()
      })
      setSuccess(response.data?.message || 'OTP resent. Please check your email.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section className='register'>
      <div className="container register_container">
        <h2>Verify Email</h2>
        <form onSubmit={verifyEmail}>
          {error && <p className="form_error-message">{error}</p>}
          {success && <p className="form_success-message">{success}</p>}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="OTP Code"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(normalizeOtp(e.target.value))}
            required
          />
          <button type="submit" className="btn primary">Verify</button>
          <button type="button" className="btn" onClick={resendOtp} disabled={isResending}>
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default VerifyEmail
