import  { useState } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [userData, setUserData] = useState({fullName:'', email:'', password:'', password2:''});
  //function to handle change in input fields
  const changeInputHandler = (e) => {
    setUserData({...userData, [e.target.name]:e.target.value})
  }
  console.log(userData);
  return (
<section className='register'>
<div className="container register_container">
  <h2>Login</h2>
  <form >
    <p className="form_error-message">Any error from the backend</p>

    <input type="email" name="email" id="" placeholder='Email Address' autoComplete='true' onChange={changeInputHandler}/>
    <input type="password" name="password" id="" placeholder='Password' autoComplete='true'onChange={changeInputHandler} />
    <p>Already have an account ?<Link to="/register">Sign Up</Link></p>
    <button  type="submit"className="btn primary">Login</button>
    
  </form>

</div>
</section>


  )
}

export default Login