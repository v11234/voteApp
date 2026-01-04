import  { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [userData, setUserData] = useState({fullName:'', email:'', password:'', password2:''});
  //function to handle change in input fields
  const changeInputHandler = (e) => {
    setUserData({...userData, [e.target.name]:e.target.value})
  }
  console.log(userData);
  return (
<section className='register'>
<div className="container register_container">
  <h2>sign Up</h2>
  <form >
    <p className="form_error-message">Any error from the backend</p>
    <input type="text" name="fullName" id="" placeholder='Full Name' autoComplete='true' autoFocus onChange={changeInputHandler}/>
    <input type="email" name="email" id="" placeholder='Email Address' autoComplete='true' onChange={changeInputHandler}/>
    <input type="password" name="password" id="" placeholder='Password' autoComplete='true'onChange={changeInputHandler} />
    <input type="password" name="password2 " id="" placeholder='Confirm Password' autoComplete='true'onChange={changeInputHandler} />
    <p>Already have an account ?<Link to="/">Sign In</Link></p>
    <button  type="submit"className="btn primary">Register</button>
    
  </form>

</div>
</section>


  )
}

export default Register