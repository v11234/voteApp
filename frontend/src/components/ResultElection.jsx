import { useEffect, useEffectEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useSelector } from 'react-redux'
import CandidateRating from './CandidateRating'
import Loader from './Loader'
import socket from '../socket'

function ResultElection({ _id: id, thumbnail, title }) {
  const [totalVotes, setTotalVotes] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [electionCandidates, setElectionCandidates] = useState([])
  const token = useSelector((state) => state?.vote?.currentVoter?.token)

  const getCandidate = useEffectEvent(async () => {
    setIsLoading(true)

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections/${id}/candidates`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      })

      const candidates = response.data
      setElectionCandidates(candidates)
      setTotalVotes(candidates.reduce((acc, candidate) => acc + (candidate.voteCount || 0), 0))
    } catch (error) {
      console.error(error)
    }

    setIsLoading(false)
  })

  useEffect(() => {
    if (token) {
      getCandidate()
    }
  }, [id, token])

  useEffect(() => {
    if (!token) return

    if (!socket.connected) {
      socket.connect()
    }

    const handler = (payload) => {
      if (payload?.electionId === id) {
        const candidates = payload.candidates || []
        setElectionCandidates(candidates)
        setTotalVotes(candidates.reduce((acc, candidate) => acc + (candidate.voteCount || 0), 0))
      }
    }

    socket.on('vote_update', handler)
    return () => {
      socket.off('vote_update', handler)
    }
  }, [id, token])

  if (isLoading) {
    return <Loader />
  }

  return (
    <article className="result">
      <header className="result_header">
        <h4>{title}</h4>
        <div className="result_header-image">
          <img src={thumbnail} alt={title} />
        </div>
      </header>
      <ul className="result_list">
        {electionCandidates.map((candidate) => <CandidateRating key={candidate._id} {...candidate} totalVotes={totalVotes} />)}
      </ul>
      <Link to={`/elections/${id}/candidates`} className="btn primary full">Enter Elections</Link>
    </article>
  )
}

export default ResultElection
