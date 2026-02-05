import React from 'react'
import { useDispatch } from 'react-redux'
import { uiActions } from '../store/ui-slice'
import { voteActions } from '../store/vote-lice'


function Candidate({image,_id:id,fullName,moto}) {

      const dispatch=useDispatch()

    //open CONFIRM VOTE MODAL

    const openCandidate=()=>{
        dispatch(uiActions.openVoteCandidateModal());
        dispatch(voteActions.changeSelectedVoteCandidate(id));  
    }
  return (
    <article className="candidate">
        <div className="candidate_image">
            <img src={image} alt={fullName}/>
        </div>
        <h5>{fullName?.length>20 ?fullName.substring(0,20) +"...":fullName}</h5>
        <small>{moto?.length>25 ?moto.substring(0,25) +"...":moto}</small>
        <button className='btn primary' onClick={openCandidate}>Vote</button>

    </article>
  )
}

export default Candidate