import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase/Firebase";

import Login from "../Login/Login";
import Register from "../Register/Register";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  
  if(user){
    return(<Login />);
  } else {
    return(<Register />);
  }
}