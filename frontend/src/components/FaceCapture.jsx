import { useEffect, useRef, useState } from 'react'

const EMBEDDING_SIZE = 16

function FaceCapture({ onCapture, label = 'Face scan', buttonText = 'Capture Face', previewText = 'Face captured' }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [captured, setCaptured] = useState(false)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError('Camera access is required for face scan.')
    }
  }

  const toEmbedding = (imageData) => {
    const values = []
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      values.push(gray)
    }

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    const centered = values.map((value) => value - mean)
    const norm = Math.sqrt(centered.reduce((sum, value) => sum + value * value, 0)) || 1

    return centered.map((value) => Number((value / norm).toFixed(6)))
  }

  const captureFace = async () => {
    setError('')
    const video = videoRef.current
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is not ready yet. Please try again.')
      return
    }

    const frameCanvas = document.createElement('canvas')
    frameCanvas.width = video.videoWidth
    frameCanvas.height = video.videoHeight
    const frameCtx = frameCanvas.getContext('2d', { willReadFrequently: true })
    frameCtx.drawImage(video, 0, 0)

    let x = 0
    let y = 0
    let width = frameCanvas.width
    let height = frameCanvas.height

    if ('FaceDetector' in window) {
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
        const faces = await detector.detect(frameCanvas)
        if (faces?.length) {
          const box = faces[0].boundingBox
          x = Math.max(0, Math.floor(box.x))
          y = Math.max(0, Math.floor(box.y))
          width = Math.min(frameCanvas.width - x, Math.floor(box.width))
          height = Math.min(frameCanvas.height - y, Math.floor(box.height))
        }
      } catch {
        // Fallback to whole frame when FaceDetector is unavailable or blocked.
      }
    }

    const embeddingCanvas = document.createElement('canvas')
    embeddingCanvas.width = EMBEDDING_SIZE
    embeddingCanvas.height = EMBEDDING_SIZE
    const embeddingCtx = embeddingCanvas.getContext('2d', { willReadFrequently: true })
    embeddingCtx.drawImage(frameCanvas, x, y, width, height, 0, 0, EMBEDDING_SIZE, EMBEDDING_SIZE)

    const imageData = embeddingCtx.getImageData(0, 0, EMBEDDING_SIZE, EMBEDDING_SIZE)
    const embedding = toEmbedding(imageData)
    const faceImageData = embeddingCanvas.toDataURL('image/jpeg', 0.85)

    onCapture({ embedding, faceImageData })
    setCaptured(true)
  }

  return (
    <div className="face_capture">
      <label>{label}</label>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', borderRadius: '8px', marginBottom: '10px', background: '#111' }}
      />
      {error && <p className="form_error-message">{error}</p>}
      {captured && <p className="form_success-message">{previewText}</p>}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button type="button" className="btn" onClick={startCamera}>Start Camera</button>
        <button type="button" className="btn" onClick={captureFace}>{buttonText}</button>
      </div>
    </div>
  )
}

export default FaceCapture
