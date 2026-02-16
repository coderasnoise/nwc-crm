
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchLeadDetails, fetchSurgeryTypes } from '../queries';
import { SurgerySelector } from '@/components/leads/surgery-selector';
import { OffersSection } from '@/components/leads/offers-section';
import { EventsSection } from '@/components/leads/events-section';
import { LeadInfoCard } from '@/components/leads/lead-info-card';
import { StageSelector } from '@/components/leads/stage-selector';
import { Separator } from '@/components/ui/separator';

import { LEAD_STAGES } from '@/lib/constants';

// Define the standard lifecycle stages
const ALL_STAGES = LEAD_STAGES;

// Define common countries (could be dynamic later)
const COUNTRIES = [
    'United Kingdom',
    'Ireland',
    'Germany',
    'France',
    'USA',
    'Canada',
    'Australia',
    'Other',
];

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
    const [lead, surgeryTypes] = await Promise.all([
        fetchLeadDetails(params.id),
        fetchSurgeryTypes(),
    ]);

    if (!lead) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {lead.first_name} {lead.last_name}
                    </h2>
                    <p className="text-muted-foreground">
                        {lead.email} • {lead.phone}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                        <span className="text-muted-foreground">Owner</span>
                        <p className="font-medium">{lead.owner_name}</p>
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant="outline" asChild>
                        <Link href={`/leads/${lead.id}/edit`}>Edit Lead</Link>
                    </Button>
                    <StageSelector
                        leadId={lead.id}
                        currentStage={lead.stage}
                        allStages={ALL_STAGES}
                    />
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Info & Surgeries */}
                <div className="space-y-6 lg:col-span-1">
                    <LeadInfoCard lead={lead} countries={COUNTRIES} />

                    <SurgerySelector
                        leadId={lead.id}
                        allTypes={surgeryTypes}
                        selectedTypeIds={lead.surgery_type_ids}
                    />

                    {/* Attachments Placeholder */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm opacity-60">
                        <h3 className="font-semibold mb-2">Attachments</h3>
                        <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-md bg-muted/50">
                            <p className="text-sm text-muted-foreground">Upload coming soon</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Offers, Events, Timeline */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="grid gap-6 md:grid-cols-2">
                        <OffersSection leadId={lead.id} offers={lead.offers} />
                        <EventsSection leadId={lead.id} events={lead.events} />
                    </div>

                    {/* Timeline Placeholder */}
                    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <h3 className="font-semibold mb-4">Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-2 bg-primary/20 rounded-full relative">
                                    <div className="absolute top-0 left-[-4px] w-4 h-4 bg-primary rounded-full" />
                                </div>
                                <div className="pb-4">
                                    <p className="font-medium text-sm">Lead Created</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(lead.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
