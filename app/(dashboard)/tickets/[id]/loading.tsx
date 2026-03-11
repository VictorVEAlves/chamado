import { Skeleton } from "@/components/ui/skeleton";

export default function TicketDetailLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <div className="space-y-6">
        <Skeleton className="h-[420px] rounded-[1.5rem]" />
        <Skeleton className="h-[420px] rounded-[1.5rem]" />
      </div>
      <Skeleton className="h-[520px] rounded-[1.5rem]" />
    </div>
  );
}
