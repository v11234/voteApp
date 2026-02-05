import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { voteActions } from '../store/vote-lice';

function Login() {
  const [userData, setUserData] = useState({email: '', password: ''});
  const [error, setError] = useState("");
  const [isSigning,setIsigning]=useState(false)

  const navigate = useNavigate()
  //function to handle change in input fields
  const changeInputHandler = (e) => {
    setUserData(prevState=>{
      return {...prevState,[e.target.name]:e.target.value}
    })
  }

  const dispatch=useDispatch()
  const loginVoter = async (e) => {
    e.preventDefault()
    try {
      setIsigning(true)
     const response= await axios.post(`${import.meta.env.VITE_API_URL}/voters/login`, userData);
     const newVoter=await response.data;
     //save new user to local storage
     localStorage.setItem("currentUser",JSON.stringify(newVoter));
     dispatch(voteActions.changeCurrentVoter(newVoter))
      navigate('/results')
    } catch (err) {
     
      setError(err.response.data.message)
       setIsigning(false)
    }
  }

  return (
    <section className='register'>
      <div className="container register_container">
        <h2>LOGIN</h2>
        <form onSubmit={loginVoter} >
          {error && <p className="form_error-message">{error}</p>}
          <input type="email" name='email' id="" placeholder='Email Address' autoComplete='true' onChange={changeInputHandler} />
          <input type="password" name='password' id="" placeholder='Password' autoComplete='true' onChange={changeInputHandler} />
          <p>Already have an account ?<Link to="/register">Sign Up</Link></p>
          <button type="submit" className="btn primary">{isSigning ? ('Loging...'): ('Login')}</button>

        </form>

      </div>
    </section>


  )
}

export default Login