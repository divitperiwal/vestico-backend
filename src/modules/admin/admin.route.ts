import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { checkAdminMiddleware } from '@/middlewares/admin.middleware.js';
import { csrfMiddleware } from '@/middlewares/csrf.middleware.js';
import {
  handleGetAllUsers,
  handleGetUser,
  handleUpdateUser,
  handleUpdateBrokerCredentials,
} from '@/modules/admin/admin.controller.js';

const router = Router();

//Middlewares
router.use(authMiddleware);
router.use(checkAdminMiddleware);
// router.use(csrfMiddleware);

router.get('/users', handleGetAllUsers);
router.get('/users/:id', handleGetUser);
router.patch('/users/:id', handleUpdateUser);

//Update Broker Credentials
router.post('/users/:id/broker-credentials', handleUpdateBrokerCredentials);

export default router;
