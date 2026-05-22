import { asyncHandler } from '@/utils/response/async.js';
import { AdminService } from './admin.service.js';
import { sendSuccess } from '@/utils/response/response.js';
import { DhanCredentialsSchema, MstockCredentialsSchema, UpdateUserParamsSchema, UserParamsSchema, RegisterUserSchema } from './admin.validation.js';

export const AdminController = {
  registerUser: asyncHandler(asyncHandler(async (req, res) => {
    const { username, email, password, name, broker, strategy } = RegisterUserSchema.parse(req.body);
    const register = await AdminService.registerUser(username, email, password, name, broker, strategy);
    return sendSuccess(res, 201, 'User Registered Successfully', register);
  })),

  getAllUsers: asyncHandler(async (req, res) => {
    const users = await AdminService.getAllUsers();
    return sendSuccess(res, 200, 'Users fetched successfully', users);
  }),

  getUser: asyncHandler(async (req, res) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const user = await AdminService.getUser(userId);
    return sendSuccess(res, 200, 'User fetched successfully', user);
  }),

  updateUser: asyncHandler(async (req, res) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const updateData = UpdateUserParamsSchema.parse(req.body);
    await AdminService.updateUser(userId, updateData);
    return sendSuccess(res, 200, 'User updated successfully');
  }),

  getBrokerCredentials: asyncHandler(async (req, res) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const credentials = await AdminService.isCredentialsPresent(userId);
    return sendSuccess(res, 200, 'Broker credentials fetched successfully', { present: credentials });
  }),

  updateBrokerCredentials: asyncHandler(async (req, res) => {
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
    return sendSuccess(res, 200, 'Broker credentials updated successfully');
  }),

  revokeSession: asyncHandler(async (req, res) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    await AdminService.revokeUserSession(userId);
    return sendSuccess(res, 200, 'User sessions revoked successfully');
  }),

  getUserPortfolio: asyncHandler(async (req, res) => {
    const { id: userId } = UserParamsSchema.parse(req.params);
    const portfolio = await AdminService.getUserPortfolio(userId);
    return sendSuccess(res, 200, 'User portfolio fetched successfully', portfolio);
  })

}

