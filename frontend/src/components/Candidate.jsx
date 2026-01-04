import React from 'react'

function Candidate({image,id,fullName,moto}) {
  return (
    <article className="candidate">
        <div className="candidate_image">
            <img src={image} alt={fullName}/>
        </div>
        <h5>{fullName?.length>20 ?fullName.substring(0,20) +"...":fullName}</h5>
        <small>{moto?.length>25 ?moto.substring(0,25) +"...":moto}</small>
        <button className='btn primary'>Vote</button>

    </article>
  )
}

export default Candidate