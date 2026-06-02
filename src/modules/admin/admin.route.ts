import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware.js';
import { checkAdminMiddleware } from '@/middlewares/admin.middleware.js';
import { AdminController } from '@/modules/admin/admin.controller.js';

const router = Router();
const userRouter = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(checkAdminMiddleware);

// User routes
router.post('/users', AdminController.registerUser);
router.get('/users', AdminController.getAllUsers);
router.use('/users/:id', userRouter);

// Nested under /users/:id
userRouter.get('/', AdminController.getUser);
userRouter.patch('/', AdminController.updateUser);
userRouter.delete('/session', AdminController.revokeSession);
userRouter.get('/broker-credentials', AdminController.getBrokerCredentials);
userRouter.patch('/broker-credentials', AdminController.updateBrokerCredentials);
userRouter.get('/portfolio', AdminController.getUserPortfolio);


//Additional Admin Routes
router.get('/reports/:day', AdminController.getReports);
router.get('/recommendation/:id', AdminController.getUserRecommendation);
router.post('/generate/report', AdminController.generateReport);

export default router;