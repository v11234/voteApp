import React from 'react'
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom'
import { uiActions } from '../store/ui-slice';

function Election({id,title,description,thumbnail}) {

  //open update election

  const dispatch=useDispatch();

  const openModal=()=>{
dispatch(uiActions.openUpdateElectionModal());
  }
  return (
  <section className="election">
    <div className="election_image">
        <img src={thumbnail} alt={title}/>
    </div>
    <div className="election_info">
        <Link to={`/elections/${id}`}><h4>{title}</h4></Link>
        <p>{description?.length>255 ?description.substring(0,255) + "...." : description}</p>
        <div className="election_cta">
             <Link to={`/elections/${id}` } className="btn sm">View</Link>
             <button className="btn sm primary" onClick={openModal}>Edit</button>
        </div>
    </div>
  </section>
  )
}

export default Election