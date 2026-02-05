import React, { useEffect, useState } from 'react'
// import { elections} from "../data"
// import { candidates } from '../data'
// import { voters } from '../data'
import { Navigate, useNavigate, useParams } from "react-router-dom"
import ElectionCandidate from '../components/ElectionCandidate'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { uiActions } from '../store/ui-slice'
import AddCandidateModal from '../components/AddCandidateModal'
import axios from 'axios'
import { voteActions } from '../store/vote-lice'
function ElectionDetails() {
  const token=useSelector(state=>state?.vote?.currentVoter?.token);
   const navigate=useNavigate()
   //access control
    //access control
   useEffect(()=>{
    if(!token){
      navigate('/')
    }
   },[])










  const [isLoading, setIsLoading] = useState(false)
  const [election, setElection] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const { id } = useParams()
  const dispatch = useDispatch();
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);



  //add modal election
  const addCandidateModalShowing = useSelector(state => state.ui.addCandidateModalShowing);
  //open add candidate modal
  const openModal = () => {
    dispatch(uiActions.openAddCandidateModal());
    dispatch(voteActions.changeAddCandidateElectionId(id))
  }


  const getElections = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections/${id}`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
      setElection(await response.data)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  const getCandidates = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections/${id}/candidates`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
      setCandidates(await response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getVoters = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections/${id}/voters`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
      setVoters(await response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const deleteElection = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/elections/${id}`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
      navigate('/elections')
    } catch (error) {
      console.log(error)
    }
  }



  useEffect(() => {
    getElections()
    getCandidates()
    getVoters()
  }, [])
  return (
    <>
      <section className="electionDetails">
        <div className="conatainer electionDetail_container">
          <h2>{election.title}</h2>
          <p>{election.description}</p>
          <div className="electionDetails_image">
            <img src={election.thumbnail} alt={election.title} />
          </div>

          <menu className="electionDetails_candidates">
            {candidates.map(candidate => <ElectionCandidate key={candidate._id} {...candidate} />)}
            {isAdmin && <button className="add_candidate_btn" onClick={openModal}><IoMdAddCircleOutline /></button>}
          </menu>

          <menu className="voters">
            <h2>Voters</h2>
            <table className='voters_table'>
              <thead>
                <th><h5>Full Name</h5></th>
                <th><h5>Email</h5></th>
                <th><h5>Time</h5></th>
                {voters.map(voter => <tr key={voter._id}>
                  <td><h5>{voter.fullName}</h5></td>
                  <td><p>{voter.email}</p></td>
                  <td><p>{voter.createdAt}</p>t</td>
                </tr>
                )}
              </thead>

            </table>
          </menu>
          {isAdmin && <button className="btn danger full" onClick={deleteElection}>Delete Election</button>}
        </div>
      </section>


      {addCandidateModalShowing && <AddCandidateModal />}
    </>

  )
}

export default ElectionDetails