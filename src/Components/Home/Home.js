import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase/Firebase";

import Login from "../Login/Login";
import Register from "../Register/Register";

//* Componet checks if user is signed in or not *//
export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  
  if(user){
    return(<Login />);
  } else {
    return(<Register />);
  }
}