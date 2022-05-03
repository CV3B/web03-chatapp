import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TextField from '@mui/material/TextField';

import { Paper } from "@mui/material";


/*
  Förklara hur inputModal fungear - gör bättre
  const [open, setOpen] = useState(false);


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const sendDataToParentComp = (dataFromChildComp) => {

  };

  <form id={unikt id} onSubmit={funktion som kallas när "submit" knappen är ner tryckt}>
    <InputModal id={unikt id} title="Add friend" sendDataToParentComp={sendDataToParentComp} open={open} handleClose={handleClose} />
  </form>


*/


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
//TODO Fixa en from för att lättare kunna skicka info - nested forms
export default function InputModal({id, title, sendDataToParentComp, open, handleClose}) {
  // const [open, setOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState("");

  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("even work?")
    alert(title)
  }

  return (
    <div>
    {/* <a><Button startIcon={<FormatListBulletedIcon />} color="white" onClick={handleOpen} >Create room</Button></a> */}
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
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              <TextField id="standard-basic" label="Standard" variant="standard"  onChange={(e)=> {setInputText(e.target.value); console.log(inputText)}} />
              <Button type="submit" form={id} variant='contained' color="success"  onClick={()=> {sendDataToParentComp(inputText); handleClose();}} >Confirm</Button>
              <Button variant='contained' color="error" onClick={handleClose} >Close</Button>
            </Typography>
          </Box>
        </Fade>
      </Modal>
      </div>
    </div>
  );
}