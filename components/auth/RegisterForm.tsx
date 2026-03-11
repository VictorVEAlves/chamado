"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { APP_NAME, DEPARTMENT_LABELS, DEPARTMENT_OPTIONS } from "@/lib/constants";
import { registerAction } from "@/lib/actions/auth";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const authInputClassName =
  "h-12 rounded-lg border-[#2A2A2A] bg-[#0F0F0F] px-4 text-[0.9375rem] text-white placeholder:text-[#666666] transition-[border-color,box-shadow] duration-200 focus-visible:border-[#FF6B00] focus-visible:ring-[3px] focus-visible:ring-[#FF6B00]/20";

const authSelectTriggerClassName =
  "h-12 rounded-lg border-[#2A2A2A] bg-[#0F0F0F] px-4 text-[0.9375rem] text-white transition-[border-color,box-shadow] duration-200 focus:border-[#FF6B00] focus:ring-[3px] focus:ring-[#FF6B00]/20";

const authSubmitButtonClassName =
  "h-12 w-full rounded-lg bg-[#FF6B00] text-[0.9375rem] font-semibold tracking-[0.01em] text-white shadow-none transition-[background-color] duration-150 hover:bg-[#E66000] focus-visible:ring-[#FF6B00]/25";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: undefined,
    },
  });

  const onSubmit = (values: RegisterInput) => {
    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.success) {
        toast.error(result.error ?? "Falha ao cadastrar.");
        return;
      }

      if (result.requiresEmailConfirmation) {
        toast.success("Conta criada. Confirme o email para entrar.");
        const email = encodeURIComponent(result.email ?? values.email);
        router.push(`/login?confirmation=1&email=${email}`);
        return;
      }

      toast.success("Cadastro realizado com sucesso.");
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
          <h1 className="text-[1.875rem] font-semibold text-white">Criar conta</h1>
          <p className="text-sm leading-6 text-[#888888]">
            Cadastre um novo colaborador no painel da {APP_NAME}
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[0.875rem] font-medium text-white">
              Nome completo
            </Label>
            <Input
              id="name"
              placeholder="Nome e sobrenome"
              className={authInputClassName}
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

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

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[0.875rem] font-medium text-white"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                className={authInputClassName}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[0.875rem] font-medium text-white"
              >
                Confirmar senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className={authInputClassName}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[0.875rem] font-medium text-white">
              Departamento
            </Label>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={authSelectTriggerClassName}>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENT_OPTIONS.map((department) => (
                      <SelectItem key={department} value={department}>
                        {DEPARTMENT_LABELS[department]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.department ? (
              <p className="text-xs text-destructive">{errors.department.message}</p>
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
              Criando conta...
            </>
          ) : (
            "Cadastrar"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[#888888]">
        Ja possui conta?{" "}
        <Link
          className="font-medium text-[#FF6B00] hover:text-[#FF6B00]/80"
          href="/login"
        >
          Faca login
        </Link>
      </p>
    </div>
  );
}
