"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { DEPARTMENT_LABELS, DEPARTMENT_OPTIONS } from "@/lib/constants";
import { registerAction } from "@/lib/actions/auth";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/user.schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <Card className="surface-gradient border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UserPlus className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Cadastre um novo colaborador no sistema interno.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Nome e sobrenome" {...register("name")} />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@fastpdrtools.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
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
            <Label>Departamento</Label>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
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
          <Button className="w-full" type="submit" disabled={isPending}>
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
        <p className="text-sm text-muted-foreground">
          Ja possui conta?{" "}
          <Link className="font-medium text-primary hover:text-primary/80" href="/login">
            Faca login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
