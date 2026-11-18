import { z } from "zod";

export const sizeSchema = z.object({
  value: z.number({ error: "Enter a valid size" }).int("Size must be a whole number"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
});
