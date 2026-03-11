import { z } from "zod";
import { DEPARTMENT_OPTIONS } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Informe um email válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Informe o nome completo."),
    email: z.string().email("Informe um email válido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "A confirmação deve ter pelo menos 6 caracteres."),
    department: z.enum(DEPARTMENT_OPTIONS),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z.string().min(3, "Informe o nome completo."),
  avatar_url: z.string().url("Informe uma URL válida.").nullable().optional(),
});

export const toggleUserActiveSchema = z.object({
  userId: z.string().uuid("Usuário inválido."),
  active: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;
