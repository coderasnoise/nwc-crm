'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface LeadsToolbarProps {
    stages: string[];
    countries: string[];
    owners: { id: string; name: string }[];
    isAdmin: boolean;
    currentSearch: string;
    currentStage: string;
    currentCountry: string;
    currentOwner: string;
}

export function LeadsToolbar({
    stages,
    countries,
    owners,
    isAdmin,
    currentSearch,
    currentStage,
    currentCountry,
    currentOwner,
}: LeadsToolbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            // Reset to page 1 when filters change
            params.set('page', '1');
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`);
            });
        },
        [router, pathname, searchParams, startTransition],
    );

    const handleSearch = useCallback(
        (value: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                updateParam('search', value);
            }, 400);
        },
        [updateParam],
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search by name or phone…"
                    defaultValue={currentSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Stage filter */}
            <Select
                value={currentStage || 'all'}
                onValueChange={(v) => updateParam('stage', v === 'all' ? '' : v)}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map((s) => (
                        <SelectItem key={s} value={s}>
                            {s}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Country filter */}
            <Select
                value={currentCountry || 'all'}
                onValueChange={(v) => updateParam('country', v === 'all' ? '' : v)}
            >
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                            {c}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Owner filter — admin only */}
            {isAdmin && (
                <Select
                    value={currentOwner || 'all'}
                    onValueChange={(v) => updateParam('owner', v === 'all' ? '' : v)}
                >
                    <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="Owner" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Owners</SelectItem>
                        {owners.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                                {o.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
