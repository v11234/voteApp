import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom'

function Congrats() {
  const token=useSelector(state=>state?.vote?.currentVoter?.token);
   const navigate=useNavigate()
   //access control
    //access control
   useEffect(()=>{
    if(!token){
      navigate('/')
    }
   },[])
  return (
 <section className="congrats">
    <div className="container congrats_container">
        <h2>Thanks for your vote!</h2>
        <p>Your vote has been successfully recorded.Thank you for participating in the election process.</p>
        <Link to="/results" className='btn sm primary'>See Results</Link>
    </div>

 </section>
  )
}

export default Congrats