import { Link, NavLink } from "react-router-dom"
import { IoIosMoon } from "react-icons/io"
import { HiOutlineBars3 } from "react-icons/hi2"
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai"
import { IoMdSunny } from "react-icons/io"
import { useSelector } from "react-redux";

function Navbar() {
  const [showNav, setShowNav] = useState(window.innerWidth < 768 ? false : true);
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem('voting-app-theme') || "");
  const token = useSelector((state) => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector((state) => state?.vote?.currentVoter?.isAdmin);

  const closeNav = () => {
    if (window.innerWidth < 768) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }

  const changeThemeHandler = () => {
    if (localStorage.getItem('voting-app-theme') === 'dark') {
      localStorage.setItem('voting-app-theme', '');
    } else {
      localStorage.setItem('voting-app-theme', 'dark');
    }
    setDarkTheme(localStorage.getItem('voting-app-theme'))
  }

  useEffect(() => {
    document.body.className = localStorage.getItem('voting-app-theme');
  }, [darkTheme]);

  return (
    <nav>
      <div className="container nav_container">
        <Link to="/" className="nav_logo">NICOLINE APP</Link>

        <div>
          {token && showNav &&
            <menu>
              <NavLink to="/elections" onClick={closeNav}>Elections</NavLink>
              <NavLink to="/results" onClick={closeNav}>Results</NavLink>
              {isAdmin && <NavLink to="/admin" onClick={closeNav}>Admin</NavLink>}
              {isAdmin && <NavLink to="/admin/users" onClick={closeNav}>Users</NavLink>}
              <NavLink to="/logout" onClick={closeNav}>Logout</NavLink>
            </menu>
          }
          <button className="theme_toggle-btn" onClick={changeThemeHandler}>{darkTheme ? <IoMdSunny /> : <IoIosMoon />}</button>
          <button className="nav_toggle-btn" onClick={() => setShowNav(!showNav)}>{showNav ? <AiOutlineClose /> : <HiOutlineBars3 />}</button>
        </div>
      </div>

    </nav>
  )
}

export default Navbar
