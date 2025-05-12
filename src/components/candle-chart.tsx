import { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import "highcharts/indicators/indicators";
import "highcharts/indicators/ema";
import { SelectSymbol } from "./select-symbol";
import { API_WS } from "../api/api";
import { Spin } from "antd";

const CandleChart = () => {
  const [loading, setLoading] = useState(true);
  const [currentSymbol, setCurrentSymbol] = useState<string>("BTCUSDT");
  const [marketData, setMarketData] = useState<any>([]);
  const [ema, setEma] = useState<number>(20);

  const { sendJsonMessage, readyState, lastJsonMessage } = useWebSocket(API_WS);

  const handleGetMarket = (symbol: string) => {
    sendJsonMessage({
      event: "marketData",
      data: {
        symbol,
      },
    });
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
 
    // const interval = setInterval(() => {
      //   if (readyState === ReadyState.OPEN) {
        handleGetMarket(currentSymbol);
    //   }
    // }, 100);

    // return () => clearInterval(interval);
  }, [currentSymbol, connectionStatus]);

  useEffect(() => {
    setLoading(true);
    const { event, data } = (lastJsonMessage as any) || {};
    switch (event) {
      case "marketData":
        setMarketData(data || []);
        setLoading(false);
        break;
      default:
        break;

    }
  }, [lastJsonMessage]);

  useEffect(() => {
    setCurrentSymbol(currentSymbol);
  }, [currentSymbol]);

  const chartRef = useRef(null);

  function setDataGrouping(chart: any, unit: any, count: any) {
    chart.current.chart.series.forEach((s:any) => {
      s.update(
        {
          dataGrouping: {
            forced: true,
            units: [[unit, [count]]],
            groupPixelWidth: 1, // força agrupamento visual mesmo com pouco zoom
          },
        },
        false
      );
    });

    chart.current.chart.redraw();
  }

  const options: Highcharts.Options = {
    title: {
      text: `Chart ${currentSymbol}`,
    },
    rangeSelector: {
      buttons: [
        {
          text: "1h",
          events: {
            click: function () {
              setDataGrouping(chartRef, "hour", 1);
            },
          },
        },
        {
          text: "2h",
          events: {
            click: function () {
              setDataGrouping(chartRef, "hour", 2);
            },
          },
        },
        {
          text: "6h",
          events: {
            click: function () {
              setDataGrouping(chartRef, "hour", 6);
            },
          },
        },
        {
          text: "12h",
          events: {
            click: function () {
              setDataGrouping(chartRef, "hour", 12);
            },
          },
        },
        {
          text: "D",
          events: {
            click: function () {
              setDataGrouping(chartRef, "day", 1);
            },
          },
        },
      ],
      selected: 0,
    },
    xAxis: {
      minPadding: 0.05,
      maxPadding: 0.15,
      ordinal: false,
      gridLineWidth: 1,
      labels: {
        style: {
          color: "#000000",
          fontSize: "9px",
        },
        formatter: function () {
          return Highcharts.dateFormat("%d/%m", this.value as any);
        },
      },
      // events: {
      //   setExtremes: function (event) {
      //     console.log("Novo intervalo de tempo:", event.min, event.max);
      //   },
      // },
    },
    yAxis: {
      title: { text: "Resistencia" },
      plotLines: [
        {
          value: 84000, // valor da resistência
          color: "green",
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Resistência",
            align: "right",
            style: { color: "red" },
          },
        },
        {
          value: 82000, // valor da resistência
          color: "red",
          dashStyle: "Dash",
          width: 2,
          label: {
            text: "Suporte",
            align: "right",
            style: { color: "red" },
          },
        },
      ],
    },
    navigator: {
      enabled: false,
    },
    plotOptions: {
      candlestick: {
        color: "#000000",
        lineColor: "#ffffff",
        upColor: "#ffffff",
        upLineColor: "#000000",
        dataLabels: {
          enabled: true,
          color: "#000000",
          useHTML: true,
          formatter: function () {
            return (this as any).point.options.volume ?? "";
          },
          verticalAlign: "bottom",
          align: "center",
          y: 20, // distância abaixo do candle
          style: {
            color: "gray",
            fontSize: "7px",
          },
        },
      },
    },
    series: [
      {
        type: "candlestick",
        id: "mainSeries",
        name: currentSymbol,
        data: marketData,
        tooltip: {
          valueDecimals: 2,
        },
        // dataGrouping: {
        //   units: [
        //     ["hour", [1, 2, 6]],
        //     ["day", [1]],
        //   ],
        // },
        // dataGrouping: {
        //   enabled: true,
        // },
      },
      {
        type: "ema",
        linkedTo: "mainSeries",
        dashStyle: "Solid",
        lineWidth: 2,
        marker: {
          enabled: false, // sem marcadores nos pontos
        },
        tooltip: {
          valueDecimals: 2,
        }, // espessura da linha
        params: {
          period: ema,
        },
      },
    ],
  };

  return (
    <Spin spinning={loading} tip="Carregando...">
      <div>
        <label>
          Period EMA:
          <input
            min={1}
            type="number"
            placeholder="Timeframe"
            onChange={(e) => setEma(parseInt(e.target.value))}
            value={ema}
          />
        </label>
        <SelectSymbol onChange={(e) => setCurrentSymbol(String(e))} />
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="stockChart"
        options={options}
        
        ref={chartRef}
      />
    </Spin>
  );
};

export default CandleChart;
