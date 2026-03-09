import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { voteActions } from '../store/vote-lice'
import { useNavigate } from 'react-router-dom'

function Logout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(voteActions.changeCurrentVoter(null))
    localStorage.removeItem('currentUser')
    localStorage.removeItem('admin2faToken')
    localStorage.removeItem('faceEnrollToken')
    navigate('/')
  }, [dispatch, navigate])

  return <></>
}

export default Logout
