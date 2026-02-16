'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addEvent } from '@/app/(dashboard)/leads/actions';
import { Plus, Calendar, Activity, Truck, CreditCard, Hotel, ClipboardList } from 'lucide-react';

interface Event {
    id: string;
    type: string;
    start_at: string;
    notes: string | null;
    created_at: string;
}

interface EventsSectionProps {
    leadId: string;
    events: Event[];
}

const EVENT_TYPES = [
    { value: 'surgery', label: 'Surgery', icon: Activity },
    { value: 'transfer', label: 'Transfer', icon: Truck },
    { value: 'control', label: 'Control', icon: ClipboardList },
    { value: 'payment', label: 'Payment', icon: CreditCard },
    { value: 'hotel', label: 'Hotel', icon: Hotel },
];

export function EventsSection({ leadId, events }: EventsSectionProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [type, setType] = useState('surgery');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleAdd = () => {
        if (!date) {
            alert('Date is required');
            return;
        }

        startTransition(async () => {
            const result = await addEvent(leadId, {
                type,
                start_at: new Date(date).toISOString(),
                notes,
            });

            if (result?.error) {
                alert(result.error);
            } else {
                setOpen(false);
                setDate('');
                setNotes('');
                setType('surgery');
            }
        });
    };

    const getIcon = (type: string) => {
        const found = EVENT_TYPES.find((t) => t.value === type);
        const Icon = found ? found.icon : Calendar;
        return <Icon className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Events & Logistics</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Type</span>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EVENT_TYPES.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    <div className="flex items-center gap-2">
                                                        <t.icon className="h-4 w-4" />
                                                        {t.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Date & Time</span>
                                    <Input
                                        type="datetime-local"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm font-medium">Notes</span>
                                <Textarea
                                    placeholder="Additional notes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAdd} disabled={isPending}>
                                    {isPending ? 'Saving...' : 'Add Event'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No events scheduled.
                    </p>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className="flex gap-4">
                            <div className="mt-1 rounded-full border bg-muted p-2">
                                {getIcon(event.type)}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium capitalize">{event.type}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(event.start_at).toLocaleString()}
                                    </span>
                                </div>
                                {event.notes && (
                                    <p className="text-sm text-muted-foreground">{event.notes}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
