import { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AddElectionModal() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const token = useSelector(state => state?.vote?.currentVoter?.token);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(uiActions.closeElectionModal());
  };

  const createElection = async (e) => {
    e.preventDefault();
    try {
      const electionData = new FormData();
      electionData.set('title', title);
      electionData.set('description', description);
      electionData.set('startDate', startDate);
      electionData.set('endDate', endDate);
      electionData.set('thumbnail', thumbnail);
      await axios.post(`${import.meta.env.VITE_API_URL}/elections`, electionData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      navigate(0);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="modal">
      <div className="modal_content">
        <header className="modal_header">
          <h4>Create New Election</h4>
          <button className="modal_close" onClick={closeModal}><IoMdClose /></button>
        </header>

        <form onSubmit={createElection}>
          <div>
            <h6>Election Title :</h6>
            <input type="text" name="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div>
            <h6>Election Description :</h6>
            <input type="text" name="description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div>
            <h6>Start Date :</h6>
            <input type="date" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>

          <div>
            <h6>End Date :</h6>
            <input type="date" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>

          <div>
            <h6>Election thumbnail :</h6>
            <input type="file" name="thumbnail" onChange={e => setThumbnail(e.target.files[0])} accept=".png,.jpg,.jpeg,.webp,.avif" required />
          </div>

          <button type="submit" className="btn primary">Create Election</button>
        </form>
      </div>
    </section>
  );
}

export default AddElectionModal
