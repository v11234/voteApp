import { useEffect, useState } from 'react'
// import { candidates } from '../data'
import CandidateRating from './CandidateRating';
import {Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loader from './Loader';
import socket from '../socket';

function ResultElection({_id:id,thumbnail,title}) {
    const [totalVotes, setTotalVotes] = useState(0);
     const token=useSelector(state=>state?.vote?.currentVoter?.token);
     const [isLoading,setIsLoading]=useState(false)
    //get candidates that belong to this election
    const[electionCandidates,setElectionCandidates]=useState([])

    const getCandidate = async () => {
  setIsLoading(true);

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/elections/${id}/candidates`,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const candidates = response.data;

    setElectionCandidates(candidates);

    // ✅ calculate total votes safely
    const total = candidates.reduce(
      (acc, candidate) => acc + (candidate.voteCount || 0),
      0
    );

    setTotalVotes(total);

  } catch (error) {
    console.error(error);
  }

  setIsLoading(false);
};


   useEffect(()=>{
    if(token){
      getCandidate()
    }
   },[id, token])

   useEffect(() => {
    if (!token) return;
    if (!socket.connected) {
      socket.connect();
    }
    const handler = (payload) => {
      if (payload?.electionId === id) {
        const candidates = payload.candidates || [];
        setElectionCandidates(candidates);
        const total = candidates.reduce(
          (acc, candidate) => acc + (candidate.voteCount || 0),
          0
        );
        setTotalVotes(total);
      }
    };
    socket.on("vote_update", handler);
    return () => {
      socket.off("vote_update", handler);
    };
  }, [id, token]);
  return (
    <>
    {isLoading ? <Loader/>:
   <article className="result">
    <header className="result_header">
        <h4>{title}</h4>
        <div className="result_header-image">
            <img src={thumbnail} alt={title} />
        </div>
        
    </header>
     <ul className='result_list'>
            {
                electionCandidates.map(candidate =><CandidateRating key={candidate._id} {...candidate} totalVotes={totalVotes}/>)
            }
        </ul>
        <Link to={`/elections/${id}/candidates`} className="btn primary full">Enter Elections</Link>
       
   </article>
}
   </>
  )
}

export default ResultElection
