import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { corsOptions } from '@/constant.js';
import adminRoutes from '@/modules/admin/admin.route.js';
import authRoutes from '@/modules/auth/auth.route.js';
import userRoutes from '@/modules/users/user.route.js';
import dhanRoutes from '@/modules/broker/dhan/dhan.route.js';
import mstockRoutes from '@/modules/broker/mstock/mstock.route.js';
import bffRoutes from '@/modules/bff/bff.route.js';
import { sendSuccess } from './utils/helper/response.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { wednesdayRebalanceJob, fridayRebalanceJob } from './jobs/ranks.job.js';
const app = express();
app.disable('x-powered-by');

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Health Routes
app.get('/', (req, res) => {
  sendSuccess(res, 200, 'Welcome to the API');
});

app.get('/health', (req, res) => {
  sendSuccess(res, 200, 'Server is healthy', { timestamp: Date.now() });
});

//Schedule Jobs
wednesdayRebalanceJob();
fridayRebalanceJob();


//BFF Routes
app.use('/api/v1/bff', bffRoutes);
//Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/mstock', mstockRoutes);
app.use('/api/v1/dhan', dhanRoutes);

//Admin only Routes
app.use('/api/v1/admin', adminRoutes);

//Error Handling Middlewares
app.use(errorHandler);
app.use(notFound);

export default app;
