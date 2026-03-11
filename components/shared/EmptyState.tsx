import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: EmptyStateProps) {
  return (
    <Card className="surface-gradient border-dashed">
      <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
        <svg
          aria-hidden="true"
          className="h-28 w-28"
          fill="none"
          viewBox="0 0 200 200"
        >
          <rect x="28" y="48" width="144" height="104" rx="24" fill="#111111" stroke="#2A2A2A" strokeWidth="4" />
          <path
            d="M58 88h84"
            stroke="#FF6B00"
            strokeLinecap="round"
            strokeWidth="10"
          />
          <path
            d="M58 114h56"
            stroke="#3B82F6"
            strokeLinecap="round"
            strokeWidth="10"
          />
          <circle cx="142" cy="116" r="18" fill="#1A1A1A" stroke="#F59E0B" strokeWidth="4" />
        </svg>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {ctaHref && ctaLabel ? (
          <Button asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
