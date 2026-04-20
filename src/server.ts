import http from "http";
import dotenv from 'dotenv';
import app from './app.js';
import { startClientSocketServer } from "./modules/market/market.ws.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

startClientSocketServer(server);

server.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`Server is running on port ${PORT}`);
});
