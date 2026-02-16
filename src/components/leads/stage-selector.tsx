'use client';

import { useState, useTransition } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { changeStage } from '@/app/(dashboard)/leads/actions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StageSelectorProps {
    leadId: string;
    currentStage: string | null;
    allStages: readonly string[];
}

export function StageSelector({ leadId, currentStage, allStages }: StageSelectorProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleStageChange = (newStage: string) => {
        setError(null);
        startTransition(async () => {
            const result = await changeStage(leadId, newStage);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Current Stage:</span>
                <Select
                    value={currentStage || ''}
                    onValueChange={handleStageChange}
                    disabled={isPending}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                        {allStages.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                                {stage}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isPending && <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>}
            </div>

            {error && (
                <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cannot Change Stage</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
