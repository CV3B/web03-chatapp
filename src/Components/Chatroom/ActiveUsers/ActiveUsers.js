import React, { useEffect, useState, useRef } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, doc, onSnapshot, arrayRemove, getDoc, deleteDoc  } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../Firebase/Firebase";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
//* MUI imports *//
import { Paper, Button, Typography, Divider, Badge } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { BrowserRouter as Router, Link, useParams, Route } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';

import { useDocument } from 'react-firebase-hooks/firestore';
import { styled } from '@mui/material/styles';

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



//TODO  FirebaseError: Missing or insufficient permissions. query(collection(db, "rooms"), where("roomId", "==", room))
export default function Chatroom() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  // const [usernameId, setUsernameId] = useState();
  const [user, loading, error] = useAuthState(auth);

  const [selectedUserBadgeId, setSelectedUserBadgeId] = useState("");
  const open = Boolean(anchorEl);
  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    setSelectedUserBadgeId(e.currentTarget.id)
    // fetchUsernameUid(e.currentTarget.id)
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  let { room } = useParams();
  const [permittedUsernames, setPermittedUsernames] = useState([]);
  const [permittedUsersId, permittedUsersIdLoading, permittedUsersIdError] = useDocument(
  doc(db, "rooms", room), 
    {
      idField: 'id',
    }
  );

  const fetchUsername = () => {
    // setRooms([])
    const q = query(collection(db, "users"), where("uid", "in", permittedUsersId.data().users));
    onSnapshot(q, (querySnapshot) => {
    const arrPermittedUsers = [];
    querySnapshot.forEach((doc) => {
      // console.log(doc.data().name)
      arrPermittedUsers.push(doc.data().name);
    });
    setPermittedUsernames(arrPermittedUsers)
    });
  }

  const stringToColour = (str) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

  // const kickUserFromRoom = async (e, userId) => {
  //     const docRef = doc(db, "rooms", room);
  //     const docSnap = await getDoc(docRef);
  //     console.log(userId)
  //     if (docSnap.exists()) {
  //       console.log("Document data:", docSnap.data());
       
  //     try {
  //       await updateDoc(docRef, {
  //         users: arrayRemove(userId)
  //       })
  //     } catch (err) {
  //       console.error(err);
  //     }
        


  //     } else {
  //       // doc.data() will be undefined in this case
  //       console.log("No such document!");
  //     }

  // }

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

  const didMountRef = useRef(false);
  useEffect(() => {
    
    if(didMountRef.current) {
      fetchUsername();
    }

    didMountRef.current = true;
  }, [permittedUsersId]);
 
  return(
      <Paper elevation={12} sx={{width: "400px", backgroundColor: "#111"}}>
        <Button onClick={()=> console.log(permittedUsersId.data().users, permittedUsernames)} >DEBUG</Button>
        <AvatarGroup max={10}>
          {permittedUsernames.map((uersname) => {
            return(
              <div>
              <StyledBadge
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              >
                <IconButton onClick={handleClick} id={uersname} ><Avatar alt={uersname} sx={{ bgcolor: stringToColour(uersname), width: 46, height: 46 }} src="/static/images/avatar/1.jpg" /></IconButton>
              </StyledBadge>
              {/* <div> */}
                {/* <Button
                  id="basic-button"
                  aria-controls={open ? 'basic-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  
                >
                  Dashboard
                </Button> */}
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
                  {/* <Button onClick={()=> fetchUsernameUid(selectedUserBadgeId)} >test</Button> */}
                </Menu>
                }
                
              {/* </div> */}
              </div>
            )
          })}
        </AvatarGroup>

      </Paper>

  );
}
