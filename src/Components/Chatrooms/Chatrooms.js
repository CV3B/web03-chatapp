import React, { useEffect, useState, useCallback, useRef } from "react";
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

import { collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, doc, onSnapshot   } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../Firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logout } from "../Firebase/Firebase";

import { BrowserRouter as Router, Link, useParams, Route, useNavigate } from "react-router-dom";

import "./Chatrooms.css";
import { Room } from "@mui/icons-material";

//TODO Skapar två docs i firebase vid confirm, antagligen kallas den två då den uppdateras  
//TODO Visar bara rummen visar inte efter att sidan har refresh:at, lösning: https://stackoverflow.com/questions/52254513/typeerror-cannot-read-property-uid-of-null
//TODO https://cloud.google.com/firestore/docs/security/rules-conditions nvm kommer ta mitt liv bruh
//TODO Gör samma i handleCreateRoom som i message, för att uppdatera UI:en i realtid
//TODO user.uid är inte bestämd innan den kallas här, alltså user.uid == null. Tack gud är 1 dag senare.

// function Test(userId) {
//   const [rooms, roomsLoading, roomsError] = useCollection(
//     query(collection(db, "rooms"), where("users", "array-contains", userId)),
//       {
//         idField: 'id',
//       }
//     );
//   console.log("ASDASDASDA", userId, rooms, roomsLoading, roomsError)


//       rooms.docs.map((room, i) => { 
      
//         return(
//           <div key={i}>
//             <a><Button component={Link} to={`/chat/${room.id}`} color="white" >{room.roomName}</Button></a>
//           </div>
//       )})
// }

export default function Chatrooms() {
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  
  // const [rooms, roomsLoading, roomsError] = useCollection(
  //   query(collection(db, "rooms"), where("users", "array-contains", user.uid)), 
  //     {
  //       idField: 'id',
  //     }
  //   );
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // const value = onSnapshot(doc(db, "rooms"), (doc) => {
  //   console.log("Current data: ", doc.data());
  // }); 
  const testasync = () => {
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



  const navigate = useNavigate();

  let { room } = useParams();


  const sendDataToParentComp = (dataFromChildComp) => {
    console.log("is set", dataFromChildComp);
    setRoomName(dataFromChildComp);

    // setTimeout(() => { handleCreateRoom(dataFromChildComp); }, 1000);
    // handleCreateRoom(dataFromChildComp);
  };

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

  // const handleCreateRoom = useCallback(async (e, dataFromChildComp) => {
  //   console.log(e)

  //   // e.preventDefault();
  //   console.log("C R E A T E D  R O O M")

  //   const { uid, email } = user;
  //   const roomId = uuidv4()


  //   try {
  //     console.log("QUERY", {roomName}, {dataFromChildComp})
  //      await setDoc(doc(db, "rooms", roomId), {
  //       roomName,
  //       createdAt: serverTimestamp(),
  //       uid,
  //       roomId,
  //       users: [uid],
  //     });

  //   } catch (err) {
  //     console.error(err);
  //   }

  //   // setRoomName("");
  // }, [user, roomName]);

  // //* Kallar "handleCreateRoom" när roomName är uppdaterad
  // const didMountRef = useRef(false);
  // useEffect((e) => {
  //   if(loading) return;
  //   if(!user) return navigate("/login");

  //   if(didMountRef.current) {
  //     handleCreateRoom(e);
  //   }
  //   console.log("1", didMountRef)
  //   didMountRef.current = true;
  //   console.log("2", didMountRef)
  //   //

    
  // }, [user, loading, handleCreateRoom]); //NAV nulla mig smh

  //* Kallar "fetchRooms" vid initial mount
  useEffect(() => {
   if(user) {
    testasync()
  }
    
    
  }, [user]);



  // useEffect(() => {
  //    console.log("dooog", user)
     
  //  }, [user]);

  // const didMountRef = useRef(false);

  // useEffect(() => {
  //   if (didMountRef.current) { 
  //     return testasync();
  //   }
  //   didMountRef.current = true;
  // }, [inputs]);
  
  return(
    <div className="first-dashboard-container">
      <div id="mySidenav" className="sidenav">
        <Button size="large" color="white" onClick={()=>{logout()}} >Temp</Button>
        <Divider variant="middle" color="white" />
        <a><Button startIcon={<FormatListBulletedIcon />} color="white" onClick={handleOpen} >Create room</Button></a>

        <form id="create-room" onSubmit={handleConfirm}>
          <InputModal id="create-room" title="Create room" sendDataToParentComp={sendDataToParentComp} open={open} handleClose={handleClose} />
        </form>
        {/* {roomsError && <strong>Error: {JSON.stringify(error)}</strong>} */}
        {/* {roomsLoading && <span>Collection: Loading...</span>} */}
        {rooms.map((room, i) => { 
          // console.log("room", room)
          return(
            <div key={i}>
              <a><Button component={Link} to={`/chat/${room.roomId}`} color="white" >{room.roomName}</Button></a>
            </div>
        )})}
        {/* <div className="sidebar-footer" >
          <Divider variant="middle" color="white" />
          <Button startIcon={<LogoutIcon />} color="white" >Logout</Button>
        </div> */}
          {/* <Test userId={user.uid} /> */}
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