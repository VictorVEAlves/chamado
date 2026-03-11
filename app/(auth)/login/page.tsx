import { LoginForm } from "@/components/auth/LoginForm";

interface LoginPageProps {
  searchParams?: {
    disabled?: string;
    redirectedFrom?: string;
    confirmation?: string;
    email?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  let alertMessage: string | undefined;

  if (searchParams?.disabled) {
    alertMessage = "Sua conta esta desativada. Procure um administrador.";
  } else if (searchParams?.confirmation) {
    alertMessage = searchParams.email
      ? `Conta criada. Confirme o email enviado para ${searchParams.email} antes de entrar.`
      : "Conta criada. Confirme seu email antes de entrar.";
  } else if (searchParams?.redirectedFrom) {
    alertMessage = "Faca login para continuar.";
  }

  return <LoginForm alertMessage={alertMessage} />;
}
