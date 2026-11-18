import { z } from "zod";

// valueAsNumber keeps blank inputs invalid rather than converting them to zero.
export const deliverySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  fee: z.number({ error: "Enter a valid fee" }).nonnegative("Fee cannot be negative"),
  estimated_min_days: z.number({ error: "Enter minimum days" }).int().nonnegative(),
  estimated_max_days: z.number({ error: "Enter maximum days" }).int().nonnegative(),
  logo: z.any().nullable(),
}).refine((values) => values.estimated_max_days >= values.estimated_min_days, {
  message: "Maximum days must be at least minimum days",
  path: ["estimated_max_days"],
});
