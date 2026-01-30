import React from 'react'
import {IoMdTrash} from "react-icons/io"

function ElectionCandidate({id, fullName, description, moto,image}) {
  return (
 <li className="electionCandidate">
    <div className="electionCandidate_image">
      <img src={image} alt={fullName} />
    </div>
    <div className="electionCandidate_content">
      <h4>{fullName}</h4>
      <small>{moto?.length>70 ? `${moto.substring(0,70)}...` : moto}</small>
      <button className="electionCandidate_btn"><IoMdTrash/></button>
    
    </div>

 </li>
  )
}

export default ElectionCandidate