// EDIT
import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is not set."),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const config = Object.freeze(EnvSchema.parse(process.env));