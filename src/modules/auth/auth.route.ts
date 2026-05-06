import { Router } from 'express';
import { AuthController } from '@/modules/auth/auth.controller';

const router = Router();

//Authentication Routes

router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);

export default router;
