import { Router } from 'express';
import { BFFController } from './bff.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { accessTokenMiddleware } from '@/middlewares/access-token';

const router = Router();

router.use(authMiddleware)

router.get('/web/mobile/dashboard', BFFController.Mobile.getDashboard);



export default router;