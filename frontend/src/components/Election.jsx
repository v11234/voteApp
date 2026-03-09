import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import { uiActions } from '../store/ui-slice';
import { voteActions } from '../store/vote-lice';

function Election({ _id: id, title, description, thumbnail, startDate, endDate }) {
  const dispatch = useDispatch();
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const openModal = () => {
    dispatch(uiActions.openUpdateElectionModal());
    dispatch(voteActions.changeIdOfCandidateElectionId(id));
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleDateString();
  };

  return (
    <section className="election">
      <div className="election_image">
        <img src={thumbnail} alt={title} />
      </div>
      <div className="election_info">
        <Link to={`/elections/${id}`}><h4>{title}</h4></Link>
        <p>{description?.length > 255 ? description.substring(0, 255) + '....' : description}</p>
        <p><small>Start: {formatDate(startDate)} | End: {formatDate(endDate)}</small></p>
        <div className="election_cta">
          <Link to={`/elections/${id}`} className="btn sm">View</Link>
          {isAdmin && <button className="btn sm primary" onClick={openModal}>Edit</button>}
        </div>
      </div>
    </section>
  );
}

export default Election
