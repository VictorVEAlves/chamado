"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  hasPrevious,
  hasNext,
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => goToPage(page - 1)}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          onClick={() => goToPage(page + 1)}
          disabled={!hasNext}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
