
import { notFound } from 'next/navigation';
import { fetchLeadDetails } from '../../queries';
import { LeadEditForm } from '@/components/leads/lead-edit-form';

// Reuse constants
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

export default async function EditLeadPage({ params }: { params: { id: string } }) {
    const lead = await fetchLeadDetails(params.id);

    if (!lead) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Edit Lead</h2>
                    <p className="text-muted-foreground">
                        Update information for {lead.first_name} {lead.last_name}
                    </p>
                </div>
            </div>

            <LeadEditForm lead={lead} countries={COUNTRIES} />
        </div>
    );
}
