import { Suspense } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { fetchMonthEvents } from './actions';
import { CalendarView } from '@/components/calendar/calendar-view';
import { AddEventDialog } from '@/components/calendar/add-event-dialog';
import { Separator } from '@/components/ui/separator';

export const metadata = {
    title: 'Calendar | NWC CRM',
};

export default async function CalendarPage() {
    // Default to current month for initial load
    // The Client Component handles navigation, but initially we need data.
    // Ideally, we'd use searchParams for month navigation to keep it server-side rendered,
    // BUT `CalendarView` is a client component with state.
    // For MVP, we'll fetch *this month* on server, and let Client fetch next/prev via server actions or just fetch a broad range?
    // Actually, `CalendarView` manages date state locally. It needs to fetch data when month changes.
    // To keep it simple: We will pass an Initial Events list (current month), 
    // AND `CalendarView` will call `fetchMonthEvents` server action when navigating.
    // Wait, Server Actions can be called from Client Components.
    // So `CalendarView` can handle data fetching for next months.

    // Fetch current month
    const now = new Date();
    const start = startOfMonth(now).toISOString();
    const end = endOfMonth(now).toISOString();

    // We actually need a bit more range maybe? Prev/Next days?
    // `fetchMonthEvents` will filter by start/end.
    // Let's fetch current month initially.

    const initialEvents = await fetchMonthEvents(start, end);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                    <p className="text-muted-foreground">
                        Manage surgeries and events.
                    </p>
                </div>
                <AddEventDialog />
            </div>
            <Separator />
            <div className="h-full">
                <CalendarViewWithDataFetcher initialEvents={initialEvents} />
            </div>
        </div>
    );
}

// Wrapper to handle client-side fetching when navigation happens?
// For MVP, `CalendarView` is just static initial events? 
// The requirement said "Month view calendar UI... Load events from DB".
// If I use `CalendarView` (Client) state for `currentDate`, the events prop passed from Server won't update.
// I need `CalendarView` to fetch new data when `currentDate` changes.

import { CalendarViewWithDataFetcher } from '@/components/calendar/calendar-view-wrapper';
