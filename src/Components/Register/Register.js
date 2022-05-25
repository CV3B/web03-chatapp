import React, { useEffect, useState } from "react";

//* Firebase imports *//
import { auth, registerWithEmailAndPassword, signInWithGoogle } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
// import AlertBar from "../Firebase/Firebase";

//* Other imports *//
import { Paper, Button, Typography, TextField } from "@mui/material";
import { useSnackbar } from 'notistack';
import { Link, useNavigate } from "react-router-dom";

import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [alertOpen, setAlertOpen] = useState(false);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const register = () => {
    if(!username) enqueueSnackbar('You have to fill in a name!', { variant: "error" });
    registerWithEmailAndPassword(username, email, password);

  };

  useEffect(() => {
    if(loading) return;
    if(user) navigate('/chat');
    
  }, [user, loading]);

  return (
    <Paper elevation={12} className="register">
      <div className="register-container">
        <Typography variant="h3" >REGISTER</Typography>
        <TextField
          type="text"
          className="register-item"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          variant="standard"
        />
        <TextField
          type="email"
          className="register-item"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail Address"
          variant="standard"

        />
        <TextField
          type="password"
          className="register-item"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          variant="standard"

        />
        <Button variant="contained" className="register-item" onClick={register} >
          Register
        </Button>
        <Button
          className="login-item"
          onClick={() => signInWithGoogle()}
          variant="contained"
        >
          Login with Google
        </Button>
        <Typography className="register-item" >
          <Link to="/login" style={{ textDecoration: 'underline', color: "#666666"}}>Already have an account? Login now.</Link> 
        </Typography>
      </div>
      {/* <AlertBar message={"Please enter name"} open={alertOpen} setOpen={setAlertOpen} /> */}
    </Paper>
  );
}

export default Register;