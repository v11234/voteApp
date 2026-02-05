import axios from 'axios';
import React from 'react'
import {IoMdTrash} from "react-icons/io"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function ElectionCandidate({_id:id, fullName, moto,image}) {
const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);
  const navigate = useNavigate()

const deleteElection=async()=>{
try {
await axios.delete(`${import.meta.env.VITE_API_URL}/candidates/${id}`, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
  navigate(0)
} catch (error) {
    console.log(error)
}
  }
  return (
 <li className="electionCandidate">
    <div className="electionCandidate_image">
      <img src={image} alt={fullName} />
    </div>
    <div className="electionCandidate_content">
      <h4>{fullName}</h4>
      <small>{moto?.length>70 ? `${moto.substring(0,70)}...` : moto}</small>
      {isAdmin && <button className="electionCandidate_btn" onClick={deleteElection}><IoMdTrash/></button>}
    
    </div>

 </li>
  )
}

export default ElectionCandidate