import { z } from 'zod';

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
});

export type LoginDto = z.infer<typeof loginSchema>;
