import {z} from "zod";

export const GetUserParamsSchema = z.object({
    id: z.uuid("Invalid user ID").trim(),
}).strict();
