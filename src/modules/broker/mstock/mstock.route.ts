import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import {
  handleGetEtfPortfolio,
  handleGetFunds,
  handleGetPortfolio,
  handleGetStockPortfolio,
  handleLogout
} from './mstock.controller.js';
import { accessTokenMiddleware } from '@/middlewares/access-token.js';

const router = Router();

//Middlewares
router.use(authMiddleware);

//Routes
router.use(accessTokenMiddleware);
router.get('/portfolio', handleGetPortfolio);
router.get('/portfolio/etf', handleGetEtfPortfolio);
router.get('/portfolio/stock', handleGetStockPortfolio);
router.get('/funds', handleGetFunds);
router.get('/logout', handleLogout)

export default router;
