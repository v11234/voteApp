import React from 'react'
import { elections} from "../data"
import { candidates } from '../data'
import { voters } from '../data'
import {useParams} from "react-router-dom"
import ElectionCandidate from '../components/ElectionCandidate'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../store/ui-slice'
import AddCandidateModal from '../components/AddCandidateModal'
function ElectionDetails() {
  const {id} = useParams()
  const dispatch=useDispatch();

  const currentElection=elections.find(elction=>elction.id==id);
  const electionCandidates=candidates.filter(candidate=>candidate.election==id)

  //add modal election
  const addCandidateModalShowing=useSelector(state=> state.ui.addCandidateModalShowing);
//open add candidate modal
  const openModal=()=>{
    dispatch(uiActions.openAddCandidateModal());
  }
  return (
    <>
   <section className="electionDetails">
    <div className="conatainer electionDetail_container">
      <h2>{currentElection.title}</h2>
      <p>{currentElection.description}</p>
      <div className="electionDetails_image">
        <img src={currentElection.thumbnail} alt={currentElection.title} />
      </div>

      <menu className="electionDetails_candidates">
        {electionCandidates.map(candidate=><ElectionCandidate key={candidate.id} {...candidate} />)}
        <button className="add_candidate_btn" onClick={openModal}><IoMdAddCircleOutline/></button>
         </menu>

         <menu className="voters">
        <h2>Voters</h2>
        <table className='voters_table'>
          <thead>
            <th><h5>Full Name</h5></th>
             <th><h5>Email</h5></th>
              <th><h5>Time</h5></th>
            {voters.map(voter=><tr key={voter.id}>
                <td><h5>{voter.fullName}</h5></td>
                <td><p>{voter.email}</p></td>
                <td>14:23:33</td>
                </tr>
              )}
          </thead>
            
        </table>
         </menu>
    </div>
   </section>
   {addCandidateModalShowing&&<AddCandidateModal />}
   </>
   
  )
}

export default ElectionDetails