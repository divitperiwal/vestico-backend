import { Router } from 'express';
import { csrfMiddleware } from '@/middlewares/csrf.middleware.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import {
  handleGetMstockPortfolio,
  handleGetMstockFunds,
  handleGetMstockPortfolioEtf,
  handleGetMstockPortfolioStock,
} from '@/controllers/mstock.controller.js';
import { accessTokenMiddleware } from '@/middlewares/accessToken.middleware.js';

const router = Router();

//Middlewares
router.use(authMiddleware);
// router.use(csrfMiddleware);

//Routes
router.use(accessTokenMiddleware);
router.get('/portfolio', handleGetMstockPortfolio);
router.get('/portfolio/etf', handleGetMstockPortfolioEtf);
router.get('/portfolio/stock', handleGetMstockPortfolioStock);
router.get('/funds', handleGetMstockFunds);

export default router;
