import z from "zod";

export const changePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
}).strict();