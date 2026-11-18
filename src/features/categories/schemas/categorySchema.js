import { z } from "zod";

// Category form validation
export const categorySchema = z.object({
  image: z.any().optional(),
  is_active: z.boolean(),
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .min(2, "Category name must be at least 2 characters"),

  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
});
