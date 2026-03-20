import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import FaceCapture from '../components/FaceCapture'

const FACE_DESCRIPTOR_LENGTH = 128

function EnrollFace() {
  const navigate = useNavigate()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const email = query.get('email') || ''

  const [faceEmbedding, setFaceEmbedding] = useState([])
  const [faceImageData, setFaceImageData] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitEnrollment = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const token = localStorage.getItem('faceEnrollToken')
    if (!token) {
      setError('Face enrollment session expired. Please login again.')
      return
    }

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length !== FACE_DESCRIPTOR_LENGTH || !faceImageData) {
      setError('Please start camera and capture your face first.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/voters/enroll-face`,
        { faceEmbedding, faceImageData },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      localStorage.removeItem('faceEnrollToken')
      setSuccess(response.data?.message || 'Face enrolled successfully. Please login again.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || 'Face enrollment failed.')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth_page auth_page-register">
      <div className="container auth_page-container">
        <article className="auth_card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div className="auth_card-head">
            <h2>Enroll Face</h2>
            <p>{email ? `Complete one-time setup for ${email}.` : 'Complete one-time face setup for your account.'}</p>
          </div>

          <form onSubmit={submitEnrollment}>
            {error && <p className="form_error-message">{error}</p>}
            {success && <p className="form_success-message">{success}</p>}

            <FaceCapture
              onCapture={({ embedding, faceImageData: imageData }) => {
                setFaceEmbedding(embedding)
                setFaceImageData(imageData)
                setError('')
              }}
              label="Face Enrollment"
              buttonText="Capture Enrollment Face"
              previewText="Face ready for enrollment"
            />

            <button type="submit" className="btn primary full auth_submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Face Enrollment'}
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}

export default EnrollFace
