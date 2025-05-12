import axios from "axios";

export const API_WS = "ws://localhost:8081";

export const API_REST = axios.create({
  baseURL: "http://localhost:8081",
});
