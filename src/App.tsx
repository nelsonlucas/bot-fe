import "./theme/defalut.css";
import { RouterProvider } from "react-router";
import { routes } from "./configs/routes";

const App = () => {
  return <RouterProvider router={routes} />
};
export default App;
