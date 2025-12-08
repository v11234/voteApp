import  { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Image from "../assets/404.gif"

function ErrorPage() {
    const navigate=useNavigate();
    //redirect to previous page after 6 seconds
    useEffect(() => {
        setTimeout(() => {
            navigate(-1);
        }, 6000);
    })
  return (
  <section className="errorPage">
    <div className="errorPage_container">
      <img  src={Image}  alt="Page not found"/>
        <h1>404</h1>
        <p>This page does not exist.You will be rediected to the previews page shortly</p>
    </div>
  </section>
  )
}

export default ErrorPage