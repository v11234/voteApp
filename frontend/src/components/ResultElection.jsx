import { useState } from 'react'
import { candidates } from '../data'
import CandidateRating from './CandidateRating';
import {Link } from 'react-router-dom';

function ResultElection({id,thumbnail,title,}) {
    const [totalVotes, setTotalVotes] = useState(6000);
    //get cadidate that belong to this election
    const electionCandidates = candidates.filter(candidate => {return candidate.election ==id});
  return (
   <article className="result">
    <header className="result_header">
        <h4>{title}</h4>
        <div className="result_header-image">
            <img src={thumbnail} alt={title} />
        </div>
        
    </header>
     <ul className='result_list'>
            {
                electionCandidates.map(candidate =><CandidateRating key={candidate.id} {...candidate} totalVotes={totalVotes}/>)
            }
        </ul>
        <Link to={`/elections/${id}/candidates`} className="btn primary full">Enter Elections</Link>
       
   </article>
  )
}

export default ResultElection