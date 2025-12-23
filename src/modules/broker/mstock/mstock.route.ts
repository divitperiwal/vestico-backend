import { Router } from 'express';
import { csrfMiddleware } from '@/middlewares/csrf.middleware.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import {
  handleGetEtfPortfolio,
  handleGetFunds,
  handleGetPortfolio,
  handleGetStockPortfolio,
} from './mstock.controller.js';
import { accessTokenMiddleware } from '@/middlewares/access-token.js';

const router = Router();

//Middlewares
router.use(authMiddleware);
// router.use(csrfMiddleware);

//Routes
router.use(accessTokenMiddleware);
router.get('/portfolio', handleGetPortfolio);
router.get('/portfolio/etf', handleGetEtfPortfolio);
router.get('/portfolio/stock', handleGetStockPortfolio);
router.get('/funds', handleGetFunds);

export default router;
