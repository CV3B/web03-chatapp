import React, { useEffect, useState, useRef } from "react";

//* Firebase imports *//
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, doc, onSnapshot, arrayRemove, getDoc, deleteDoc  } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../Firebase/Firebase";

//* MUI imports *//
import { Paper, Button, Typography, Divider, Badge } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { styled } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { makeStyles } from '@mui/styles';

//* Other imports *//
import { stringToColour } from "../../util/stringToColour/stringToColour";
import { BrowserRouter as Router, Link, useParams, Route, useNavigate } from "react-router-dom";
import { useDocument } from 'react-firebase-hooks/firestore';

import "./ActiveUsers.css";


const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: (navigator.onLine ? "#44b700" : "#b70c00"), //'#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
}));

const useStyles = makeStyles((theme) => ({
  whiteTextColor: {
    color: "white",
    fontWeight: "bold",
    textTransform: "uppercase",
  }
}));

export default function Chatroom() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, loading, error] = useAuthState(auth);
  const [selectedUserBadgeId, setSelectedUserBadgeId] = useState("");
  const [permittedUsernames, setPermittedUsernames] = useState([]);
  const [username, setUsername] = useState("");

  let { room } = useParams();
  const classes = useStyles();

  const [permittedUsersId, permittedUsersIdLoading, permittedUsersIdError] = useDocument(
  doc(db, "rooms", room), 
    {
      idField: 'id',
    }
  );


  const open = Boolean(anchorEl);

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

  //* Gets usernames that are permited to view the room *//
  const fetchUsername = () => {
    const q = query(collection(db, "users"), where("uid", "in", permittedUsersId.data().users));

    onSnapshot(q, (querySnapshot) => {
    const arrPermittedUsers = [];
    querySnapshot.forEach((doc) => {
      arrPermittedUsers.push(doc.data().name);
    });

    setPermittedUsernames(arrPermittedUsers)
    });
  }
 
  //* Kick user from room if user is owner of room *//
  //! När man kickar någon så kommer det massa errors för användaren som kickas. LÖSNING? if(pDoc.data().uid === user?.uid). Har inte tid att fixa.
  const kickUserFromRoom = async (username) => {
    try {
      const q = query(collection(db, "users"), where("name", "==", username));
      const querySnapshot = await getDocs(q);

      const docRef = doc(db, "rooms", room);
      const docSnap = await getDoc(docRef);
      let TEMP;
      querySnapshot.forEach((pDoc) => {
        if (pDoc.exists()) {
          console.log("2", pDoc.data().uid)
          // setUsernameId(pDoc.data().uid)
          TEMP = pDoc.data().uid

        } else {
          console.log("No such document!");
        }
      });

      
      await updateDoc(docRef, {
        users: arrayRemove(TEMP)
      })
    } catch (err) {
      console.error(err);

    }
  };

  //* All handles *//
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    setSelectedUserBadgeId(e.currentTarget.id)
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //* Calls "fetchUsername" when permittedUsersId gets updated *//
  const navigate = useNavigate();
  const didMountRef = useRef(false);
  useEffect(() => {
    // if(!user) return navigate("/chat")

    if(didMountRef.current && !permittedUsersIdLoading) {
      fetchUsername();
    }
    didMountRef.current = true;
    
    fetchCurrentUserData()
  }, [permittedUsersId]);
 
  if(!loading && !permittedUsersIdLoading) {
    return(
      <Paper elevation={12} sx={{width: "auto", backgroundColor: "#111", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "row", float: "left" }}>
        <AvatarGroup max={10} sx={{margin: "10px"}}>
          {permittedUsernames.map((uersname, i) => {
            return(
              <div key={uersname} >
              <StyledBadge
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <IconButton onClick={handleClick} id={uersname} ><Avatar alt={uersname} sx={{ bgcolor: stringToColour(uersname), width: 46, height: 46 }} src={user?.uid === permittedUsersId[i] ? user?.photoURL : null} >{uersname[0]}</Avatar></IconButton>
              </StyledBadge>
                {user.uid === permittedUsersId.data().uid &&
                  <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={()=> {handleClose(); kickUserFromRoom(selectedUserBadgeId);}}>Kick</MenuItem>
                </Menu>
                }
              </div>
            )
          })}
        </AvatarGroup>
      </Paper>
    );
  }
}
