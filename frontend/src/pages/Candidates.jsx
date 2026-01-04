import React from 'react'
import { useParams } from 'react-router-dom'
import {candidates as dummyCandidate} from '../data'
import Candidate from '../components/Candidate';

function Candidates() {
  const {id}=useParams();
  //GET CANDIDATE THAT BELONG TO THISID
  const candidates=dummyCandidate.filter(candidate=>candidate.election==id)
  return (
 <section className="candidates">
  <header className="candidates_header">
    <h2 className="candidates_title">Vote your candidate</h2>
    <p>These are candidate for the election.Please vote once and wisely,because you won't be allow to vote in this election again</p>

  </header>
  <div className="container candidates_container">
{
  candidates.map(candidate=><Candidate key={candidate.id} {...candidate}/>)
}
  </div>
 </section>
  )
}

export default Candidates