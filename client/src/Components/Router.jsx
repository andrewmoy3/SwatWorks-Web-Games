import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./Error";
import Gtc from "./Gtc";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    // children: [
    //   { index: true, element: <DefaultProfile /> },
    //   { path: "spinach", element: <Spinach /> },
    //   { path: "popeye", element: <Popeye /> },
    // ],
  },
  {
    path: "/gtc",
    element: <Gtc />,
  },
]);

export default router;
