import React, { useEffect, useEffectEvent, useState } from 'react'
// import { elections as dummyElections } from '../data'
import Election from '../components/Election';
import AddElectionModal from '../components/AddElectionModal';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/ui-slice';
import UpdateElectionModal from '../components/UpdateElectionModal';
import Loader from '../components/Loader'
import axios from 'axios';
import {useNavigate } from 'react-router-dom';
function Elections() {

   const token=useSelector(state=>state?.vote?.currentVoter?.token);
   const navigate=useNavigate()
   //access control
    //access control
   useEffect(()=>{
    if(!token){
      navigate('/')
    }
   },[token,navigate])

  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  //open elections modal
  const dispatch = useDispatch();
  const openModal = () => {
    dispatch(uiActions.openElectionModal());

  }

  const electionModalShowing = useSelector(state => state.ui.electionModalShowing);
  const updateElectionModalShowing = useSelector(state => state.ui.updateElectionModalShowing);
 const isAdmin=useSelector(state=>state?.vote?.currentVoter?.isAdmin);

  const getElections = useEffectEvent(async () => {
    setIsLoading(true)
    try {

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/elections`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
      setElections(await response.data)



    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  })
useEffect(()=>{
if(token){
  getElections()
}
},[token])

  return (
    <>
      <section className="elections">
        <div className="container elections_container">
          <header className="elections_header">
            <h1>Ongoing Elections</h1>
           {isAdmin && <button className="btn primary" onClick={openModal}>Create New Election</button>}
          </header>

         {isLoading ? <Loader/> :<menu className="election_menu">
            {elections.map(election => <Election key={election._id} {...election} />)}
          </menu>}
        </div>

      </section>
      {electionModalShowing && <AddElectionModal />}
      {updateElectionModalShowing && <UpdateElectionModal />}
    </>
  )
}

export default Elections
