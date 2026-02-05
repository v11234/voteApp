import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Register() {
  const [userData, setUserData] = useState({ fullName: '', email: '', password: '', password2: '' });
  const [error, setError] = useState("");
  const [isSigning,setIsigning]=useState(false)

  const navigate = useNavigate()
  //function to handle change in input fields
  const changeInputHandler = (e) => {
    setUserData(prevState=>{
      return {...prevState,[e.target.name]:e.target.value}
    })
  }

  const registerVoter = async (e) => {
    e.preventDefault()
    try {
      setIsigning(true)
      await axios.post(`${import.meta.env.VITE_API_URL}/voters/register`, userData);
      navigate('/')
    } catch (err) {
     
      setError(err.response.data.message)
       setIsigning(false)
    }
  }

  return (
    <section className='register'>
      <div className="container register_container">
        <h2>sign Up</h2>
        <form onSubmit={registerVoter} >
          {error && <p className="form_error-message">{error}</p>}
          <input type="text" name='fullName' id="" placeholder='Full Name' autoComplete='true' autoFocus onChange={changeInputHandler} />
          <input type="email" name='email' id="" placeholder='Email Address' autoComplete='true' onChange={changeInputHandler} />
          <input type="password" name='password' id="" placeholder='Password' autoComplete='true' onChange={changeInputHandler} />
          <input type="password" name='password2' id="" placeholder='Confirm Password' autoComplete='true' onChange={changeInputHandler} />
          <p>Already have an account ?<Link to="/">Sign In</Link></p>
          <button type="submit" className="btn primary">{isSigning ? ('Registering...'): ('Register')}</button>

        </form>

      </div>
    </section>


  )
}

export default Register