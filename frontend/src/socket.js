import { io } from "socket.io-client";

const baseUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "");

const socket = io(baseUrl, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
