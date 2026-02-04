import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { checkAdminMiddleware } from '@/middlewares/admin.middleware.js';
import {
  handleGetAllUsers,
  handleGetUser,
  handleUpdateUser,
  handleUpdateBrokerCredentials,
  handleRevokeSessionAdmin,
  handleGetUserPortfolio,
  handleGetRanks,
  handleGenerateRank,
  handleGetBrokerCredentials,
  handleRegisterUser,
} from '@/modules/admin/admin.controller.js';

const router = Router();

//Middlewares
router.use(authMiddleware);
router.use(checkAdminMiddleware);

//Register User
router.post('/users/register', handleRegisterUser);

router.get('/users', handleGetAllUsers);
router.get('/users/:id', handleGetUser);
router.post('/users/:id', handleUpdateUser);

//Update Broker Credentials
router.get('/users/:id/broker-credentials', handleGetBrokerCredentials);
router.post('/users/:id/broker-credentials', handleUpdateBrokerCredentials);
router.get('/users/:id/portfolio', handleGetUserPortfolio);

//Get Ranks
router.get('/ranks/:day', handleGetRanks);
router.get('/ranks/:day/generate', handleGenerateRank )

//Logout user
router.get('/users/:id/revoke-session', handleRevokeSessionAdmin);

export default router;
