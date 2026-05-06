import { UserController } from '@/modules/users/user.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

//Middlewares
router.use(authMiddleware);

//Routes
router.get('/me', UserController.getUser);
router.post('/me/change-password', UserController.changePassword);
router.get('/recommend', UserController.getRecommendation);

export default router;
