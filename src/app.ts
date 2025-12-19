import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { cookieOptions, corsOptions } from "@/constant.js";
import authRoutes from "@/routes/auth.route.js";
import { sendSuccess } from "./utils/response.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
const app = express();
app.disable("x-powered-by");

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Health Routes
app.get("/", (req, res) => {
  sendSuccess(res, 200, "Welcome to the API");
});

app.get("/health", (req, res) => {
  sendSuccess(res, 200, "Server is healthy", { timestamp: Date.now() });
});

//Routes
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);
app.use(notFound);

export default app;
