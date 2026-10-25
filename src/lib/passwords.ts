import { z } from "zod";

export const PASSWORD_MIN = 8;

export const passwordFields = {
  newPassword: z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters`).max(128, "That's too long"),
  confirmPassword: z.string().min(1, "Repeat the new password"),
};

export const passwordsMatch = (v: { newPassword: string; confirmPassword: string }) => v.newPassword === v.confirmPassword;
export const mismatch = { path: ["confirmPassword"], message: "Passwords don't match" };

export const newPasswordSchema = z.object(passwordFields).refine(passwordsMatch, mismatch);

export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
