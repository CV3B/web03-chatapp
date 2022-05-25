//* Component imports *//
import Chatrooms from "./Components/Chatrooms/Chatrooms";
import Chatroom from "./Components/Chatroom/Chatroom";
import Reset from "./Components/Reset/Reset";
import Home from "./Components/Home/Home";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import UserSettings from "./Components/UserSettings/UserSettings";

//* Other imports *//
import './App.css';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import {ThemeProvider, createTheme} from "@mui/material/styles";

//* Färg temat för hemsidan *//
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
  TODO små sakaer kvar:

    * ////Visar användare i rummet - online status - KOMMER VÄRKLIGEN INTE HINNA
    * ////Ta bort meddelande - Ta bort användare från ett rum - Lämna rum
    * ////Profil inställningar -- KOMMER NOG INTE BLI KLAR MED ATT UPPDATARE PB
    * ////Meddela bilder 
    * ////CSS 
    * ////Städa kod
    * ////Visa en alert när anvädaren inte har tillgång till en sida
    * Smooth scrolling - Annan scrollbar
    * ////Knapp till /chat - 
    * ////Inte vara mer än 10 i grupp, samt andra regeler för att skriva i firebase 
    * ////import colorstring
    * KLAR?

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
              <Route exact path="/settings" element={<UserSettings />} />
            </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
