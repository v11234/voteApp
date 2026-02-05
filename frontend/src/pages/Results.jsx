import  { useEffect, useState } from 'react'
// import { elections as dummyElections } from '../data';
import ResultElection from '../components/ResultElection';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

 function  Results() {

 const token=useSelector(state=>state?.vote?.currentVoter?.token);
 const navigate=useNavigate()
   //access control
    //access control
   useEffect(()=>{
    if(!token){
      navigate('/')
    }
   },[])



  const [elections, setElections] = useState([]);
  const getElections=async()=>{
    try {
     
    const responds= await axios.get(`${import.meta.env.VITE_API_URL}/elections`,{withCredentials:true,headers:{Authorization:`Bearer ${token}`}});
    const elections=await responds.data
   
    setElections(elections)
      
  } catch (error) {
    console.error(error)
  }

  }


  useEffect(()=>{
    getElections()
  },[])
  return (
 <section className="results">
  <div className="container result_container">
    {
      elections.map(election=><ResultElection key={election._id} {...election}/>)
    }

  </div>

 </section>

  )
}

export default Results