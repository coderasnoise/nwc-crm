'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Lead } from './queries';

const STAGE_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

interface LeadsTableProps {
    leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
    if (leads.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-sm text-muted-foreground">No leads found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="text-right">Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">
                                {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                                {lead.phone || '—'}
                            </TableCell>
                            <TableCell>{lead.country || '—'}</TableCell>
                            <TableCell>
                                {lead.stage ? (
                                    <Badge
                                        variant="secondary"
                                        className={STAGE_COLORS[lead.stage.toLowerCase()] ?? ''}
                                    >
                                        {lead.stage}
                                    </Badge>
                                ) : (
                                    '—'
                                )}
                            </TableCell>
                            <TableCell>{lead.owner_name || '—'}</TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                                {formatDate(lead.created_at)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
