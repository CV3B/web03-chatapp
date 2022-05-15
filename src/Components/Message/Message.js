import React, { useEffect, useState, useRef } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import { auth, signInWithEmailAndPassword, db } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import { getFirestore, collection, orderBy, limit, where, doc, quer, deleteDoc, query, getDocs, getDoc  } from 'firebase/firestore';
import { getStorage, ref, getMetadata } from "firebase/storage";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';

import { useCollection } from 'react-firebase-hooks/firestore';


import { BrowserRouter as Router, Link, useParams, Route } from "react-router-dom";

import "./Message.css";
import { create } from "@mui/material/styles/createTransitions";
import { Chat } from "@mui/icons-material";

export default function Message(props) {
  // const [value, loading, error] = useCollection(
  //   collection(db, orderBy("createdAt"), limit(25)),
  //   {
  //     idField: 'id',
  //   }
  // );
  
  
  let { room } = useParams();
  const [value, loading, error] = useCollection(
    query(collection(db, "rooms", room, "messages"), orderBy("createdAt")),
    {
      idField: 'id',
    }
  );

  


 
  // const fetchAvailableTimesData = async () => {
  //   try {
  //     const q = query(collection(db, "available-dates"), where("date", "==", props.date));

  //     const querySnapshot = await getDocs(q);
  //     querySnapshot.forEach((pDoc) => {
  //       setAvailableTimes(pDoc.data()["available-times"])

  //     });

  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const dummy = useRef();
  // console.log("haha error", error)
  return(
    <div>
      {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Collection: Loading...</span>}
        {value && (
          <span>
            Collection:{' '}
            {value.docs.map((doc) => (
              <React.Fragment key={doc.id}>
              <button onClick={()=> console.log(doc.data().createdAt)} >AAAA</button>

                {/* {JSON.stringify(doc.data())},{' '} */}
                <ChatMessage key={doc.data().id} message={doc.data()} imgMessages={props.imgMessages} />
              </React.Fragment>
            ))}
          </span>
        )}
      {/* {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)} */}
      <span ref={dummy}></span>
    </div>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt, type } = props.message;
  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const open = Boolean(anchorEl);
  // let { room } = useParams();

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  
 
  // const deleteMessage = async () => {
  //   try {
  //     await deleteDoc(query(collection(db, "rooms", room, "messages"), where("text", "==", text)));
  //   } catch(err) {
  //     console.error(err)
  //   }
  // }

  // const handleDeleteMessage = (e) => {
  //   handleClose();
  //   deleteMessage()
  //   console.log(uid)
  // }

  return(
        <div id="message-container" className={`message ${messageClass}`}>
         <img className="profile-picture" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
         {type === "text" &&
          <>
            <p>{text}</p>
            <DeleteMessageMenu messageUid={uid} textMessage={text} />
            <p>{JSON.stringify(createdAt)}</p>
          </>
         }
         {type === "img" &&
          <>
            <img src={text} />
            <DeleteMessageMenu messageUid={uid} />
            <p>{JSON.stringify(createdAt)}</p>
          </>
         }
         {type === null && <Typography>Invalid Type</Typography> }
       </div>
  )

  // if(type === "text"){
  //   return (<>
  //     <div id="message-container" className={`message ${messageClass}`}>
  //       <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
  //       <p>{text}</p>
  //       {JSON.stringify(createdAt)}
  //     </div>
  //   </>)
  // } else if (type === "img"){
  //   return(
  //     <>aa</>
  //   )
  // } else return(<Typography>Invalid Type</Typography>)
  
}

// let messages = [{text: "loool", uid: 123}, {text: "123123", uid: 123}, {text: "asdasdasd", uid: 123}, {text: "aaaaa", uid: 123}, {text: "ööööööö", uid: 123},]
//! GE ALLA MEDELANDEN UNIKA ID SÅ ATT INTE DET FIINS T.EX TVÅ "AAA" "AAA", VILKET DÅ TAR BORT BÅDA
function DeleteMessageMenu(props) {
  const [user, loading, error] = useAuthState(auth);
  const [test, setTest] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  let { room } = useParams();

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    getCurrentRoomOwner()
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  async function getCurrentRoomOwner() {

    try {
      const q = query(collection(db, "rooms", room, "messages"), where("text", "==", props.textMessage));
      const querySnapshot = await getDocs(q);

      // const docRef = doc(db, "rooms", room);
      // const docSnap = await getDoc(docRef);
      querySnapshot.forEach((pDoc) => {
        if (pDoc.exists()) {
          console.log("2", pDoc.id)
          setTest(pDoc.id)
        } else {
          console.log("No such document!");
        }
      });

      // if (docSnap.exists()) {
      //   // console.log("Document data:", docSnap.data());
      //   setTest(docSnap.data().uid)
      // } else {
      //   // doc.data() will be undefined in this case
      //   console.log("No such document!");
      // }

    } catch (err) {
      console.error(err);

    }
    return("test")
  }

  // useEffect(() => {
  //   getCurrentRoomOwner();
  // }, [])

  //! GÖR DETTA I ACTIVEUSERS
  const handleDeleteMessage = async (e) => {
    getCurrentRoomOwner()
    
    setTimeout(() => {
      
    }, 500);
    try {
      await deleteDoc(doc(db, "rooms", room, "messages", test));
    } catch(err) {
      console.error(err)
    }
    console.log(props.textMessage)
    handleClose()
  }

  if(user.uid === props.messageUid ){
    return (
      <div>
        <IconButton
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={(e)=> handleDeleteMessage(e)}>Delete</MenuItem>
          <Button onClick={()=> getCurrentRoomOwner()} >DBUG</Button>
        </Menu>
      </div>
    );
  }
}