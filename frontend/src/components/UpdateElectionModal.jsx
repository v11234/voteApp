import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch } from 'react-redux';
import { uiActions } from '../store/ui-slice';

function UpdateElectionModal() {

    const [title,setTitle]=useState('');
    const [description,setDescription]=useState('');
    const [thumbnail,setThumbnail]=useState(null);
 //close modal
 const dispatch=useDispatch();
 const closeModal=()=>{
    //dispatch action to close modal
 
    dispatch(uiActions.closeUpdateElectionModal());
 }
  return (
<section className="modal">
    <div className="modal_content">
        <header className="modal_header">
            <h4>Update Election</h4>
            <button className="modal_close" onClick={closeModal}><IoMdClose/></button>
        </header>

        <form action="">
            <div>
                  <h6>Election Title :</h6>
            <input type="text" name="title"  value={title} onChange={e=>setTitle(e.target.value)}/>
            </div>

            <div>
           <h6>Election Description :</h6>
            <input type="text" name="description" value={description} onChange={e=>setDescription(e.target.value)}/>
            </div>

            <div>
             <h6>Election thumbnail :</h6>
            <input type="file" name="thumbnail" value={thumbnail} onChange={e=>setThumbnail(e.target.files[0])} accept="png,jpg,jpeg,webp,avif"/>
            </div>
           <button type="submit" className="btn primary">Udate Election</button>
            
        </form>


    </div>
</section>
  )
}


export default UpdateElectionModal