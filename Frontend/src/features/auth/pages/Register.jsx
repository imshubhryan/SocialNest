import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import {useAuth} from '../hooks/useAuth'

const Register = () => {

  const navigate = useNavigate()
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {loading, handleRegister} = useAuth()

  const handleFormSubmit = async(e)=>{
    e.preventDefault()
    handleRegister(username,email,password)
    navigate('/login')
    
  }

  if(loading){
    return (
      <main><h1>Loading...</h1></main>
    )
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleFormSubmit}>
          <input
            onInput={(e) => {
              setUsername(e.target.value);
            }}
            type="text"
            name="username"
            placeholder="Enter username"
          />
          <input
            onInput={(e) => {
              setEmail(e.target.value);
            }}
            type="text"
            name="email"
            placeholder="Enter email"
          />
          <input
            onInput={(e) => {
              setPassword(e.target.value);
            }}
            type="text"
            name="password"
            placeholder="Enter your password"
          />
          <button className="button primary-button">Register</button>
        </form>
        <p>
          Already have an account?
          <Link className="toggleAuthForm" to="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
