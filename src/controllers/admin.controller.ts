import { getUser, getUsers, updateBrokerCredentials, updateUser } from "@/services/admin.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";
import { sendSuccess } from "@/utils/response.js";
import {
  DhanCredentialsSchema,
  MstockCredentialsSchema,
  UpdateUserParamsSchema,
  UserParamsSchema,
} from "@/types/validation/admin.validation.js";
import { getUserBroker } from "@/database/admin.database.js";

export const handleGetAllUsers = asyncHandler(async (req, res) => {
  const users = await getUsers();
  return sendSuccess(res, 200, "Users fetched successfully", users);
});

export const handleGetUser = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const user = await getUser(userId);
  return sendSuccess(res, 200, "User fetched Successfully", user);
});

export const handleUpdateUser = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const updateData = UpdateUserParamsSchema.parse(req.body);
  await updateUser(userId, updateData);

  return sendSuccess(res, 200, "User updated successfully");
});

export const handleUpdateBrokerCredentials = asyncHandler(async (req, res) => {
  const { id: userId } = UserParamsSchema.parse(req.params);
  const {broker} = await getUserBroker(userId);
  let updateData;
  switch (broker) {
    case "dhan":
      updateData = DhanCredentialsSchema.parse(req.body);
      break;
    case "mstock":
      updateData = MstockCredentialsSchema.parse(req.body);
      break;
  }
  await updateBrokerCredentials(userId, broker, updateData);
  return sendSuccess(res, 200, "Broker credentials updated successfully");
});


