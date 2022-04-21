import React, { useEffect, useState } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';

import { collection, query, where, getDocs, addDoc, serverTimestamp   } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../Firebase/Firebase";

//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';

import { BrowserRouter as Router, Link, useParams, Route } from "react-router-dom";

import Message from "../Message/Message";

import "./Chatroom.css";


export default function Chatroom() {
  const [message, setMessage] = useState("");
  let { room } = useParams();

  console.log(auth)

  // const handleSubmit = (e) => {
  //   alert(`The name you entered was: ${message}`);
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    try {
       await addDoc(collection(db, "rooms", room, "messages"), {
        text: message,
        createdAt: serverTimestamp(),
        uid,
        photoURL
      });

    } catch (err) {
      console.error(err);
    }

    setMessage('');
    // dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  //TODO SÄTT MESSAGE INPUT LÄNGST NER I HEMSIDAN  
  return(
    <div className="chatroom-container">
      <div className="users-in-room"></div>
      <h1 >Tees</h1>
      <Message />
      {/* <form onSubmit={handleSubmit}> */}
      <div style={{position: "fixed", bottom: 0, left: "50%", marginLeft: "-100px"}}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, backgroundColor: "#111" }}
        >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          className="message-input"
          placeholder="Search Google Maps"
          inputProps={{ 'aria-label': 'search google maps' }}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" color="white">
         <SearchIcon />
        </IconButton>
      </Paper>
      </div>
      {/* </form> */}
    </div>
  );
}
