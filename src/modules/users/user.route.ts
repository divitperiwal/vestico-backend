import { handleChangePassword, handleGetProfile, handleGetRecommendation } from '@/modules/users/user.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

//Middlewares
router.use(authMiddleware);

//Routes
router.get('/me', handleGetProfile);
router.post('/me/change-password', handleChangePassword);

router.get('/recommend', handleGetRecommendation)
export default router;
