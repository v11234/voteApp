import { useCallback, useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

const FACE_DETECTION_INTERVAL_MS = 900
const FACE_DESCRIPTOR_LENGTH = 128
const MODEL_URI = `${import.meta.env.BASE_URL}models`
const AUTO_DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.35 })
const MANUAL_DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.2 })

function FaceCapture({ onCapture, label = 'Face scan', buttonText = 'Capture Face', previewText = 'Face captured' }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const capturedRef = useRef(false)
  const detectingRef = useRef(false)
  const [error, setError] = useState('')
  const [captured, setCaptured] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [faceFound, setFaceFound] = useState(false)

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsCameraActive(false)
  }, [])

  const startCamera = useCallback(async () => {
    setError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => resolve()
        })
        await videoRef.current.play().catch(() => {})
      }

      setIsCameraActive(true)
      setFaceFound(false)
    } catch {
      setError('Camera access is required for face scan.')
      setIsCameraActive(false)
    }
  }, [])

  const detectAndCaptureFace = useCallback(async (manual = false) => {
    const video = videoRef.current

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      if (manual) {
        setError('Camera is not ready yet. Please try again.')
      }
      return
    }

    if (!isModelReady) {
      setError('Face recognition models are still loading.')
      return
    }

    if (detectingRef.current || capturedRef.current) {
      return
    }

    detectingRef.current = true
    setIsProcessing(true)

    try {
      const detectorOptions = manual ? MANUAL_DETECTOR_OPTIONS : AUTO_DETECTOR_OPTIONS
      const detection = await faceapi
        .detectSingleFace(video, detectorOptions)
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setFaceFound(false)
        if (manual) {
          setError('No face detected. Center your face in view and try again.')
        }
        return
      }

      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = video.videoWidth
      frameCanvas.height = video.videoHeight
      const frameCtx = frameCanvas.getContext('2d')
      frameCtx.drawImage(video, 0, 0, frameCanvas.width, frameCanvas.height)

      const box = detection.detection.box
      const pad = Math.min(box.width, box.height) * 0.25
      const cropX = Math.max(0, Math.floor(box.x - pad))
      const cropY = Math.max(0, Math.floor(box.y - pad))
      const cropWidth = Math.min(frameCanvas.width - cropX, Math.floor(box.width + pad * 2))
      const cropHeight = Math.min(frameCanvas.height - cropY, Math.floor(box.height + pad * 2))

      const previewCanvas = document.createElement('canvas')
      previewCanvas.width = 224
      previewCanvas.height = 224
      const previewCtx = previewCanvas.getContext('2d')
      previewCtx.drawImage(frameCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, 224, 224)

      const embedding = Array.from(detection.descriptor, (value) => Number(value.toFixed(6)))
      if (embedding.length !== FACE_DESCRIPTOR_LENGTH) {
        setError('Face descriptor generation failed. Please try again.')
        return
      }

      const faceImageData = previewCanvas.toDataURL('image/jpeg', 0.9)

      onCapture({ embedding, faceImageData })
      setCaptured(true)
      setFaceFound(true)
      setError('')
    } catch {
      setFaceFound(false)
      setError('Face recognition failed. Please try again.')
    } finally {
      detectingRef.current = false
      setIsProcessing(false)
    }
  }, [isModelReady, onCapture])

  useEffect(() => {
    capturedRef.current = captured
  }, [captured])

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URI),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URI),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URI),
        ])

        if (cancelled) {
          return
        }

        setIsModelReady(true)
        await startCamera()

        intervalRef.current = setInterval(() => {
          if (!capturedRef.current) {
            detectAndCaptureFace(false)
          }
        }, FACE_DETECTION_INTERVAL_MS)
      } catch {
        if (!cancelled) {
          setError('Failed to load face recognition models.')
        }
      }
    }

    init()

    return () => {
      cancelled = true
      stopCamera()
    }
  }, [detectAndCaptureFace, startCamera, stopCamera])

  const manualCapture = async () => {
    setCaptured(false)
    capturedRef.current = false
    await detectAndCaptureFace(true)
  }

  const resetCapture = () => {
    setCaptured(false)
    capturedRef.current = false
    setFaceFound(false)
    setError('')
  }

  const statusTone = error
    ? 'error'
    : captured
      ? 'success'
      : isProcessing
        ? 'scanning'
        : faceFound
          ? 'ready'
          : 'idle'

  const statusText = !isModelReady
    ? 'Loading secure scan engine'
    : error
      ? 'Scan unavailable'
      : captured
        ? 'Face scan locked in'
        : isProcessing
          ? 'Scanning face'
          : faceFound
            ? 'Face aligned'
            : 'Position face in frame'

  return (
    <div className="face_capture">
      <label>{label}</label>
      <div className={`face_capture-stage face_capture-stage-${statusTone}`}>
        <div className="face_capture-status">
          <span className="face_capture-status-dot" />
          <span>{statusText}</span>
        </div>
        <div className="face_capture-frame">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="face_capture-video"
          />
          <div className="face_capture-vignette" />
          <div className="face_capture-grid" />
          <div className="face_capture-oval" />
          <div className="face_capture-corners">
            <span />
            <span />
            <span />
            <span />
          </div>
          {isProcessing && <div className="face_capture-beam" />}
          <div className="face_capture-glow" />
        </div>
      </div>
      {error && <p className="form_error-message">{error}</p>}
      {captured && <p className="form_success-message">{previewText}</p>}
      {!isModelReady && <p className="face_capture-note">Loading face recognition models...</p>}
      {!captured && <p className="face_capture-note">{isProcessing ? 'Hold still while the scanner maps your face.' : 'Center your face inside the frame for the best match.'}</p>}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        {!isCameraActive && (
          <button type="button" className="btn" onClick={startCamera}>Start Camera</button>
        )}
        <button type="button" className="btn" onClick={manualCapture} disabled={!isModelReady || isProcessing}>
          {buttonText}
        </button>
        {captured && (
          <button type="button" className="btn" onClick={resetCapture}>
            Retake Face
          </button>
        )}
      </div>
      <small className="face_capture-note">
        Keep your face centered, remove harsh backlight, and look straight at the camera. Manual capture uses a more permissive detector pass.
      </small>
    </div>
  )
}

export default FaceCapture
