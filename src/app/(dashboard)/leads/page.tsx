import { Suspense } from 'react';
import { fetchLeads, fetchFilterOptions, fetchCurrentUserRole } from './queries';
import { LeadsTable } from './leads-table';
import { LeadsToolbar } from './leads-toolbar';
import { LeadsPagination } from './leads-pagination';

const PAGE_SIZE = 20;

interface PageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        stage?: string;
        country?: string;
        owner?: string;
    }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
    const search = params.search ?? '';
    const stage = params.stage ?? '';
    const country = params.country ?? '';
    const owner = params.owner ?? '';

    // Parallel data fetching
    const [{ leads, totalCount }, filterOptions, role] = await Promise.all([
        fetchLeads({ page, pageSize: PAGE_SIZE, search, stage, country, owner }),
        fetchFilterOptions(),
        fetchCurrentUserRole(),
    ]);

    const isAdmin = role === 'admin';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
                <p className="text-muted-foreground">
                    Manage and track your sales leads.
                </p>
            </div>

            <Suspense fallback={null}>
                <LeadsToolbar
                    stages={filterOptions.stages}
                    countries={filterOptions.countries}
                    owners={filterOptions.owners}
                    isAdmin={isAdmin}
                    currentSearch={search}
                    currentStage={stage}
                    currentCountry={country}
                    currentOwner={owner}
                />
            </Suspense>

            <LeadsTable leads={leads} />

            <Suspense fallback={null}>
                <LeadsPagination
                    currentPage={page}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                />
            </Suspense>
        </div>
    );
}
