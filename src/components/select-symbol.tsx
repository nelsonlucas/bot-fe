import { useCallback, useEffect, useState } from "react";
import { API_WS } from "../api/api";
import useWebSocket from "react-use-websocket";

interface Props {
  onChange: React.Dispatch<React.SetStateAction<string>>;
}
export const SelectSymbol: React.FC<Props> = ({ onChange }) => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const { sendJsonMessage, readyState, lastJsonMessage } = useWebSocket(API_WS);

  const handleGetSymbol = useCallback(() => {
    sendJsonMessage({
      event: "getSymbol",
    });
  }, []);

  useEffect(() => {
    handleGetSymbol();
  }, []);

  useEffect(() => {
    const { event, data } = (lastJsonMessage as any) || {};
    switch (event) {
      case "getSymbol":
        setSymbols(data || []);
        break;
      default:
        break;
    }
  }, [lastJsonMessage]);

  return (
    <label>
      Symbol:
      <select onChange={(e) => onChange(e.target.value)}>
        {symbols.map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol}
          </option>
        ))}
      </select>
    </label>
  );
};
