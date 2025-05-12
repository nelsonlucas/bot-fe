import { use, useEffect, useRef, useState } from "react";
import Highcharts from "highcharts/highcharts";
import HighchartsReact from "highcharts-react-official";
import { Col, Row, Select, Spin, Table } from "antd";
import { API_REST } from "../api/api";

export const Backtest = () => {
  const [loading, setLoading] = useState(false);
  const [dataMaket, setDataMaket] = useState<any>({});
  const [historic, setHistoric] = useState<any>([]);
  const [tickerSelected, setTickerSelected] = useState<string>("");
  const [tickers, setTickers] = useState<any>([]);
  const [options, setOptions] = useState<Highcharts.Options>({
    // chart: {
    //   type: "spline",
    // },
    title: {
      text: "IA x Market ",
    },
    xAxis: {
      accessibility: {
        description: "Months of the year",
      },
    },
    yAxis: {
      title: {
        text: "Comparativo de compra e venda de ativos com IA",
      },
      labels: {
        format: "R$ {value}",
      },
      plotLines: [
        {
          value: 0, // valor da linha
          color: "black", // cor da linha
          dashStyle: "Dash", // estilo da linha: Solid, ShortDash, etc
          width: 2, // espessura da linha
          zIndex: 5, // para ficar sobre outras linhas
          label: {
            text: "Ponto de Equilíbrio",
            align: "right",
            style: {
              color: "black",
              fontWeight: "bold",
            },
          },
        },
      ],
    },
    tooltip: {
      shared: true,
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 4,
          lineColor: "#666666",
          lineWidth: 1,
        },
      },
    },
  });
  const chartRef = useRef(null);

  //   buscar os dados
  const getData = async (symbol?: string) => {
    return API_REST.get(`/events/executeBackTest`, {
      params: {
        symbol,
      },
    });
  };

  //   buscar os dados
  const getTicker = async () => {
    return API_REST.get(`/events/getTicker`);
  };

  const executeBackTest = () => {
    const color = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#000000",
    ];
    if (dataMaket?.profits) {
      setOptions({
        ...options,
        series: Object.keys(dataMaket.profits).map((e, index) => {
          return {
            type: "spline",
            name: e,
            data: dataMaket.profits?.[e],
            color: color[index],
            // marker: {
            //   enabled: true,
            // },
            // dashStyle: "Solid",
            // lineWidth: 2,
            // tooltip: {
            //   valueDecimals: 2,
            // },
          };
        }),
      });
    }

    if (dataMaket?.historic) {
      setHistoric(dataMaket.historic);
    }
  };

  useEffect(() => {
    setLoading(true);
    getData(tickerSelected)
      .then(({ data }) => setDataMaket(data))
      .finally(() => setLoading(false));
    getTicker().then(({ data }) => setTickers(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    getData(tickerSelected)
      .then(({ data }) => setDataMaket(data))
      .finally(() => setLoading(false));
  }, [tickerSelected]);

  useEffect(() => {
    executeBackTest();
  }, [dataMaket]);

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Select
          onChange={(e) => setTickerSelected(e)}
          placeholder={"Selecione o ativo"}
          style={{ width: `100%` }}
          size="large"
          options={tickers.map((e: any) => ({
            value: e,
            label: e,
          }))}
        />
      </Col>
      <Col span={24}>
        <Spin spinning={loading} tip="Carregando...">
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartRef}
          />
        </Spin>
      </Col>
      <Col span={24}>
        <Table
          columns={[
            {
              title: "Data",
              dataIndex: "date",
              key: "date",
              render: (date: string) => new Date(date).toLocaleDateString(),
            },
            {
              title: "Profit",
              dataIndex: "profit",
              key: "profit",
              render: (profit: number) => (profit ?? 0).toFixed(2),
            },
          ]}
          dataSource={historic}
        />
      </Col>
    </Row>
  );
};
