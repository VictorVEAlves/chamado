"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip, UploadCloud } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PRIORITY_OPTIONS } from "@/lib/constants";
import { createTicketAction } from "@/lib/actions/tickets";
import {
  createTicketSchema,
  type CreateTicketInput,
} from "@/lib/validations/ticket.schema";
import { getDepartmentLabel, getPriorityLabel } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import type { Department } from "@/types";
import { TicketPriorityBadge } from "@/components/tickets/TicketPriorityBadge";

interface TicketFormProps {
  department: Department;
}

export function TicketForm({ department }: TicketFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      department,
      priority: "medium",
      attachments: [],
    },
  });

  const description = watch("description") ?? "";
  const attachments = watch("attachments") ?? [];
  const priority = watch("priority");

  useEffect(() => {
    setValue("department", department);
  }, [department, setValue]);

  const onSubmit = (values: CreateTicketInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", values.title);
      formData.set("description", values.description);
      formData.set("priority", values.priority);
      formData.set("department", values.department);
      values.attachments.forEach((file) => formData.append("attachments", file));

      const result = await createTicketAction(formData);

      if (!result.success) {
        toast.error(result.error ?? "Não foi possível abrir o chamado.");
        return;
      }

      toast.success("Chamado criado com sucesso.");
      router.push(`/tickets/${result.ticketId}`);
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
        Novo chamado para <strong>{getDepartmentLabel(department)}</strong>
      </div>
      <input type="hidden" {...register("department")} />
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Ex.: Solicitação de landing page para campanha de março"
          {...register("title")}
        />
        {errors.title ? (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Descrição</Label>
          <span className="text-xs text-muted-foreground">
            {description.length}/3000 caracteres
          </span>
        </div>
        <Textarea
          id="description"
          rows={6}
          placeholder="Descreva o contexto, impacto, urgência e entregável esperado."
          {...register("description")}
        />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label>Prioridade</Label>
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {getPriorityLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <TicketPriorityBadge priority={priority} />
      </div>
      <div className="space-y-3">
        <Label>Anexos</Label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-border bg-[#111111] px-5 py-8 text-center transition hover:border-primary/40">
          <UploadCloud className="h-7 w-7 text-primary" />
          <div className="space-y-1">
            <p className="font-medium">Envie imagens ou PDFs</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou PDF com até 5MB por arquivo.
            </p>
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            className="hidden"
            onChange={(event) => {
              setValue("attachments", Array.from(event.target.files ?? []), {
                shouldValidate: true,
              });
            }}
          />
        </label>
        {errors.attachments ? (
          <p className="text-xs text-destructive">
            {errors.attachments.message as string}
          </p>
        ) : null}
        {attachments.length ? (
          <div className="space-y-2 rounded-2xl border border-border bg-[#111111] p-4">
            {attachments.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-3 text-sm"
              >
                <Paperclip className="h-4 w-4 text-primary" />
                <span className="truncate">{file.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)}MB
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Criando chamado...
          </>
        ) : (
          "Abrir chamado"
        )}
      </Button>
    </form>
  );
}
