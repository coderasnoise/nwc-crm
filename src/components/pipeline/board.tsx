'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import { PipelineColumn } from './column';
import { PipelineCard } from './card';
import { changeStage } from '@/app/(dashboard)/leads/actions';

import { LEAD_STAGES } from '@/lib/constants';

const STAGES = LEAD_STAGES;

export interface PipelineLead {
    id: string;
    first_name: string | null;
    last_name: string | null;
    stage: string | null;
    offers?: { amount: number; currency: string }[];
}

interface PipelineBoardProps {
    initialLeads: PipelineLead[];
}

export function PipelineBoard({ initialLeads }: PipelineBoardProps) {
    const [leads, setLeads] = useState<PipelineLead[]>(initialLeads);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const leadId = active.id as string;
        const newStage = over.id as string;

        const localLead = leads.find((l) => l.id === leadId);
        if (localLead && localLead.stage !== newStage) {
            // Optimistic update
            const oldStage = localLead.stage;
            setLeads((prev) =>
                prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
            );

            // Server update
            const result = await changeStage(leadId, newStage);
            if (result?.error) {
                // Revert on failure
                alert(`Failed to move: ${result.error}`);
                setLeads((prev) =>
                    prev.map((l) => (l.id === leadId ? { ...l, stage: oldStage } : l))
                );
            }
        }
    };

    const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {STAGES.map((stage) => (
                    <PipelineColumn
                        key={stage}
                        id={stage}
                        title={stage}
                        leads={leads.filter((l) => l.stage === stage)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeLead ? <PipelineCard id={activeLead.id} lead={activeLead} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
