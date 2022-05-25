import React, { useEffect, useState, useRef } from "react";


//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';

//* Firebase imports *//
import { auth, signInWithEmailAndPassword, db } from "../Firebase/Firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getFirestore, collection, orderBy, limit, where, doc, quer, deleteDoc, query, getDocs, getDoc  } from 'firebase/firestore';
import { getStorage, ref, getMetadata } from "firebase/storage";
import { useCollection } from 'react-firebase-hooks/firestore';

//* Other imports *//
import { BrowserRouter as Router, Link, useParams, Route } from "react-router-dom";
import "./Message.css";
import { stringToColour } from "../util/stringToColour/stringToColour";
import { useSnackbar } from 'notistack';

export default function Message(props) {
  let { room } = useParams();

  const [messages, messagesLoading, messagesError] = useCollection(
    query(collection(db, "rooms", room, "messages"), orderBy("createdAt")),
    {
      idField: 'id',
    }
  );


  // const dummy = useRef();
  // dummy.current.scrollIntoView({ behavior: 'smooth' });
  const { enqueueSnackbar } = useSnackbar();

  return(
    <div>
      {messagesError && <Typography variant="h3" color="error">You don't have permission to access this room!</Typography>}
        {messagesLoading && <CircularProgress />}
        {messages && (
          <span>
            {messages.docs.map((doc) => (
              <React.Fragment key={doc.id}>
                <ChatMessage key={doc.data().id} message={doc.data()} imgMessages={props.imgMessages} />
              </React.Fragment>
            ))}
          </span>
        )}
      <span ref={props.dummyRef}></span>
    </div>
  );
}

function ChatMessage(props) {
  const [user, loading, error] = useAuthState(auth);
  const [username, setUsername] = useState("");
  const [senderUsername, setSenderUsername] = useState("");

  const { text, uid, photoURL, createdAt, type } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

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

  //* Gets sender message user data *//
  const getSenderUserData = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", uid));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((pDoc) => {
        // return(pDoc.data().name)
        setSenderUsername(pDoc.data().name)
      });

    } catch (err) {
      console.error(err);

    }
  };
  getSenderUserData()

  //* On render it calls "fetchCurrentUserData" *//
  useEffect(() => {
    fetchCurrentUserData()
  }, [])

  return(
    <Paper elevation={4} sx={{ width: "100%", marginBottom: "10px"}} >

    <div id="message-container" className={`message ${messageClass}`}>
      {/* <img className="profile-picture" src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} /> */}
      <Paper elevation={4} sx={{ margin: "10px", padding: "10px" }} >
        <Avatar className="profile-picture" src={photoURL} sx={{ bgcolor: stringToColour(username), width: 46, height: 46 }} >{username[0]}</Avatar>
        <Typography component="div" variant="h6"  >{senderUsername}</Typography>
      </Paper>
       {type === "text" &&
        <>
          <DeleteMessageMenu messageUid={uid} textMessage={text} />
          <p className="text-message">{text}</p>
          {/* <p>{JSON.stringify(createdAt)}</p> */}
        </>
       }
       {type === "img" &&
        <>
          <DeleteMessageMenu messageUid={uid} />
          <img className="img-message" src={text} />
          {/* <p>{JSON.stringify(createdAt)}</p> */}
        </>
       }
       {type === null && <Typography>Invalid Type</Typography> }
    </div>
    </Paper>

  )
}

function DeleteMessageMenu(props) {
  const [user, loading, error] = useAuthState(auth);
  const [test, setTest] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  let { room } = useParams();

  const open = Boolean(anchorEl);

  //* Gets room owern *//
  async function getCurrentRoomOwner() {
    try {
      const q = query(collection(db, "rooms", room, "messages"), where("text", "==", props.textMessage));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((pDoc) => {
        if (pDoc.exists()) {
          console.log("2", pDoc.id)
          setTest(pDoc.id)
        } else {
          console.log("No such document!");
        }
      });

    } catch (err) {
      console.error(err);

    }
    return("test")
  }

  //* All handles *//

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    getCurrentRoomOwner()
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

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
          <MenuItem onClick={(e)=> handleDeleteMessage(e)}>Delete message</MenuItem>
        </Menu>
      </div>
    );
  }
}