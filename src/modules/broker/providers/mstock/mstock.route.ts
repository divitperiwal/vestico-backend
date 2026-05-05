import { Router } from 'express';
import { MstockController } from "@/modules/broker/mstock/mstock.controller";
import { authMiddleware } from '@/middlewares/auth.middleware';
import { accessTokenMiddleware } from '@/middlewares/access-token';

const router = Router();

//Middlewares
router.use(authMiddleware);

//Routes
router.use(accessTokenMiddleware);
router.get('/portfolio', MstockController.getPortfolio);
router.get('/funds', MstockController.getFunds);
// router.get('/positions', MstockController.getPositions);

//Data
router.get('/data/instruments', MstockController.getInstruments);
router.get('/data/olhc/:ticker', MstockController.getOLHCData);
router.get('/data/intraday/:ticker', MstockController.getIntradayData);

export default router;
