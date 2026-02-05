import React, { useEffect, useId } from 'react'
import { useDispatch } from 'react-redux'
import { voteActions } from '../store/vote-lice'
import { useNavigate } from 'react-router-dom'

function Logout() {
  const dispatch=useDispatch()
  const navigate=useNavigate()


  useEffect(()=>{
    dispatch(voteActions.changeCurrentVoter(null))
    localStorage.removeItem("currentUser");
    navigate('/')

  },[])
  return (
   <></>
  )
}

export default Logout