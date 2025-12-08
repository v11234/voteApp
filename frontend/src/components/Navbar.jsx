import { Link, NavLink } from "react-router-dom"


function Navbar() {
  return (
   <nav>
    <div className="container nav_conatiner">
      <Link to="/" className="nav_logo">NICOLINE APP</Link>
      <div>
        <menu>
          <NavLink to="/elections">Elections</NavLink>
           <NavLink to="/results">Results</NavLink>
            <NavLink to="/logout">Logout</NavLink>
        </menu>
        <button className="theme_toggle-btn"></button>
      </div>
    </div>

   </nav>
  )
}

export default Navbar