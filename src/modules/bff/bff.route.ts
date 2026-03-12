import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import { csrfMiddleware } from "@/middlewares/csrf.middleware.js";
import { accessTokenMiddleware } from "@/middlewares/access-token.js";
import { webDashboardHandler, tickerDataHandler, webPortfolioHandler, webPositionHandler, webOrderHandler, webFundsHandler,  } from "./bff.controller.js";

const router = Router();

router.use(csrfMiddleware)
router.use(authMiddleware);

//Web -> Desktop/Laptop
router.get("/web/dashboard", accessTokenMiddleware, webDashboardHandler);
router.get("/web/ticker/:ticker", accessTokenMiddleware, tickerDataHandler);
router.get("/web/portfolio", accessTokenMiddleware, webPortfolioHandler);
router.get("/web/position", accessTokenMiddleware, webPositionHandler);
router.get('/web/orders', accessTokenMiddleware, webOrderHandler);
router.get('/web/funds', accessTokenMiddleware, webFundsHandler);



export default router;