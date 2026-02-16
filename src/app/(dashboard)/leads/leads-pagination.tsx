'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadsPaginationProps {
    currentPage: number;
    totalCount: number;
    pageSize: number;
}

export function LeadsPagination({
    currentPage,
    totalCount,
    pageSize,
}: LeadsPaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const goToPage = useCallback(
        (page: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(page));
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        },
        [router, pathname, searchParams, startTransition],
    );

    const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, totalCount);

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{from}</span>–
                <span className="font-medium">{to}</span> of{' '}
                <span className="font-medium">{totalCount}</span> leads
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
