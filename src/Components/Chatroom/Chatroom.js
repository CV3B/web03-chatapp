import React, { useEffect, useState, useRef } from "react";

//* Firebase imports  *//
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, doc, arrayRemove, getDoc, deleteDoc  } from "firebase/firestore";
import { auth, db } from "../Firebase/Firebase";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, getMetadata, listAll  } from "firebase/storage";

//* MUI imports *//
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import { Paper, Button, Typography, Divider } from "@mui/material";
import Portal from '@mui/material/Portal';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { styled } from '@mui/material/styles';





//* Componets imports *//
import Message from "../Message/Message";
import InputModal from "../util/InputModal/InputModal";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ActiveUsers from "./ActiveUsers/ActiveUsers";

//* Other imports *//
import { BrowserRouter as Router, Link, useParams, Route, useNavigate } from "react-router-dom";
import "./Chatroom.css";

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
  const [show, setShow] = useState(false);

  const container = useRef(null);

  const dummy = useRef();

  let { room } = useParams();

  //* Gets data from InputModal input *//
  const sendDataToParentComp = (dataFromChildComp) => {
    setUsername(dataFromChildComp)
  };

  //* Gets username id from sendDataToParentComp *//
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


  //* Makes user leave room *//
  const navigate = useNavigate();
  const leaveRoom = async (e) => {

    const docRef = doc(db, "rooms", room);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
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
      console.log("No such document!");
    }
  }

  //* Get files from firebase storage *//
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
           const storageFilePath = room + "/" +itemRef.name
           const starsRef = ref(storage, storageFilePath);
            
           // Get the download URL
           getDownloadURL(starsRef)
             .then((url) => {
               // Get metadata properties
                getMetadata(starsRef)
                .then((metadata) => {
                  // Metadata now contains the metadata for 'images/forest.jpg'
                arrImgMessages.push({"url": url, "createdAt": metadata.createdAt });

                })
                .catch((error) => {
                  console.error(error)
                });
                
             })
             .catch((error) => {
              console.error(error)
             });
        });
      }).catch((error) => {
        console.error(error)
      });

      setImgMessages(arrImgMessages)
  }
  //* Adds input file to database *//
  const addImgToDB = async (url) => {
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

  //* Uploads file to firebase storage *//
  const upLoadFile = () => {
    const storage = getStorage();
    const storageRef = ref(storage, room+"/"+fileName);
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
        console.error(error)        
      }, 
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          addImgToDB(downloadURL)
        });
      }
    );
  };

  //* All handles */

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddFriend = (e) => {
    e.preventDefault();

    handleOpen();
  }

  const handleConfirm = async (e) => {
    e.preventDefault();
    
    fetchUsernameUid()
  }

  const addUserToRoom = async () => {
    try {
      await updateDoc(doc(db, "rooms", room), {
        users: arrayUnion(usernameId)
      });

    } catch (err) {
      console.error(err);
    }
  }

  const handleFileInput = (e) => {
    setFile(e.target.files[0])
    setFileName(e.target.files[0].name)
  }

  const handleClick = () => {
    setShow(!show);
  };

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
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  //* Calls "addUserToRoom" when usernameId gets updated *//
  const didMountRef = useRef(false);
  useEffect(() => {

    if(didMountRef.current) {
      addUserToRoom()
    }
    didMountRef.current = true;
    
  }, [usernameId]);

  //* On first render it get all files from firebase storage *//
  useEffect(() => {
    getFiles()
  }, [])

  return(
    <div className="chatroom-container">
      <form id="add-friend" onSubmit={handleConfirm}>
        <InputModal id="add-friend" title="Add friend" sendDataToParentComp={sendDataToParentComp} open={open} handleClose={handleClose} extraText="Name is case sensitive" />
        
      </form>

      <div className="users-in-room">
        <ActiveUsers />
        <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: "auto", backgroundColor: "#111", float: "right", flexDirection: "column" }} >
          <div>
            <IconButton onClick={handleClick} aria-label="search" color="error" >
              <ExitToAppIcon />  {show ? "Leave room?" : null}
            </IconButton>
              {show ? (
                <Portal container={container.current}>
                  <Button onClick={()=> {handleClick(); leaveRoom()}} color="success" variant="contained" sx={{marginRight: 1}} >Confirm</Button>
                  <Button onClick={handleClick} color="error" variant="contained" >Close</Button>
                </Portal>
              ) : null}
            <Box ref={container} />
          </div>
        </Paper>
      </div>

      <Message imgMessages={imgMessages} dummyRef={dummy} />

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
            <Button size="large" startIcon={<PhotoCamera />} color="primary" aria-label="upload picture" component="span" >{fileName}</Button>
          </label>
        </Paper>
      </div>

      <Paper
        component="form"
        onSubmit={handleAddFriend}
        sx={{ p: '2px 4px', position: "fixed" , display: 'flex', alignItems: 'center', width: "auto", backgroundColor: "#111", float: "right", flexDirection: "column", marginLeft: "30px", bottom: "0px", right: "0px", margin: "10px" }}
      >
        <IconButton type="submit"  aria-label="search" color="white" >
          <AddCircleOutlineIcon  />
        </IconButton>
      </Paper>
    </div>
  );
}
