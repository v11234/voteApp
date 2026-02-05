import React, { useEffect, useState } from 'react'
// import { candidates } from '../data'
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/ui-slice';
import axios from 'axios';
import { voteActions } from '../store/vote-lice';
import {useNavigate} from "react-router-dom"


function ConfirmVote({selectedElection}) {
    const [modalCandidate,setModalCandidate]=useState({});
    const dispatch=useDispatch()
     const token=useSelector(state=>state?.vote?.currentVoter?.token);
   const currentVoterId=useSelector(state=>state?.vote?.currentVoter);
 
   const navigate=useNavigate()

    //CLOSE CONFIRM VOTE MODAL

    const closeCandidate=()=>{
        dispatch(uiActions.closeVoteCandidateModal())
    }

    //get selected candidate id from redux store

    const selectedVoteCandidate=useSelector(state=> state.vote.selectedVoteCandidate);

    //GET SELECTED CANDIDATE 

    const fetchCandidate=async()=>{
     try {
         const responds= await axios.get(`${import.meta.env.VITE_API_URL}/candidates/${selectedVoteCandidate}`,{withCredentials:true,headers:{Authorization:`Bearer ${token}`}});
    
    setModalCandidate(await responds.data)
     } catch (error) {
        console.error(error)
     }
    }

    //confirm vote for a selected candidate
     const confirmVote=async()=>{
     try {
    const responds= await axios.patch(`${import.meta.env.VITE_API_URL}/candidates/${selectedVoteCandidate}`,{selectedElection},{withCredentials:true,headers:{Authorization:`Bearer ${token}`}});
    const voteResult=await responds.data;
   
    dispatch(voteActions.changeCurrentVoter({...currentVoterId,votedElections:voteResult}))
    navigate('/congrats')
  
     } catch (error) {
        console.error(error)
     }
     closeCandidate()
    }

    useEffect(()=>{
        fetchCandidate()
    },[])
  return (
    <div>
        <section className="modal">
          <div className="modal_content confirm_vote-content">
            <h5>Please confirm your vote</h5>
            <div className="confirm_vote-image">
            <img src={modalCandidate.image} alt={modalCandidate.fullName} />
            </div>
            <h2>{modalCandidate.fullName?.length>17 ? modalCandidate.fullName?.substring(0,17) + "..." : modalCandidate.fullName}</h2>
           <p>{modalCandidate.moto?.length>17 ? modalCandidate.moto?.substring(0,45) + "..." : modalCandidate.moto}</p>
            
            <div className="confirm_vote-cta">
                <button className="btn" onClick={closeCandidate}>Cancel</button>
                  <button className="btn primary" onClick={confirmVote}>Confirm</button>

            </div>
            </div>  
        </section>
    </div>
  )
}

export default ConfirmVote