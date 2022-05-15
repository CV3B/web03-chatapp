import React, { useEffect, useState, useRef } from "react";

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, doc, arrayRemove, getDoc, deleteDoc  } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../Firebase/Firebase";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, getMetadata, listAll  } from "firebase/storage";
import { useDownloadURL } from 'react-firebase-hooks/storage';
//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { BrowserRouter as Router, Link, useParams, Route, useNavigate } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { styled } from '@mui/material/styles';
import Message from "../Message/Message";
import InputModal from "../util/InputModal/InputModal";
import { useCollection } from 'react-firebase-hooks/firestore';

import ActiveUsers from "./ActiveUsers/ActiveUsers";

import "./Chatroom.css";
import { Add } from "@mui/icons-material";

const Input = styled('input')({
  display: 'none',
});


export default function Chatroom() {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameId, setUsernameId] = useState("");
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState("");
  const [imgMessages, setImgMessages] = useState([]);
  
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

    if(!message && fileName) {
      upLoadFile()
      setFile();
      setFileName("");
      return;
    }

    try {
       await addDoc(collection(db, "rooms", room, "messages"), {
        text: message,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
        type: "text"
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
  const navigate = useNavigate();
  const leaveRoom = async (e) => {
    // room = roomId?, remove arr uid == auth.uid

      const docRef = doc(db, "rooms", room);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        if(docSnap.data().users.lenght === 1 || auth.currentUser.uid === docSnap.data().uid) {
          console.log("1 USER KVAR!")
          navigate("/chat")

          await deleteDoc(docRef);

        } else {
          console.log("FLERA KVAR")
          try {
            navigate("/chat")

            await updateDoc(docRef, {
              users: arrayRemove(auth.currentUser.uid)
            });

          } catch (err) {
            console.error(err);
          }
        }


      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }

      
    // try {
    //   await updateDoc(doc(db, "rooms", room), {
    //     users: arrayRemove(auth.currentUser.uid)
    //   });
    // } catch (err) {
    //   console.error(err);
    // }
  }

  const handleFileInput = (e) => {
    setFile(e.target.files[0])
    setFileName(e.target.files[0].name)
  }

  const getFiles = () => {
    const storage = getStorage();

    // Create a reference under which you want to list
    const listRef = ref(storage, room+"/");
    
    const arrImgMessages = [];
    
    // Find all the prefixes and items.
    listAll(listRef)
      .then((res) => {
        res.prefixes.forEach((folderRef) => {
          // All the prefixes under listRef.
          // You may call listAll() recursively on them.
          console.log("frefix", folderRef)
        });
        res.items.forEach((itemRef) => {
            // All the items under listRef.
          console.log("item", itemRef)
           // const storage = getStorage();
           const storageFilePath = room + "/" +itemRef.name
           console.log("asdASDASDASDA", storageFilePath)
           const starsRef = ref(storage, storageFilePath);
            
           // Get the download URL
           getDownloadURL(starsRef)
             .then((url) => {
               // Insert url into an <img> tag to "download"
               console.log("SUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII", url)
               // Get metadata properties
                getMetadata(starsRef)
                .then((metadata) => {
                  // Metadata now contains the metadata for 'images/forest.jpg'
                arrImgMessages.push({"url": url, "createdAt": metadata.createdAt });

                })
                .catch((error) => {
                  // Uh-oh, an error occurred!
                });
                
             })
             .catch((error) => {
              console.error(error)
             });

            
          // const pathReference = ref(storage, "test/cm7v4jwetbt21.png");
          // const pathReference = ref(storage, 'gs://bucket/test/cm7v4jwetbt21.png');
          // const pathReference = ref(storage, 'https://firebasestorage.googleapis.com/b/bucket/o/test%20cm7v4jwetbt21.png');
          // console.log("alllå",pathReference)
        

        });
      }).catch((error) => {
        // Uh-oh, an error occurred!<
      });


      setImgMessages(arrImgMessages)
  }

  const test321 = async (url) => {
    const { uid, photoURL } = auth.currentUser;

    try {
      await addDoc(collection(db, "rooms", room, "messages"), {
       text: url,
       createdAt: serverTimestamp(),
       uid,
       photoURL,
       type: "img"
     });

   } catch (err) {
     console.error(err);
   }
  }

  const upLoadFile = () => {
    const storage = getStorage();
    const storageRef = ref(storage, room+"/"+fileName);
    console.log("ASDASDASKDASPDKN",storageRef, storage)
    // Create file metadata including the content type
    /** @type {any} */
    const metadata = {
      contentType: 'image/jpeg',
      
      customMetadata: {
        roomId: room,
        uid: auth.currentUser.uid,
      }
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        // eslint-disable-next-line default-case
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        // eslint-disable-next-line default-case
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
          case 'storage/canceled':
            // User canceled the upload
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      }, 
      () => {
        // Upload completed successfully, now we can get the download URL
        console.log("ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ", uploadTask.snapshot.ref)
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          test321(downloadURL)
        });
      }
    );
  };

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

  useEffect(() => {
    getFiles()
  }, [])



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

      

      <Button onClick={()=> {console.log(imgMessages)}} >AAAAAAAA</Button>
      <div className="users-in-room">

        <ActiveUsers />
        <IconButton onClick={(e)=> leaveRoom(e)} >
          <AddCircleOutlineIcon />
        </IconButton>

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
      <Message imgMessages={imgMessages} />
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

        <label htmlFor="icon-button-file">
          <Input accept="image/*" id="icon-button-file" type="file" onChange={(e)=> handleFileInput(e)} />
          {/* <IconButton color="primary" aria-label="upload picture" component="span">
            <PhotoCamera />
            {fileName}
          </IconButton> */}
          <Button size="large" startIcon={<PhotoCamera />} color="primary" aria-label="upload picture" component="span" >{fileName}</Button>
        </label>

      </Paper>
      </div>
      {/* </form> */}
    </div>
  );
}
