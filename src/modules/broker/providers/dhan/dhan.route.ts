import { DhanController } from './dhan.controller';
import { accessTokenMiddleware } from '@/middlewares/access-token.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import Router from 'express';

const router = Router();

//Middlewares
router.use(authMiddleware);
router.use(accessTokenMiddleware);

//Routes

router.get('/portfolio', DhanController.getPortfolio);


export default router;
