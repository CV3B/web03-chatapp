import React, { useEffect, useState } from "react";

//* Firebase imports *//
import { auth, signInWithEmailAndPassword } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, doc, updateDoc,   } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db, logout } from "../Firebase/Firebase";

//* MUI imports *//
import { TextField, Button, Typography, Paper } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';

//* Other imports *//
import Reset from "../Reset/Reset";
import { stringToColour } from "../util/stringToColour/stringToColour";
import { useSnackbar } from 'notistack';
import { Link, useNavigate  } from "react-router-dom";
import "./UserSettings.css";

const Input = styled('input')({
  display: 'none',
});

function UserSettings() {
  const [user, loading, error] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [usernameDocId, setUsernameDocId] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [currentUsername, setCurrentname] = useState("");

  //* Gets user data *//
  const fetchCurrentUserData = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((pDoc) => {
        setCurrentname(pDoc.data()["name"])
        setUsername(pDoc.data()["name"]);
        setUsernameDocId(pDoc.id)

      });

    } catch (err) {
      console.error(err);

    }
  };

  //* Checks and sets username if available *//
  const setUsernameAvailable = async () => {
    try {
      const q = query(collection(db, "users"), where("name", "==", username));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((pDoc) => {
        if (pDoc.exists()) {
          console.log("false")
          // setUsername(pDoc.data().name)
          setIsUsernameAvailable(false)

        } else {
          console.log("No such document!");
          setIsUsernameAvailable(true)
          console.log("true")

        }
        
      });

    } catch (err) {
      console.error(err);
      setIsUsernameAvailable(true)
      console.log("true")

    }
  }

  //* Updates username in database *//
  const { enqueueSnackbar } = useSnackbar();
  const updateUsername = async () => {
    setUsernameAvailable()
    setTimeout(() => {
      
    }, 500);

    if(isUsernameAvailable) {
      try {
        const userRef = doc(db, "users", usernameDocId);
        await updateDoc(userRef, {
          name: username
        });
  
      } catch (err) {
        console.error(err)
      }
    } else {
      enqueueSnackbar('This name is already exists!', { variant: "error" })
    }
  }

  // const updatePhotoURL = () => {

  // }

  const navigate  = useNavigate ();

  //* Calls "fetchCurrentUserData" on render and checks if user is login or not*//
  useEffect(() => {
    if(loading) return;
    if(!user) return navigate("/login")
    fetchCurrentUserData()
  }, [user, loading]);

  if(!loading){
    return (
      <div>
        <Button component={Link} to="/chat" variant="contained" sx={{ position: "absolute", top: 0, left: 0, margin: "10px" }} >Go back</Button>
        <Paper elevation={12} className="UserSettings"  >
          <div className="UserSettings-container">
           <Typography variant="h3" >SETTINGS</Typography>
           <Button startIcon={<LogoutIcon />} variant="contained" color="error" className="UserSettings-logout" sx={{height: 45}} onClick={logout} >Logout</Button>
          </div>
        </Paper>
        <Paper elevation={12} className="UserSettings">
          <div className="UserSettings-container">

            <Typography variant="h3" >USERNAME</Typography>
            <TextField
              id="username"
              label="Username"
              className="UserSettings-item"
              type="text"
              InputLabelProps={{
                shrink: true,
              }}
              value={username}
              variant="standard"
              placeholder="Username"
              size="large"
              onChange={e => setUsername(e.target.value)}
              sx={{ margin: "4px"}}
            />
            <Button
              className="UserSettings-item"
              onClick={() => updateUsername()}
              variant="contained"
            >
              Update
            </Button>
          </div>
        </Paper>

      <Reset />
      </div>
    );
  }
}

export default UserSettings;

//* KOMMER ATT ANVÄNDAS FÖR ATT UPPDATERA PROFILBILD
/*
<Paper elevation={12} className="UserSettings">
      <div className="UserSettings-container">
     
        <Typography variant="h3" >PROFILE PICTURE</Typography>
        <Avatar src={user?.photoURL} sx={{ bgcolor: stringToColour(currentUsername), width: 46, height: 46 }} >{currentUsername[0]}</Avatar>
        <Button
          className="UserSettings-item"
          onClick={() => updatePhotoURL()}
          variant="contained"
        >
          Update
        </Button>
        <label htmlFor="icon-button-file">
          <Input accept="image/*" id="icon-button-file" type="file" /*onChange={(e)=> handleFileInput(e)}*/ ///>

    //     <Button
    //       size="large"
    //       className="UserSettings-item"
    //       onClick={() => updatePhotoURL()}
    //       variant="contained"
    //       color="primary" 
    //       aria-label="upload picture"
    //       component="span"
    //     >
    //       Update
    //     </Button>
    //     </label>
    //   </div>
    // </Paper>
