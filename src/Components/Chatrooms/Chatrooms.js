import React, { useEffect, useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

//* MUI imports *//
import { Paper, Button, Typography, Divider, IconButton } from "@mui/material";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';

//* Firebase imports *//
import { collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, doc, onSnapshot   } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../Firebase/Firebase";

//* Other imports *//
import { BrowserRouter as Router, Link, useParams, Route, useNavigate, link } from "react-router-dom";
import InputModal from "../util/InputModal/InputModal";

import "./Chatrooms.css";

//TODO Skapar två docs i firebase vid confirm, antagligen kallas den två, då den uppdateras. LÖST
//TODO Visar bara rummen, visar inte efter att sidan har refresh:at, lösning: https://stackoverflow.com/questions/52254513/typeerror-cannot-read-property-uid-of-null LÖST
//TODO https://cloud.google.com/firestore/docs/security/rules-conditions LÖST
//TODO Gör samma i handleCreateRoom som i message, för att uppdatera UI:en i realtid LÖST
//TODO user.uid är inte bestämd innan den kallas här, alltså user.uid == null. LÖST

export default function Chatrooms() {
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(false);
  
  //* Gets data from InputModal input *//
  const sendDataToParentComp = (dataFromChildComp) => {
    setRoomName(dataFromChildComp);
  };
  
  //* Gets all rooms current user is invited to *//
  const fetchAvalibleRooms = () => {
    // setRooms([])
    const q = query(collection(db, "rooms"), where("users", "array-contains", user.uid));
    onSnapshot(q, (querySnapshot) => {
    const arrRooms = [];
    querySnapshot.forEach((doc) => {
      arrRooms.push(doc.data());
    });
    setRooms(arrRooms)
    });
  }

  //* Gets user data *//
  const fetchCurrentUserData = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((pDoc) => {
        setUsername(pDoc.data().name)

      });

    } catch (err) {
      console.error(err);

    }
  };

  
  //* All handles *//

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const handleConfirm = async (e) => {
    e.preventDefault();

    const { uid, email } = user;
    const roomId = uuidv4()
    console.log("C R E A T E D  R O O M")

    try {
      console.log("QUERY", {roomName})
       await setDoc(doc(db, "rooms", roomId), {
        roomName,
        createdAt: serverTimestamp(),
        uid,
        roomId,
        users: [uid],
      });

    } catch (err) {
      console.error(err);
    }
  }

  const handleOpenSidenav = () => {
    document.getElementsByClassName("sidenav")[0].style.display = "block";
  }

  const handleCloseSidenav = () => {
    document.getElementsByClassName("sidenav")[0].style.display = "none";
  }

  //* Kallar "fetchRooms" vid initial mount
  useEffect(() => {
   if(user) {
    fetchAvalibleRooms()
    fetchCurrentUserData()

  }
    
  }, [user]);

  return(
    <div className="first-dashboard-container">
      {window.matchMedia("(max-width: 750px)").matches && 
        <Button onClick={handleOpenSidenav} variant="contained" size="large" sx={{float: "left", margin: "10px",}} color="darkGrey" >
          <KeyboardArrowRightIcon size="large" color="white" />
        </Button>
      }
      <div id="mySidenav" className="sidenav">
      {window.matchMedia("(max-width: 750px)").matches && 
        <Button onClick={handleCloseSidenav} variant="contained" size="large" color="darkGrey" >
          <KeyboardArrowLeftIcon size="large" color="white" />
        </Button>
      }
      <Button size="large" color="white" component={Link} to="/settings" sx={{ textTransform: "none" }} >{username}</Button>
        <Divider variant="middle" color="white" />
        <Button startIcon={<FormatListBulletedIcon />} color="white" onClick={handleOpen} >Create room</Button>
        <form id="create-room" onSubmit={handleConfirm}>
          <InputModal id="create-room" title="Create room" sendDataToParentComp={sendDataToParentComp} open={open} handleClose={handleClose} />
        </form>
        {loading && <CircularProgress />}
        {rooms.map((room, i) => { 
          return(
            <div key={i}>
              <Button component={Link} to={`/chat/${room.roomId}`} color="white" >{room.roomName}</Button>
            </div>
        )})}
      </div>
    </div>
  );
}
