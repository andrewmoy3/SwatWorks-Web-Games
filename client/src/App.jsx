import { useState } from "react";
import Games from "./Games";
import SignIn from "./SignIn";

function App() {
  const [auth, setAuth] = useState(false);
  return <>{auth ? <Games /> : <SignIn />}</>;
}

export default App;
