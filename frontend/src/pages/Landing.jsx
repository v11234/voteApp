import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import socket from '../socket'

function Landing() {
  const token = useSelector(state => state?.vote?.currentVoter?.token)
  const navigate = useNavigate()

  const [elections, setElections] = useState([])
  const [totalEligibleVoters, setTotalEligibleVoters] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [expandedElectionId, setExpandedElectionId] = useState('')
  const [candidatesByElection, setCandidatesByElection] = useState({})
  const [candidateLoadByElection, setCandidateLoadByElection] = useState({})

  const fetchPublicElections = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections/public`, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      const payload = response.data

      if (Array.isArray(payload)) {
        setElections(payload)
        setTotalEligibleVoters(0)
      } else {
        setElections(payload?.elections || [])
        setTotalEligibleVoters(payload?.totalEligibleVoters || 0)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load elections preview.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/results')
    }
  }, [token, navigate])

  useEffect(() => {
    fetchPublicElections()
  }, [])

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    const handler = (payload) => {
      if (!payload?.electionId) {
        return
      }

      setCandidatesByElection(prev => ({
        ...prev,
        [payload.electionId]: payload.candidates || [],
      }))
    }

    socket.on('vote_update', handler)

    return () => {
      socket.off('vote_update', handler)
      socket.disconnect()
    }
  }, [])

  const previewElections = useMemo(() => elections.slice(0, 6), [elections])

  const fetchCandidatesForElection = async (electionId) => {
    setCandidateLoadByElection(prev => ({ ...prev, [electionId]: true }))

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections/${electionId}/candidates/public`)
      setCandidatesByElection(prev => ({ ...prev, [electionId]: response.data || [] }))
    } catch {
      setCandidatesByElection(prev => ({ ...prev, [electionId]: [] }))
    } finally {
      setCandidateLoadByElection(prev => ({ ...prev, [electionId]: false }))
    }
  }

  const handleToggleCandidates = async (electionId) => {
    if (expandedElectionId === electionId) {
      setExpandedElectionId('')
      return
    }

    setExpandedElectionId(electionId)

    if (!candidatesByElection[electionId]) {
      await fetchCandidatesForElection(electionId)
    }
  }

  return (
    <section className="landing">
      <div className="container landing_container">
        <header className="landing_hero">
          <p className="landing_badge">Secure Digital Voting</p>
          <h1>Preview Ongoing Elections Before You Sign In</h1>
          <p>
            Open each election to see candidate percentages in real time. Login or register to join voting.
          </p>
          <div className="landing_cta">
            <Link to="/login" className="btn primary">Login</Link>
            <Link to="/register" className="btn">Register</Link>
          </div>
        </header>

        <section className="landing_preview">
          <h2>Ongoing Elections</h2>
          <p className="landing_meta">Eligible voters: {totalEligibleVoters || 0}</p>
          {error && (
            <>
              <p className="form_error-message">{error}</p>
              <button type="button" className="btn" onClick={fetchPublicElections}>Retry Preview</button>
            </>
          )}
          {isLoading ? (
            <p>Loading elections...</p>
          ) : previewElections.length === 0 ? (
            <p>No ongoing elections right now.</p>
          ) : (
            <div className="landing_elections-grid">
              {previewElections.map(election => {
                const voters = election.voters?.length || 0
                const turnoutPercentage = totalEligibleVoters > 0
                  ? Math.round((voters / totalEligibleVoters) * 100)
                  : 0

                const candidates = candidatesByElection[election._id] || []
                const totalCandidateVotes = candidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0)
                const isExpanded = expandedElectionId === election._id
                const candidateLoading = candidateLoadByElection[election._id]

                return (
                  <article className="landing_election-card" key={election._id}>
                    <div className="landing_election-image">
                      <img src={election.thumbnail} alt={election.title} />
                    </div>
                    <div className="landing_election-info">
                      <h4>{election.title}</h4>
                      <p>{election.description}</p>
                      <div className="landing_turnout-row">
                        <small>{voters} voters participated</small>
                        <small>{turnoutPercentage}% turnout</small>
                      </div>
                      <div className="landing_turnout-track">
                        <span style={{ width: `${Math.min(turnoutPercentage, 100)}%` }} />
                      </div>

                      <button
                        type="button"
                        className="landing_view-candidates"
                        onClick={() => handleToggleCandidates(election._id)}
                      >
                        {isExpanded ? 'Hide Candidate Percentages' : 'View Candidate Percentages'}
                      </button>

                      {isExpanded && (
                        <div className="landing_candidate-panel">
                          {candidateLoading ? (
                            <p>Loading candidates...</p>
                          ) : candidates.length === 0 ? (
                            <p>No candidates found.</p>
                          ) : (
                            candidates.map(candidate => {
                              const percent = totalCandidateVotes > 0
                                ? Math.round((candidate.voteCount / totalCandidateVotes) * 100)
                                : 0

                              return (
                                <div className="landing_candidate-item" key={candidate._id}>
                                  <div className="landing_candidate-head">
                                    <span>{candidate.fullName}</span>
                                    <strong>{percent}%</strong>
                                  </div>
                                  <small>{candidate.voteCount || 0} votes</small>
                                  <div className="landing_candidate-bar">
                                    <span style={{ width: `${Math.min(percent, 100)}%` }} />
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default Landing
