import { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddCandidateModal() {
    const [fullName, setFullName] = useState('');
    const [moto, setMoto] = useState('');
    const [image, setImage] = useState(null);
    const navigate = useNavigate()
    const token = useSelector(state => state?.vote?.currentVoter?.token);
    const electionId=useSelector(state => state?.vote?.addCandidateElectionId);
    //close add candidate election
    const dispatch = useDispatch();
    const closeModal = () => {
        dispatch(uiActions.closeAddCandidateModal());
    }

    const addCandidates = async (e) => {
        e.preventDefault()
        try {
            const candidateData = new FormData()
            candidateData.set('fullName', fullName)
            candidateData.set('moto', moto)
            candidateData.set('image', image)
            candidateData.set('currentElection', electionId)
            await axios.post(`${import.meta.env.VITE_API_URL}/candidates`, candidateData, { withCredentials: true, headers: { Authorization: `Bearer ${token}` } });
         closeModal()
            navigate(0)
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <section className="modal">
            <div className="modal_content">
                <header className="modal_header">
                    <h4>Add Candidate</h4>
                    <button className="modal_close" onClick={closeModal}><IoMdClose /></button>
                </header>

                <form action="" onSubmit={addCandidates}>
                    <div>
                        <h6>Candidate Name</h6>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div>
                        <h6>Candidate motto</h6>
                        <input type="text" value={moto} onChange={(e) => setMoto(e.target.value)} />
                    </div>
                    <div>
                        <h6>Candidate Image</h6>
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} accept=".png,.jpg,.jpeg,.webp,.avif" />
                    </div>
                    <button type="submit" className="btn primary">Add candidate</button>
                </form>

            </div>
        </section>
    )
}

export default AddCandidateModal
