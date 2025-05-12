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
  Skeleton,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
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
import { FaSearchengin } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import dayjs from "dayjs";

const mockData = [
  { date: "2024-05-01", real: 10.2, predict: 10.5, profitIA: 2 },
  { date: "2024-05-02", real: 10.4, predict: 10.7, profitIA: 3 },
  { date: "2024-05-03", real: 10.8, predict: 11.0, profitIA: 5 },
  { date: "2024-05-06", real: 11.2, predict: 11.5, profitIA: 6 },
];

const last = mockData[mockData.length - 1];
const signal = last.predict > last.real ? "BUY" : "SELL";

export const Predict = () => {
  const [loading, setLoading] = useState(false);
  const [listSymbols, setListSymbols] = useState<any>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectIntervalDate, setSelectIntervalDate] = useState<any>([]);
  const [dataMaket, setDataMaket] = useState<any>({});

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
  }: {
    symbol: string;
    startDate: string;
    endDate: string;
  }) => {
    return API_REST.get(`/events/executeBackTest`, {
      params: {
        symbol,
        startDate,
        endDate,
      },
    });
  };

  // executa predicao dos dados
  const execurePredict = async ({
    symbol,
    startDate,
    endDate,
  }: {
    symbol: string;
    startDate: string;
    endDate: string;
  }) => {
    setLoading(true);
    return API_REST.post(`/events/executePredict`, {
      symbol,
      startDate,
      endDate,
    });
  };

  const searchPredict = () => {
    setLoading(true);
    execurePredict({
      symbol: selectedSymbol,
      startDate: dayjs(selectIntervalDate[0]).format("YYYY-MM-DD HH:mm"),
      endDate: dayjs(selectIntervalDate[1]).format("YYYY-MM-DD HH:mm"),
    })
      .then(() => {
        executeBackTest({
          symbol: selectedSymbol,
          startDate: dayjs(selectIntervalDate[0]).format("YYYY-MM-DD HH:mm"),
          endDate: dayjs(selectIntervalDate[1]).format("YYYY-MM-DD HH:mm"),
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
    setListSymbols(listSymbols.filter((item: any) => item.symbol.includes(String(e).toUpperCase())));
  };

  useEffect(() => {
    getSymbols();
  }, []);

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
               <Input onChange={(e) => handleFilterListSymbols(e.target.value)} placeholder="Buscar..." />
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
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Última Predição">
                <Statistic
                  title="Preço de Mercado"
                  value={last.real}
                  precision={2}
                />
                <Statistic
                  title="Preço Predito"
                  value={last.predict}
                  precision={2}
                />
                <div style={{ marginTop: 16 }}>
                  <Tag color={signal === "BUY" ? "green" : "red"}>{signal}</Tag>
                </div>
              </Card>
            </Col>

            <Col span={16}>
              <Card title="Lucro Acumulado (IA)">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dataMaket?.output}>
                    <XAxis dataKey="closeOrderDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profitIA"
                      stroke="#faad14"
                      name="Lucro IA"
                    />
                    <Line
                      type="monotone"
                      dataKey="profitMarket"
                     stroke="#1890ff"
                      name="Lucro Real"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col span={24}>
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
          </Row>
        </Spin>
      </Col>
    </Row>
  );
};
