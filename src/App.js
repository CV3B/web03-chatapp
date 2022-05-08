import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import {ThemeProvider, createTheme} from "@mui/material/styles";

import Button from "@mui/material/Button";

import Chatrooms from "./Components/Chatrooms/Chatrooms";
import Chatroom from "./Components/Chatroom/Chatroom";
import { Chat } from '@mui/icons-material';
import Reset from "./Components/Reset/Reset";
import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";

import "./Components/Chatrooms/Chatrooms.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1e88e5",
      light: "#6ab7ff",
      dark: "#005cb2"
    },
    secondary: {
      main: "#ffc400",
      light: "#fff64f",
      dark: "#c79400",
    },
    white: {
      main: "#ffffff"
    },
    darkGrey: {
      main: "#474747"
    }
  }
});


/* 
  TODO:

    * Visar användare i rummet - online status
    * Ta bort meddelande - Ta bort användare från ett rum - Lämna rum
    * Profil inställningar
    * Meddela bilder

*/
function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Router>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/chat" element={<><Chatrooms /> <Outlet /></>} >
                <Route path=":room" element={<Chatroom />}/>
              </Route>
              <Route exact path="/reset" element={<Reset />} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/register" element={<Register />} />
              {/* <Route exact path="/test" >
                <Chatrooms />
              </Route> */}

            </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

// function Test(){
//   return(
//     <Chatrooms />
//     <Outlet />
//   )
// }

export default App;
