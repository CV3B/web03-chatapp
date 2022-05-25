import * as React from 'react';

//* MUI imports *//
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TextField from '@mui/material/TextField';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px #000',
  borderRadius: '7px',
  boxShadow: 24,
  p: 4,
};

//* This component gives the user a prop message with input. You can send the input to a parent component *//
export default function InputModal({id, title, sendDataToParentComp, open, handleClose, extraText}) {
  const [inputText, setInputText] = React.useState("");


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("even work?")
    alert(title)
  }

  return (
    <div>
    <div id="inputModal-form" onSubmit={handleSubmit} >
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              {title}
            </Typography>
            <Typography variant='h6' sx={{textDecoration: "underline"}} >
              {extraText}
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              <TextField id="standard-basic" label="Standard" variant="standard"  onChange={(e)=> {setInputText(e.target.value); console.log(inputText)}} />
              <Button type="submit" form={id} variant='contained' color="success" sx={{marginRight: "10px", marginLeft: "10px", marginTop: "10px"}}  onClick={()=> {sendDataToParentComp(inputText); handleClose();}} >Confirm</Button>
              <Button variant='contained' color="error" sx={{marginTop: "10px"}} onClick={handleClose} >Close</Button>
            </Typography>
          </Box>
        </Fade>
      </Modal>
      </div>
    </div>
  );
}