import React from 'react'

function CandidateRating({ fullName, image, totalVotes, voteCount }) {
  return (
    <li className="result_candidate">
      <div className="result_candidate-image">
        <img src={image} alt="" />
      </div>
      <div className="result_candidate-info">
        <div>
          <h5>{fullName}</h5>
          <small>{`${voteCount}${voteCount == 1 ? ' vote' : ' votes'}`}</small>

        </div>
        <div className="result_candidate-rating">
        <div className="result_candidate-loader">
          <span style={{ width: `${voteCount > 0 ? ((voteCount / totalVotes) * 100) : 0}%` }}></span>
        </div>
        <small>{`${voteCount > 0 ? ((voteCount / totalVotes) * 100).toFixed(2) : 0}%`}</small>

      </div>
      </div>
    </li>

  )
}

export default CandidateRating