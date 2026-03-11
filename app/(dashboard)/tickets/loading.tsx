import { Skeleton } from "@/components/ui/skeleton";

export default function TicketsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 rounded-[1.5rem]" />
      <Skeleton className="h-[480px] rounded-[1.5rem]" />
    </div>
  );
}
