//Create a unified broker route that infers the broker from the user and forwards the request to the respective broker route handler
import { Router } from 'express';
import { BrokerController } from './broker.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { accessTokenMiddleware } from '@/middlewares/access-token';

const router = Router();

router.use(authMiddleware)
router.use(accessTokenMiddleware)

router.get('/portfolio', BrokerController.getPortfolio);
router.get('/positions', BrokerController.getPositions);
router.get('/funds', BrokerController.getFunds);
// router.get('/orders', BrokerController.getOrders);

export default router;

