import { setupGlobalErrorHandlers } from "@/utils/response/error.js";
setupGlobalErrorHandlers();

import http from "http";
import app from './app.js';
import { startClientSocketServer } from "./modules/market/market.ws.js";
import { initJobs, startJobs } from "./jobs/index.js";


const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

startClientSocketServer(server);

await initJobs();
startJobs();

server.listen({ port: PORT, host: '0.0.0.0' }, () => {
  console.log(`Server is running on port ${PORT}`);
});
