import React, { useEffect, useState } from "react";

//* MUI imports *//
import { Paper, Button, Typography, Divider } from "@mui/material";

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LogoutIcon from '@mui/icons-material/Logout';

import { BrowserRouter as Router, Link, useParams } from "react-router-dom";

import "./Chatrooms.css";

export default function Chatrooms() {


  
  return(
    <div className="first-dashboard-container">
      <div id="mySidenav" className="sidenav">
        <Button size="large" color="white" >Temp</Button>
        <Divider variant="middle" color="white" />
        <a><Button startIcon={<FormatListBulletedIcon />} color="white" >Add room</Button></a>

        {rooms.map((room, i) => { 

          return(
            <a><Button component={Link} to={`/chat/${room}`} >{room}</Button></a>
        )})}

        {/* <div className="sidebar-footer" >
          <Divider variant="middle" color="white" />
          <Button startIcon={<LogoutIcon />} color="white" >Logout</Button>
        </div> */}
      </div>
      <Paper elevation={12} className="dashboard">
      </Paper>
    </div>
  );
}

const rooms = [
  "room1",
  "room2",
  "room3",
  "room4",
  "room5",
]