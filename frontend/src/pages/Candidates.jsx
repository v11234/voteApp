import { useEffect, useEffectEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// import {candidates as dummyCandidate} from '../data'
import Candidate from '../components/Candidate';
import ConfirmVote from '../components/ConfirmVote';
import { useSelector } from 'react-redux';
import axios from 'axios';


function Candidates() {
 const token=useSelector(state=>state?.vote?.currentVoter?.token);
   const navigate=useNavigate()
   //access control
    //access control
   useEffect(()=>{
    if(!token){
      navigate('/')
    }
   },[token,navigate])
 const [candidates,setCandidate]=useState([])
  const {id:selectedElection}=useParams();
  const [canVote,setCanVote]=useState(true)

 const voterId=useSelector(state=>state?.vote?.currentVoter?.id);
  const voteCandidateModalShowing=useSelector(state=> state.ui.voteCandidateModalShowing);
   const getCandidates = useEffectEvent(async () => {
try {
    const responds= await axios.get(`${import.meta.env.VITE_API_URL}/elections/${selectedElection}/candidates`,{withCredentials:true,headers:{Authorization:`Bearer ${token}`}});
    const candidates=await responds.data
    setCandidate(candidates)
     
} catch (error) {
    console.error(error)
}})
 

//CHECK IF VOTER HAS ALREDY VOTED

const getVoter = useEffectEvent(async () => {
  try {
     const responds= await axios.get(`${import.meta.env.VITE_API_URL}/voters/${voterId}`,{withCredentials:true,headers:{Authorization:`Bearer ${token}`}});
     const votedElections=await responds.data.votedElections;
     setCanVote(!votedElections.includes(selectedElection))
  } catch (error) {
    console.error(error)
  }
})




 useEffect(()=>{
    if(token){
      getCandidates();
      getVoter()
    }
   },[selectedElection, token, voterId]);
  return (
    <>
 <section className="candidates">
  {!canVote ?
   <header className="candidates_header">
    <h2 className="candidates_title">Already voted</h2>
    <p>You are only permitted to vote once in each election. Please vote in another election.</p>
  </header>
  
  :<>
 {candidates.length > 0   ?  <header className="candidates_header">
    <h2 className="candidates_title">Vote your candidate</h2>
    <p>These are candidates for the election. Please vote once and wisely, because you won't be allowed to vote in this election again.</p>

  </header>: <header className="candidates_header">
    <h2 className="candidates_title">Inactive Election</h2>
    <p>There are no candidates for this election please try again later</p>

  </header>}
  <div className="container candidates_container">
{
  candidates.map(candidate=><Candidate key={candidate._id} {...candidate}/>)
}
  </div>
  </>}
 </section>
 {voteCandidateModalShowing && <ConfirmVote  selectedElection={selectedElection}/>}
 </>

  )
}

export default Candidates
