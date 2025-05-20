import { createBrowserRouter} from "react-router";
import { LayoutRoot } from "../../components/LayoutRoot";
import { Backtest } from "../../pages/backtest";
import { Predict } from "../../pages/predict";
import { Arbitrage } from "../../pages/arbitrage";
import { BiHome } from "react-icons/bi";
import { GrTest } from "react-icons/gr";
import { TbBrandStocktwits } from "react-icons/tb";
import { GiCardExchange } from "react-icons/gi";


export const routes = createBrowserRouter([
  {
    path: "/",
    Component: LayoutRoot,
    children: [
      {
        index: true,
        path: "/home",
        Component: () => <div>Analytics IA</div>,
        handle: {
          title: "Home",
          icon: <BiHome />,
        },
      },
      {
        path: "/backtest",
        Component: Backtest,
        handle: {
          title: "Backtest",
          icon: <GrTest />,
        },
      },
      {
        path: "/predict",
        Component: Predict,
        handle: {
          title: "Predict",
          icon: <TbBrandStocktwits />,
        },
      },
      {
        path: "/arbitrage",
        Component: Arbitrage,
        handle: {
          title: "Arbitrage",
          icon: <GiCardExchange />,
        },
      },
    ],
  },
]);
