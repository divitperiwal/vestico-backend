import express from 'express';
import cors from 'cors';
import type { Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { corsOptions } from '@/constant';
import adminRoutes from '@/modules/admin/admin.route';
import authRoutes from '@/modules/auth/auth.route';
import userRoutes from '@/modules/users/user.route';
import dhanRoutes from '@/modules/broker/providers/dhan/dhan.route';
import mstockRoutes from '@/modules/broker/providers/mstock/mstock.route';
import brokerRoutes from '@/modules/broker/broker.route';
import bffRoutes from '@/bff/bff.route';
import { sendSuccess } from '@/utils/response/response';
import { errorHandler, notFound } from '@/middlewares/error.middleware';
import statusMonitor from 'express-status-monitor';

const app = express();
app.disable('x-powered-by');

app.use(statusMonitor())
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Health Routes
app.get('/', (_, res: Response) => {
  sendSuccess(res, 200, 'Welcome to the API');
});

app.get('/health', (_, res: Response) => {
  sendSuccess(res, 200, 'Server is healthy', { timestamp: Date.now() });
});


//BFF Routes
app.use('/api/v1/bff', bffRoutes);
//Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/mstock', mstockRoutes);
app.use('/api/v1/dhan', dhanRoutes);
app.use('/api/v1/broker', brokerRoutes);

//Admin only Routes
app.use('/api/v1/admin', adminRoutes);

//Error Handling Middlewares
app.use(errorHandler);
app.use(notFound);

export default app;
