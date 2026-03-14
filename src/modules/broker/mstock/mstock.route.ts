import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import {
  handleGetEtfPortfolio,
  handleGetFunds,
  handleGetInstruments,
  handleGetLTP,
  handleGetPortfolio,
  handleGetPositions,
  handleGetStockPortfolio,
  handleGetWsConnection,
  handleIntradayData,
  handleLogout,
  handleOlhcData
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
router.get('/positions', handleGetPositions);
router.get('/funds', handleGetFunds);
router.get('/logout', handleLogout)

//Data
router.get('/market/connect', handleGetWsConnection);

router.get('/data/instruments', handleGetInstruments);
router.get('/data/olhc/:ticker', handleOlhcData);
router.get('/data/intraday/:ticker', handleIntradayData);
router.get('/data/ltp/:ticker', handleGetLTP)

export default router;
