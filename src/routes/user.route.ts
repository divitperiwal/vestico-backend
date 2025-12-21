import { handleChangePassword, handleGetProfile } from '@/controllers/user.controller.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { csrfMiddleware } from '@/middlewares/csrf.middleware.js';
import { Router } from 'express';

const router = Router();

//Middlewares
router.use(authMiddleware);
// router.use(csrfMiddleware);

//Routes
router.get('/me', handleGetProfile);
router.post('/me/change-password', handleChangePassword);

export default router;
