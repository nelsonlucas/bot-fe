import { createBrowserRouter } from "react-router";
import { LayoutRoot } from "../../components/LayoutRoot";
import { Backtest } from "../../pages/backtest";
import { Predict } from "../../pages/predict";

export const routes = createBrowserRouter([
  {
    path: "/",
    Component: LayoutRoot,
    children: [
      { index: true, path: "/home",  Component: () => <div>Analytics IA</div>, },
      {
        path: "/backtest",
        Component: Backtest
      },
      {
        path:'/predict',
        Component:Predict
      }
    ],
  },
]);
