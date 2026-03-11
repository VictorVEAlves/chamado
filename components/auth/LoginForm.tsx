"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/user.schema";
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

interface LoginFormProps {
  alertMessage?: string;
}

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
    <Card className="surface-gradient border-border/80">
      <CardHeader className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <LogIn className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Acesse o painel interno de chamados da Fast PDR Tools.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {alertMessage ? (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{alertMessage}</span>
          </div>
        ) : null}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          <Button className="w-full" type="submit" disabled={isPending}>
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
        <p className="text-sm text-muted-foreground">
          Ainda nao tem conta?{" "}
          <Link className="font-medium text-primary hover:text-primary/80" href="/register">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
