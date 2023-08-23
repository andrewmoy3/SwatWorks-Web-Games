import { useState } from "react";
import Games from "./Games";
import SignIn from "./SignIn";

function App() {
  const [auth, setAuth] = useState(true);
  return <>{auth ? <Games setAuth={setAuth} /> : <SignIn />}</>;
}

export default App;
