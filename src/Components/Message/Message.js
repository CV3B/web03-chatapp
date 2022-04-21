import React, { useEffect, useState, useRef } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';

//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import { auth, signInWithEmailAndPassword, db } from "../Firebase/Firebase";

import { getFirestore, collection, orderBy, limit, where, doc, query } from 'firebase/firestore';


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
                <ChatMessage key={doc.data().id} message={doc.data()} />
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
  const { text, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
      {JSON.stringify(createdAt)}
    </div>
  </>)
}

// let messages = [{text: "loool", uid: 123}, {text: "123123", uid: 123}, {text: "asdasdasd", uid: 123}, {text: "aaaaa", uid: 123}, {text: "ööööööö", uid: 123},]

