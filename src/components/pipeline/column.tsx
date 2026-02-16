'use client';

import { useDroppable } from '@dnd-kit/core';
import { PipelineCard } from './card';
import { PipelineLead } from './board';

interface PipelineColumnProps {
    id: string;
    title: string;
    leads: PipelineLead[];
}

export function PipelineColumn({ id, title, leads }: PipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div className="flex h-full min-w-[280px] flex-col rounded-lg bg-muted/50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {leads.length}
                </span>
            </div>
            <div ref={setNodeRef} className="flex-1 space-y-3">
                {leads.map((lead) => (
                    <PipelineCard key={lead.id} id={lead.id} lead={lead} />
                ))}
            </div>
        </div>
    );
}
