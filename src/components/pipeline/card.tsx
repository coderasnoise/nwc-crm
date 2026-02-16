'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';

interface PipelineCardProps {
    id: string;
    lead: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        stage: string | null;
        offers?: { amount: number; currency: string }[];
    };
}

export function PipelineCard({ id, lead }: PipelineCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const amount = lead.offers?.[0];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="mb-3 cursor-grab rounded-md border border-border bg-card p-3 shadow-sm hover:shadow-md active:cursor-grabbing"
        >
            <Link href={`/leads/${lead.id}`} className="block">
                <h4 className="font-medium hover:underline">
                    {lead.first_name} {lead.last_name}
                </h4>
            </Link>
            {amount && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: amount.currency || 'EUR',
                    }).format(amount.amount)}
                </p>
            )}
        </div>
    );
}
