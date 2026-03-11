"use client";

import { useRouter } from "next/navigation";
import { Loader2, SendHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createCommentAction } from "@/lib/actions/tickets";
import { fromNow, getInitials } from "@/lib/utils";
import type { TicketComment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CommentThreadProps {
  ticketId: string;
  comments: TicketComment[];
}

export function CommentThread({ ticketId, comments }: CommentThreadProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await createCommentAction({ ticketId, content: trimmed });
      if (!result.success) {
        toast.error(result.error ?? "Não foi possível enviar o comentário.");
        return;
      }

      setContent("");
      toast.success("Comentário enviado.");
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {comments.length ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-4">
                <Avatar className="h-11 w-11 border border-border">
                  <AvatarImage
                    src={comment.user?.avatar_url ?? undefined}
                    alt={comment.user?.name ?? "Usuário"}
                  />
                  <AvatarFallback>
                    {getInitials(comment.user?.name ?? "Usuário")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-[1.5rem] border border-border bg-[#111111] p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">
                      {comment.user?.name ?? "Usuário"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {fromNow(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhum comentário ainda. Seja o primeiro a registrar contexto aqui.
            </div>
          )}
        </div>
        <div className="space-y-3 rounded-[1.5rem] border border-border bg-[#111111] p-4">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Escreva um comentário. Enter envia, Shift+Enter quebra linha."
            rows={4}
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={isPending || !content.trim()} type="button">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <SendHorizontal className="h-4 w-4" />
                  Enviar comentário
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
