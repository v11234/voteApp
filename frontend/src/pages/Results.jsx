import  { useState } from 'react'
import { elections as dummyElections } from '../data';
import ResultElection from '../components/ResultElection';

function Results() {
  const [elections, setElections] = useState(dummyElections);
  return (
 <section className="results">
  <div className="container result_container">
    {
      elections.map(election=><ResultElection key={election.id} {...election}/>)
    }

  </div>

 </section>

  )
}

export default Results