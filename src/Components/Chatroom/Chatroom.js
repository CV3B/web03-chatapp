import React, { useEffect, useState, useRef } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';

import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, doc  } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../Firebase/Firebase";

//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { BrowserRouter as Router, Link, useParams, Route } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

import Message from "../Message/Message";
import InputModal from "../util/InputModal/InputModal";
import { useCollection } from 'react-firebase-hooks/firestore';

import ActiveUsers from "./ActiveUsers/ActiveUsers";

import "./Chatroom.css";


export default function Chatroom() {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameId, setUsernameId] = useState("");
  const [bool, setBool] = useState(false);
  
  let { room } = useParams();

    // const [usersInRoom, usersInRoomLoading, usersInRoomError] = useCollection(
    // query(doc(db, "rooms", room)), 
    //   {
    //     idField: 'id',
    //   }
    // );



  // console.log(auth)

  // const handleSubmit = (e) => {
  //   alert(`The name you entered was: ${message}`);
  // }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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

  const sendDataToParentComp = (dataFromChildComp) => {
    console.log("A A A A A A A", dataFromChildComp);
    setUsername(dataFromChildComp)
    // setTimeout(() => { handleCreateRoom(dataFromChildComp); }, 1000);
    // handleCreateRoom(dataFromChildComp);
  };


  const handleAddFriend = (e) => {
    e.preventDefault();

    // alert("ADD FRIEND")
    console.log("handleAddFriend")
    handleOpen();
  }
  // get user where name = freind

  const fetchUsernameUid = async () => {
    console.log("fetchUsernameUid")
    try {
      const q = query(collection(db, "users"), where("name", "==", username)); //! Query:n är case sensitive
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((pDoc) => {
        if (pDoc.exists()) {
          console.log("2", pDoc.data().uid)
          setUsernameId(pDoc.data().uid)
          console.log("usernameID 1", usernameId)

        } else {
          console.log("No such document!");
        }
      });
      console.log("usernameID 2", usernameId)

    } catch (err) {
      console.error(err);

    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    console.log("handleConfirm")
    const { uid, photoURL } = auth.currentUser;
    
      
    fetchUsernameUid()
    console.log("USERNAMEID 3", usernameId)
    // if(usernameId) {
    //   setBool(true)
    //   console.log("treue")
    // } else {
    //   setBool(false)
    //   console.log("false  ")

    // }

    
    // setUsername("");
  }

    const temp = async () => {
    try {
      await updateDoc(doc(db, "rooms", room), {
        users: arrayUnion(usernameId)
      });
      console.log("q", usernameId)
    } catch (err) {
      console.error(err);
    }
  }

  const didMountRef = useRef(false);
  useEffect(() => {

    if(didMountRef.current) {
      temp()
    }
    console.log("1", didMountRef)
    didMountRef.current = true;
    console.log("2", didMountRef)
    //

    
  }, [usernameId]);



  // useEffect(() => {
  //   if(bool) {
  //     console.log("useEffect")
  //     // fetchUsernameUid()
  //     temp()
  //   }
    
    
  // }, [bool]);

  //TODO SÄTT MESSAGE INPUT LÄNGST NER I HEMSIDAN  
  return(
    <div className="chatroom-container">
      <form id="add-friend" onSubmit={handleConfirm}>
        <InputModal id="add-friend" title="Add friend" sendDataToParentComp={sendDataToParentComp} open={open} handleClose={handleClose} />
        
      </form>

      

      <Button onClick={()=> {console.log()}} >AAAAAAAA</Button>
      <div className="users-in-room">

        <ActiveUsers />

        <Paper
          component="form"
          onSubmit={handleAddFriend}
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 100, backgroundColor: "#111", float: "right" }}
        >
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" color="white">
           <AddCircleOutlineIcon />
          </IconButton>
        </Paper>
      </div>
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
