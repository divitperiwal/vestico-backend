import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { accessTokenMiddleware } from "@/middlewares/access-token.js";
import { webDashboardHandler, tickerDataHandler } from "./bff.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/web/dashboard", accessTokenMiddleware, webDashboardHandler);
router.get("/web/ticker/:ticker", accessTokenMiddleware, tickerDataHandler);


export default router;