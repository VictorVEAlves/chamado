"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions/auth";
import { APP_NAME } from "@/lib/constants";
import { loginSchema, type LoginInput } from "@/lib/validations/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  alertMessage?: string;
}

const authInputClassName =
  "h-12 rounded-lg border-[#2A2A2A] bg-[#0F0F0F] px-4 text-[0.9375rem] text-white placeholder:text-[#666666] transition-[border-color,box-shadow] duration-200 focus-visible:border-[#FF6B00] focus-visible:ring-[3px] focus-visible:ring-[#FF6B00]/20";

const authSubmitButtonClassName =
  "h-12 w-full rounded-lg bg-[#FF6B00] text-[0.9375rem] font-semibold tracking-[0.01em] text-white shadow-none transition-[background-color] duration-150 hover:bg-[#E66000] focus-visible:ring-[#FF6B00]/25";

export function LoginForm({ alertMessage }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginInput) => {
    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.success) {
        toast.error(result.error ?? "Falha ao entrar.");
        return;
      }

      toast.success("Login realizado com sucesso.");
      router.push("/dashboard");
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF6B00]/15 text-[0.7rem] font-semibold text-[#FF6B00]">
          FP
        </div>
        <div className="space-y-2">
          <h1 className="text-[1.875rem] font-semibold text-white">Entrar</h1>
          <p className="text-sm leading-6 text-[#888888]">
            Acesse o painel da {APP_NAME}
          </p>
        </div>
      </div>

      {alertMessage ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#FF6B00]/20 bg-[#FF6B00]/10 p-4 text-sm text-[#FF6B00]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{alertMessage}</span>
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[0.875rem] font-medium text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@fastpdrtools.com"
              className={authInputClassName}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[0.875rem] font-medium text-white">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              className={authInputClassName}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
        </div>

        <Button
          className={authSubmitButtonClassName}
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[#888888]">
        Ainda nao tem conta?{" "}
        <Link
          className="font-medium text-[#FF6B00] hover:text-[#FF6B00]/80"
          href="/register"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
