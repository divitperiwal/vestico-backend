import { handleDhanCallback, handleGenerateConsentToken } from '@/modules/broker/dhan/dhan.controller.js';
import { accessTokenMiddleware } from '@/middlewares/accessToken.middleware.js';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { csrfMiddleware } from '@/middlewares/csrf.middleware.js';
import Router from 'express';
import { handleGetEtfPortfolio, handleGetPortfolio, handleGetStockPortfolio } from '../mstock/mstock.controller.js';


const router = Router();

//Callback Route for Dhan Auth
router.get('/callback/:id', handleDhanCallback);

//Middlewares
router.use(authMiddleware);
// router.use(csrfMiddleware);
router.get('/generate-consent', handleGenerateConsentToken)
router.use(accessTokenMiddleware);

//Routes

router.get('/portfolio', handleGetPortfolio);
router.get('/portfolio/stock', handleGetStockPortfolio)
router.get('/portfolio/etf', handleGetEtfPortfolio)


export default router;
