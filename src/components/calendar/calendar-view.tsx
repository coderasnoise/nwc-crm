'use client';

import { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/app/(dashboard)/calendar/actions';
import { EVENT_TYPES, EventType } from '@/lib/constants';
import Link from 'next/link';

interface CalendarViewProps {
    events: CalendarEvent[];
}

const EVENT_COLORS: Record<EventType, string> = {
    surgery: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    transfer: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    control: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    payment: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    hotel: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
};

export function CalendarView({ events }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const today = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-background border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold capitalize">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center rounded-md border bg-muted/50 p-0.5 ml-4">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={today} className="ml-2">
                        Today
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b bg-muted/20">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {calendarDays.map((day) => {
                    const dayEvents = events.filter((e) => isSameDay(new Date(e.start_at), day));
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                'min-h-[100px] border-b border-r p-2 transition-colors hover:bg-muted/5',
                                !isCurrentMonth && 'bg-muted/5 text-muted-foreground'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className={cn(
                                        'text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full',
                                        isSameDay(day, new Date()) && 'bg-primary text-primary-foreground'
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>
                            <div className="mt-2 space-y-1">
                                {dayEvents.map((event) => (
                                    <Link
                                        key={event.id}
                                        href={`/leads/${event.lead_id}`}
                                        className={cn(
                                            'block text-xs p-1.5 rounded-md border truncate hover:opacity-80 transition-opacity',
                                            EVENT_COLORS[event.type]
                                        )}
                                        title={`${event.type} - ${event.lead?.first_name} ${event.lead?.last_name}`}
                                    >
                                        <span className="font-semibold capitalize">{event.type}</span>:{' '}
                                        {event.lead?.first_name} {event.lead?.last_name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
