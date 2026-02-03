import { asyncHandler } from '@/utils/constants/asyncHandler.js';
import { AdminService } from './admin.service.js';
import { sendSuccess } from '@/utils/helper/response.js';
import {
  DhanCredentialsSchema,
  MstockCredentialsSchema,
  UpdateUserParamsSchema,
  UserParamsSchema,
} from '@/types/validation/admin.validation.js';
import { RankGenerator } from '@/lib/generate-rank.js';

export const handleGetAllUsers = asyncHandler(async (req, res) => {
  const users = await AdminService.getAllUsers();
  return sendSuccess(res, 200, 'Users fetched successfully', users);
});

export const handleGetUser = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const user = await AdminService.getUser(userId);
  return sendSuccess(res, 200, 'User fetched successfully', user);
});

export const handleUpdateUser = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const updateData = UpdateUserParamsSchema.parse(req.body);
  await AdminService.updateUser(userId, updateData);
  return sendSuccess(res, 200, 'User updated successfully');
});

export const handleGetBrokerCredentials = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const credentials = await AdminService.isCredentialsPresent(userId);
  return sendSuccess(res, 200, 'Broker credentials fetched successfully', { present: credentials });
});

export const handleUpdateBrokerCredentials = asyncHandler(async (req, res) => {
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
});

export const handleRevokeSessionAdmin = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  await AdminService.revokeUserSession(userId);
  return sendSuccess(res, 200, 'User sessions revoked successfully');
});

export const handleGetUserPortfolio = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const portfolio = await AdminService.getUserPortfolio(userId);
  return sendSuccess(res, 200, 'User portfolio fetched successfully', portfolio);
});

export const handleGetRanks = asyncHandler(async (req, res) => {
  const { day } = req.params;
  const result = await RankGenerator.getRanks(day);
  return sendSuccess(res, 200, 'Ranks fetched successfully', result);
});

export const handleGenerateRank = asyncHandler(async (req, res) => {
  const { day } = req.params;
  const result = await RankGenerator.generateRank(day);
  return sendSuccess(res, 200, 'Ranks generated successfully', result);
});
