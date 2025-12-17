import { createSession } from "@/services/auth.service.js";
import { asyncHandler } from "@/utils/asyncHandler.js";

export const handleLogin = asyncHandler(async (req, res) => {
   const session = await createSession("102e410a-d92a-463c-ac9c-45d9e895b65d");
});

export const handleRegister = asyncHandler(async (req, res) => {
  //Login
});
