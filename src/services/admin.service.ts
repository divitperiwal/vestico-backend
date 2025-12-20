import { getAllUsers, getBrokerCredentialsById, getUserById, updateBrokerCredentialsById, updateUserById } from "@/database/admin.database.js";
import type { BaseBrokerCredentials } from "@/types/common.js";
import { ApiError } from "@/utils/ApiError.js";
import { decryptData, encryptData } from "@/utils/encryption.js";

export const getUsers = async () => {
  return await getAllUsers();
};

export const getUser = async (userId: string) => {
  if (!userId) throw new ApiError("User ID is required", 400);
  const user = await getUserById(userId);
  if (!user) throw new ApiError("User not found", 404);
  return user;
};

export const updateUser = async (userId: string, updateData: any) => {
  if (!userId) throw new ApiError("User ID is required", 400);
  const user = await getUserById(userId);
  if (!user) throw new ApiError("User not found", 404);

  //Update fields
  if (Object.keys(updateData).length === 0)
    throw new ApiError("No data provided for update", 400);
  await updateUserById(userId, updateData);

  return;
};

export const updateBrokerCredentials = async (userId: string, broker: string, credentials:object) => {
  if (!userId) throw new ApiError("User ID is required", 400);
  const user = await getUserById(userId);
  if (!user) throw new ApiError("User not found", 404);

  //Update fields
  if(Object.keys(credentials).length === 0) throw new ApiError("No credentials provided for update", 400);

  //Get Existing Credentials
  let existingRow = await getBrokerCredentialsById(userId);
  let existingCredentials : BaseBrokerCredentials = {};

  //Decrypt Existing Credentials
  if(existingRow?.credentials){
    try{
      const decrypted = decryptData(existingRow.credentials as string);
      existingCredentials = JSON.parse(decrypted);
    }catch(error){
      throw new ApiError("Error decrypting existing broker credentials", 500);
    }
  }


  //Merge Credentials
  const mergedCredentials = {
    ...existingCredentials,
    ...credentials,
    accessToken : existingCredentials?.accessToken || null,
    accessTokenExpiry : existingCredentials?.accessTokenExpiry || null
  }

  //Encrypt Credentials
  const encryptedCredentials = encryptData(JSON.stringify(mergedCredentials));
  await updateBrokerCredentialsById(userId, encryptedCredentials);

  return;
}