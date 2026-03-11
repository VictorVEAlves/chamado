/* eslint-disable @next/next/no-img-element */
import { FileText, ImageIcon, Paperclip } from "lucide-react";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/tickets/CommentThread";
import { TicketDetailSidebar } from "@/components/tickets/TicketDetailSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/lib/data/auth";
import { getTicketDetails } from "@/lib/data/tickets";
import { isImageFile, isPdfFile } from "@/lib/utils";

interface TicketDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const [{ profile }, details] = await Promise.all([
    requireAuthenticatedUser(),
    getTicketDetails(params.id),
  ]);

  if (!details) {
    notFound();
  }

  const { ticket, attachments, comments, history, assignableUsers } = details;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{ticket.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-[1.5rem] border border-border bg-[#111111] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {ticket.description}
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Anexos</h2>
              </div>
              {attachments.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.signed_url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-[1.5rem] border border-border bg-[#111111] transition hover:border-primary/40"
                    >
                      {isImageFile(attachment.file_name) ? (
                        <div className="space-y-3">
                          {attachment.signed_url ? (
                            <img
                              alt={attachment.file_name}
                              className="h-48 w-full object-cover"
                              src={attachment.signed_url}
                            />
                          ) : (
                            <div className="flex h-48 items-center justify-center bg-secondary">
                              <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          <div className="px-4 pb-4 text-sm font-medium">
                            {attachment.file_name}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[180px] flex-col justify-between p-5">
                          <FileText className="h-10 w-10 text-primary" />
                          <div>
                            <p className="font-medium">{attachment.file_name}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {isPdfFile(attachment.file_name)
                                ? "Abrir PDF"
                                : "Baixar anexo"}
                            </p>
                          </div>
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Este chamado não possui anexos.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <CommentThread ticketId={ticket.id} comments={comments} />
      </div>
      <TicketDetailSidebar
        ticket={ticket}
        history={history}
        profile={profile}
        assignableUsers={assignableUsers}
      />
    </div>
  );
}
