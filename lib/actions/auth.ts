"use server";

import type { AuthError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/validations/user.schema";
import type { AuthActionResult } from "@/types";

function getAuthErrorMessage(error: AuthError | null, fallback: string) {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirme seu email antes de entrar.";
  }

  if (
    code === "invalid_login_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "Email ou senha invalidos.";
  }

  if (
    code === "user_already_exists" ||
    message.includes("user already registered")
  ) {
    return "Ja existe uma conta com esse email.";
  }

  return fallback;
}

export async function loginAction(input: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados invalidos.",
    };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      error: getAuthErrorMessage(error, "Nao foi possivel entrar."),
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Nao foi possivel iniciar a sessao.",
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("active")
    .eq("id", user.id)
    .maybeSingle();

  if (profile && !profile.active) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Sua conta esta desativada.",
    };
  }

  revalidatePath("/dashboard");

  return { success: true };
}

export async function registerAction(
  input: RegisterInput,
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados invalidos.",
    };
  }

  const payload = {
    name: parsed.data.name,
    email: parsed.data.email,
    password: parsed.data.password,
    department: parsed.data.department,
  };
  const supabase = createServerSupabaseClient();
  const admin = createAdminSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
      },
    },
  });

  if (error || !data.user) {
    return {
      success: false,
      error: getAuthErrorMessage(error, "Nao foi possivel criar a conta."),
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    name: payload.name,
    department: payload.department,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return {
      success: false,
      error: "Nao foi possivel concluir o cadastro.",
    };
  }

  if (!data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true,
      email: payload.email,
    };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function logoutAction(): Promise<AuthActionResult> {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/login");
  return { success: true };
}
