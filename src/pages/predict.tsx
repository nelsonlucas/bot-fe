import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Input,
  List,
  message,
  Row,
  Select,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import InfiniteScroll from "react-infinite-scroll-component";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { API_REST } from "../api/api";
import { FaSearch } from "react-icons/fa";
import dayjs from "dayjs";
import Highcharts from "highcharts/highcharts";
import HighchartsReact from "highcharts-react-official";

export const Predict = () => {
  const [loading, setLoading] = useState(false);
  const [listSymbols, setListSymbols] = useState<any>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectIntervalDate, setSelectIntervalDate] = useState<any>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("");
  const [dataMaket, setDataMaket] = useState<any>({});
  const [options, setOptions] = useState<Highcharts.Options>({
    title: {
      text: "",
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

  const getSymbols = async () => {
    return fetch("https://api.binance.com/api/v3/exchangeInfo")
      .then((res) => res.json())
      .then(({ symbols }) => setListSymbols(symbols));
  };

  //   buscar os dados
  const executeBackTest = async ({
    symbol,
    startDate,
    endDate,
    timeframe,
  }: {
    symbol: string;
    startDate: string;
    endDate: string;
    timeframe: string;
  }) => {
    return API_REST.get(`/events/executeBackTest`, {
      params: {
        symbol,
        startDate,
        endDate,
        interval: timeframe,
      },
    });
  };

  // executa predicao dos dados
  const execurePredict = async ({
    symbol,
    startDate,
    endDate,
    timeframe,
  }: {
    symbol: string;
    startDate: string;
    endDate: string;
    timeframe: string;
  }) => {
    setLoading(true);
    return API_REST.post(`/events/executePredict`, {
      symbol,
      startDate,
      endDate,
      interval: timeframe,
    });
  };

  const searchPredict = () => {
    setLoading(true);
    execurePredict({
      symbol: selectedSymbol,
      startDate: dayjs(selectIntervalDate[0]).format("YYYY-MM-DD HH:mm"),
      endDate: dayjs(selectIntervalDate[1]).format("YYYY-MM-DD HH:mm"),
      timeframe: selectedTimeframe,
    })
      .then(() => {
        executeBackTest({
          symbol: selectedSymbol,
          startDate: dayjs(selectIntervalDate[0]).format("YYYY-MM-DD HH:mm"),
          endDate: dayjs(selectIntervalDate[1]).format("YYYY-MM-DD HH:mm"),
          timeframe: selectedTimeframe,
        })
          .then(({ data }) => setDataMaket(data))
          .catch(() => message.error("Erro ao carregar os dados"))
          .finally(() => setLoading(false));
      })
      .catch(() => message.error("Falha ao executar o processo de predição"));
  };

  const handleFilterListSymbols = async (e: any) => {
    if (e.length === 0) {
      await getSymbols();
      return;
    }
    setListSymbols(
      listSymbols.filter((item: any) =>
        item.symbol.includes(String(e).toUpperCase())
      )
    );
  };

  useEffect(() => {
    getSymbols();
  }, []);

  useEffect(() => {
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
  }, [dataMaket?.profits]);

  return (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card title="Ativos">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              width: "100%",
            }}
          >
            <Typography.Text>Período</Typography.Text>
            <DatePicker.RangePicker
              onChange={(dates) => setSelectIntervalDate(dates)}
              format="YYYY-MM-DD"
            />

            <Typography.Text>Timeframe</Typography.Text>
            <Select
            onChange={(e) => setSelectedTimeframe(e)}
              placeholder="Selecione um timeframe"
              options={[
                "1m",
                "3m",
                "5m",
                "15m",
                "30m",
                "1h",
                "2h",
                "4h",
                "6h",
                "8h",
                "12h",
                "1d",
                "1w",
              ].map((e: any) => ({
                value: e,
                label: e,
              }))}
            />
          </div>
          <Divider plain orientation="left"></Divider>
          <InfiniteScroll
            dataLength={listSymbols.length}
            next={listSymbols}
            hasMore={listSymbols.length < 50}
            loader={<></>}
            scrollableTarget="scrollableDiv"
          >
            <List
              header={
                <div>
                  <h2>Lista de Ativos</h2>
                  <Input
                    onChange={(e) => handleFilterListSymbols(e.target.value)}
                    placeholder="Buscar..."
                  />
                </div>
              }
              loading={listSymbols.length === 0}
              size="small"
              bordered
              pagination={{
                position: "bottom",
                // size: "small",
                align: "center",
                // pageSize: 15,
                simple: true,
                showPrevNextJumpers: false,
              }}
              dataSource={listSymbols}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <a
                        href="#"
                        onClick={() => setSelectedSymbol(item.symbol)}
                      >
                        <Flex justify="space-between">
                          {item.symbol}
                          {item.symbol === selectedSymbol && (
                            <span>
                              <IoCheckmarkDoneOutline color="green" />
                            </span>
                          )}
                        </Flex>
                      </a>
                    }
                    // description={`Status: ${item.status}`}
                  />
                </List.Item>
              )}
            />
          </InfiniteScroll>
          <div style={{ marginTop: 10 }}>
            <Button
              disabled={
                selectedSymbol?.length === 0 || selectIntervalDate.length === 0
              }
              block
              type="primary"
              icon={<FaSearch />}
              onClick={searchPredict}
            >
              Buscar
            </Button>
          </div>
        </Card>
      </Col>
      <Col span={16}>
        <Spin spinning={loading} tip="Carregando Dados...">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Última Predição">
                <Flex justify="space-between" align="center">
                  <Statistic
                    title="Preço de Mercado"
                    {...((dataMaket?.output || []).length > 0 && {
                      value:
                        dataMaket?.output?.[
                          (dataMaket?.output || []).length - 1
                        ]?.close,
                    })}
                    precision={2}
                  />

                  <Divider type="vertical" />
                  <Statistic
                    title="Preço Predito"
                    {...((dataMaket?.output || []).length > 0 && {
                      value:
                        dataMaket?.output?.[
                          (dataMaket?.output || []).length - 1
                        ]?.closeIA,
                    })}
                    precision={2}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Tag color={"BUY" === "BUY" ? "green" : "red"}>BUY</Tag>
                  </div>
                </Flex>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Preço Real vs Predito">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dataMaket?.output}>
                    <XAxis dataKey="closeOrderDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#1890ff"
                      name="Preço Real"
                    />
                    <Line
                      type="monotone"
                      dataKey="closeIA"
                      stroke="#faad14"
                      name="Preço Predito"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Lucro Acumulado (IA)">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={options}
                  ref={chartRef}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </Col>
    </Row>
  );
};
