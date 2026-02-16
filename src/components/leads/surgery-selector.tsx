'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateSurgeryTypes } from '@/app/(dashboard)/leads/actions';

interface SurgeryType {
    id: string;
    name: string;
}

interface SurgerySelectorProps {
    leadId: string;
    allTypes: SurgeryType[];
    selectedTypeIds: string[];
}

export function SurgerySelector({
    leadId,
    allTypes,
    selectedTypeIds,
}: SurgerySelectorProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedTypeIds));
    const [isPending, startTransition] = useTransition();
    const [hasChanges, setHasChanges] = useState(false);

    const toggle = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelected(next);
        setHasChanges(true);
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateSurgeryTypes(leadId, Array.from(selected));
            if (result?.error) {
                alert(result.error);
            } else {
                setHasChanges(false);
            }
        });
    };

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Surgery Types</h3>
                {hasChanges && (
                    <Button size="sm" onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
                {allTypes.map((type) => {
                    const isSelected = selected.has(type.id);
                    return (
                        <div
                            key={type.id}
                            onClick={() => toggle(type.id)}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors ${isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted'
                                }`}
                        >
                            <div
                                className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-muted-foreground'
                                    }`}
                            >
                                {isSelected && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-3 w-3"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                            <span className={isSelected ? 'font-medium' : ''}>{type.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
