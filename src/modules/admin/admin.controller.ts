import { asyncHandler } from '@/utils/response/async.js';
import { AdminService } from './admin.service.js';
import { sendSuccess } from '@/utils/response/response.js';
import { DhanCredentialsSchema, MstockCredentialsSchema, UpdateUserParamsSchema, UserParamsSchema, RegisterUserSchema, GetDaySchema, GenerateReportSchema } from './admin.validation.js';
import type { Request, Response } from 'express';

export const AdminController = {
  registerUser: asyncHandler(asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, name, broker, strategy } = RegisterUserSchema.parse(req.body);
    const register = await AdminService.registerUser(username, email, password, name, broker, strategy);
    sendSuccess(res, 201, 'User Registered Successfully', register);
  })),

  getAllUsers: asyncHandler(async (_, res: Response) => {
    const users = await AdminService.getAllUsers();
    sendSuccess(res, 200, 'Users fetched successfully', users);
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const user = await AdminService.getUser(userId);
    sendSuccess(res, 200, 'User fetched successfully', user);
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const updateData = UpdateUserParamsSchema.parse(req.body);
    await AdminService.updateUser(userId, updateData);
    sendSuccess(res, 200, 'User updated successfully');
  }),

  getBrokerCredentials: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const credentials = await AdminService.isCredentialsPresent(userId);
    sendSuccess(res, 200, 'Broker credentials fetched successfully', { present: credentials });
  }),

  updateBrokerCredentials: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const broker = await AdminService.getUserBroker(userId);

    let updateData;
    switch (broker) {
      case 'dhan':
        updateData = DhanCredentialsSchema.parse(req.body);
        break;

      case 'mstock':
        updateData = MstockCredentialsSchema.parse(req.body);
        break;
    }
    await AdminService.updateBrokerCredentials(userId, updateData);
    sendSuccess(res, 200, 'Broker credentials updated successfully');
  }),

  revokeSession: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    await AdminService.revokeUserSession(userId);
    sendSuccess(res, 200, 'User sessions revoked successfully');
  }),

  getUserPortfolio: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const portfolio = await AdminService.getUserPortfolio(userId);
    sendSuccess(res, 200, 'User portfolio fetched successfully', portfolio);
  }),

  getReports: asyncHandler(async (req: Request, res: Response) => {
    const { day } = GetDaySchema.parse(req.params);
    const reports = await AdminService.getReports(day);
    sendSuccess(res, 200, 'Reports fetched successfully', reports);
  }),

  getUserRecommendation: asyncHandler(async (req: Request, res: Response) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const recommendation = await AdminService.getUserRecommendation(userId);
    sendSuccess(res, 200, 'User recommendation fetched successfully', recommendation);
  }),

  generateReport: asyncHandler(async (req: Request, res: Response) => {
    const { day, date } = GenerateReportSchema.parse(req.body);
    const report = await AdminService.generateReport(day, date);
    sendSuccess(res, 200, 'Report generated successfully', report);
  }),

}

