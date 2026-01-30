import React, { useEffect, useState } from 'react'
import { candidates } from '../data'
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/ui-slice';


function ConfirmVote() {
    const [modalCandidate,setModalCandidate]=useState({});
    const dispatch=useDispatch()

    //CLOSE CONFIRM VOTE MODAL

    const closeCandidate=()=>{
        dispatch(uiActions.closeVoteCandidateModal())
    }

    //get selected candidate id from redux store

    const selectedVoteCandidate=useSelector(state=> state.vote.selectedVoteCandidate);

    //GET SELECTED CANDIDATE 

    const fetchCandidate=()=>{
        candidates.find(candidate=>{
            if(candidate.id==selectedVoteCandidate){
                setModalCandidate(candidate)
            }
        })
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
                  <button className="btn primary">Confirm</button>

            </div>
            </div>  
        </section>
    </div>
  )
}

export default ConfirmVote