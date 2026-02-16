
import { createAuthClient } from '@/lib/supabase/auth';
import { PipelineBoard } from '@/components/pipeline/board';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
    const supabase = await createAuthClient();

    // Fetch leads with offers to show amounts
    const { data: leads, error } = await supabase
        .from('leads')
        .select(`
      id,
      first_name,
      last_name,
      stage,
      offers (amount, currency)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pipeline leads:', error);
        return <div>Error loading pipeline</div>;
    }

    // Transform leads to ensure flattened offers for the card if needed, 
    // but PipelineCard handles lead.offers array.

    return (
        <div className="h-[calc(100vh-100px)] p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Pipeline</h1>
            </div>

            <PipelineBoard initialLeads={leads || []} />
        </div>
    );
}
