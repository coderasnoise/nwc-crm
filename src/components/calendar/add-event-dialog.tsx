'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Label } from '@/components/ui/label';
import { EVENT_TYPES, EventType } from '@/lib/constants';
import { createCalendarEvent, searchLeads } from '@/app/(dashboard)/calendar/actions';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce'; // Assuming this exists or I'll standardise without it for now
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function AddEventDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [leadId, setLeadId] = useState('');
    const [type, setType] = useState<EventType>('surgery');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [notes, setNotes] = useState('');

    // Combobox State
    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearch = useDebounce(searchValue, 300);
    const [selectedLeadName, setSelectedLeadName] = useState('');

    // Effect to trigger search when debounced value changes
    useEffect(() => {
        const search = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            const results = await searchLeads(debouncedSearch);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSearchResults(results as any[]);
        };
        search();
    }, [debouncedSearch]);

    const handleSearch = (val: string) => {
        setSearchValue(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const startAt = new Date(`${date}T${time}`).toISOString();

        const result = await createCalendarEvent({
            lead_id: leadId,
            type,
            start_at: startAt,
            notes,
        });

        setLoading(false);

        if (result.error) {
            alert(result.error);
            return;
        }

        setOpen(false);
        // Reset form
        setLeadId('');
        setNotes('');
        setDate('');
        setSelectedLeadName('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                        Schedule an event for a lead.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">

                    {/* Lead Combobox */}
                    <div className="space-y-2">
                        <Label>Lead</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedLeadName || "Select lead..."}
                                    <Search className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <div className="p-2 border-b">
                                    <div className="flex items-center px-2">
                                        <Search className="mr-2 h-4 w-4 opacity-50" />
                                        <input
                                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Search leads..."
                                            value={searchValue}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto p-1">
                                    {searchResults.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            {searchValue.length < 2 ? "Type to search..." : "No leads found."}
                                        </div>
                                    ) : (
                                        searchResults.map((lead) => (
                                            <div
                                                key={lead.id}
                                                className={cn(
                                                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                    leadId === lead.id && "bg-accent"
                                                )}
                                                onClick={() => {
                                                    setLeadId(lead.id);
                                                    setSelectedLeadName(`${lead.first_name} ${lead.last_name}`);
                                                    setComboboxOpen(false);
                                                }}
                                            >
                                                {lead.first_name} {lead.last_name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Event Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as EventType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENT_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="capitalize">
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading || !leadId || !date}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Event
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
