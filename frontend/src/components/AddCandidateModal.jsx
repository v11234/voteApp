import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch } from 'react-redux';
import { uiActions } from '../store/ui-slice';

function AddCandidateModal() {
    const [fullName,setFullName]=useState('');
    const [moto,setMoto]=useState('');
    const [image,setImage]=useState(null);

    //close add candidate election
const dispatch=useDispatch();
   const closeModal=()=>{
dispatch(uiActions.closeAddCandidateModal());
   }

  return (
   <section className="modal">
    <div className="modal_content">
        <header className="modal_header">
            <h4>Add Candidate</h4>
            <button className="modal_close" onClick={closeModal}><IoMdClose/></button>
        </header>

        <form action="">
            <div>
                <h6>Candidate Name</h6>
                <input type="text" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
            </div>
            <div>
                <h6>Candidate Moto</h6>
                <input type="text" value={moto} onChange={(e)=>setMoto(e.target.value)} />
            </div>
            <div>
                <h6>Candidate Image</h6>
                <input type="file" value={image} onChange={(e)=>setImage(e.target.files[0])} accept='png jpg jpeg webp avif' />
            </div>
            <button type="submit"className="btn primary">Save</button>
        </form>

    </div>
   </section>
  )
}

export default AddCandidateModal