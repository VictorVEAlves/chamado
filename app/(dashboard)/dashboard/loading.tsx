import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[380px] rounded-[1.5rem]" />
        <Skeleton className="h-[380px] rounded-[1.5rem]" />
      </div>
    </div>
  );
}
