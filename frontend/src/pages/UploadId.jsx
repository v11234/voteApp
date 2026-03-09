import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

function UploadId() {
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  const token = query.get('token') || ''
  const presetEmail = query.get('email') || ''
  const presetFullName = query.get('fullName') || ''

  const [formData, setFormData] = useState({
    fullName: presetFullName,
    idNumber: '',
    email: presetEmail,
  })
  const [idCardFile, setIdCardFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const submitId = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Verification session expired. Please verify your email again.')
      return
    }

    if (!idCardFile) {
      setError('Please upload your ID card image.')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = new FormData()
      payload.append('fullName', formData.fullName)
      payload.append('idNumber', formData.idNumber)
      payload.append('idCard', idCardFile)

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/voters/submit-id`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setSuccess(response.data?.message || 'ID card submitted successfully. Await admin approval.')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      setError(err?.response?.data?.message || 'ID card submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth_page auth_page-register">
      <div className="container auth_page-container">
        <aside className="auth_pitch auth_pitch-register">
          <p className="auth_pitch-badge">Identity Check</p>
          <h1>Upload Your ID Card To Complete Verification</h1>
          <p>
            We use this step to match your submitted information and prevent fraudulent registrations.
          </p>
          <div className="auth_pitch-steps">
            <article><span>1</span><p>Confirm full name</p></article>
            <article><span>2</span><p>Enter ID number</p></article>
            <article><span>3</span><p>Upload clear ID image</p></article>
          </div>
        </aside>

        <article className="auth_card">
          <div className="auth_card-head">
            <h2>Upload ID Card</h2>
            <p>Submit your details exactly as they appear on your ID.</p>
          </div>

          <form onSubmit={submitId}>
            {error && <p className="form_error-message">{error}</p>}
            {success && <p className="form_success-message">{success}</p>}

            <label htmlFor="id-email">Email Address</label>
            <input
              id="id-email"
              type="email"
              name="email"
              value={formData.email}
              disabled
            />

            <label htmlFor="id-fullname">Full Name</label>
            <input
              id="id-fullname"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <label htmlFor="id-number">ID Number</label>
            <input
              id="id-number"
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="National ID / Passport Number"
              required
            />

            <label htmlFor="id-card">ID Card Image</label>
            <input
              id="id-card"
              type="file"
              accept="image/*"
              onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
              required
            />

            <button type="submit" className="btn primary full auth_submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit ID For Verification'}
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}

export default UploadId
