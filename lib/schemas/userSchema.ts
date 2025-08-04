// schemas/userSchema.ts
import { z } from "zod";

export const createUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    role: z.enum(["admin", "cashier", "delivery", "user"]),
    useGeneratedPassword: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    sendCredentials: z.boolean(),
    requireEmailVerification: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.useGeneratedPassword) {
        return data.password && data.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (!data.useGeneratedPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
