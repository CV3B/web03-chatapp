import React, { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import { useCollection } from 'react-firebase-hooks/firestore';

import InputModal from "../util/InputModal/InputModal";

import { collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, doc   } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../Firebase/Firebase";

import { logout } from "../Firebase/Firebase";

import { BrowserRouter as Router, Link, useParams, Route, useNavigate } from "react-router-dom";

import "./Chatrooms.css";

//TODO Skapar två docs i firebase vid confirm, antagligen kallas den två då den uppdateras  
//TODO Visar bara rummen visar inte efter att sidan har refresh:at, lösning: https://stackoverflow.com/questions/52254513/typeerror-cannot-read-property-uid-of-null
//TODO https://cloud.google.com/firestore/docs/security/rules-conditions nvm kommer ta mitt liv bruh
//TODO Gör samma i handleCreateRoom som i message, för att uppdatera UI:en i realtid
export default function Chatrooms() {
  const [roomName, setRoomName] = useState("");
  // const [rooms, setRooms] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const [rooms, roomsLoading, roomsError] = useCollection(
    query(collection(db, "rooms"), where("users", "array-contains", user.uid)), //TODO user.uid är inte bestämd innan den kallas här, alltså user.uid == null
      {
        idField: 'id',
      }
    );

  const navigate = useNavigate();

  let { room } = useParams();


  const sendDataToParentComp = (dataFromChildComp) => {
    console.log("is set", dataFromChildComp);
    setRoomName(dataFromChildComp);

    // setTimeout(() => { handleCreateRoom(dataFromChildComp); }, 1000);
    // handleCreateRoom(dataFromChildComp);
  };

  const handleCreateRoom = useCallback(async (e, dataFromChildComp) => {
    // e.preventDefault();
    // console.log("AAAAAAAAAAAA", user)

    const { uid, email } = user;
    const roomId = uuidv4()


    try {
      console.log("QUERY", {roomName}, {dataFromChildComp})
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

    // setRoomName("");
  }, [user, roomName]);

  // const fetchRooms = async (e) => {
  //   // e.preventDefault();

  //   // console.log("AAAAAAAAAAAA", user)
  //   const { uid, email } = user;
  //   const roomId = uuidv4()


  //   try {
  //     const q = query(collection(db, "rooms"), where("users", "array-contains", uid)); //, where("users[i].uid", "==", email)

  //     const querySnapshot = await getDocs(q);
  //     console.log("ååååååååå",querySnapshot)

  //     querySnapshot.forEach((pDoc) => {
  //       // setAvailableTimes(pDoc.data()["available-times"])
  //       console.log("allllåå", pDoc.data())
  //       setRooms(prev => [...prev, pDoc.data().roomName]);
  //     });

  //   } catch (err) {
  //     console.error(err);

  //   }

  // };

  // useEffect(() => {
  //   if(loading) return;
  //   if(!user == ) return navigate("/chat");

  // }, []);

  //* Kallar "handleCreateRoom" när roomName är uppdaterad
  useEffect(() => {
    if(loading) return;
    if(!user) return navigate("/login");

    // if(user) {
      handleCreateRoom();
    // }
    
  }, [user, loading, handleCreateRoom]);

  // //* Kallar "fetchRooms" vid initial mount
  // useEffect((e) => {
  //   if(loading) return;
  //   if(!user) return navigate("/login");
  //   // if(user) {
  //   // fetchRooms(e);
  //   // }
    
  // }, [user, loading]);
  
  return(
    <div className="first-dashboard-container">
      <div id="mySidenav" className="sidenav">
        <Button size="large" color="white" onClick={()=> console.log(rooms.docs)} >Temp</Button>
        <Divider variant="middle" color="white" />
        <InputModal title="test" sendDataToParentComp={sendDataToParentComp} />
        {roomsError && <strong>Error: {JSON.stringify(error)}</strong>}
        {roomsLoading && <span>Collection: Loading...</span>}
        {rooms.docs.map((room, i) => { 

          return(
            <div key={i}>
              <a><Button component={Link} to={`/chat/${room.id}`} color="white" >{room.data().roomName}</Button></a>
            </div>
        )})}
        {/* <div className="sidebar-footer" >
          <Divider variant="middle" color="white" />
          <Button startIcon={<LogoutIcon />} color="white" >Logout</Button>
        </div> */}
      </div>
      {/* <Paper elevation={12} className="dashboard">
      </Paper> */}
    </div>
  );
}

// const rooms = [
//   "room1",
//   "room2",
//   "room3",
//   "room4",
//   "room5",
// ]