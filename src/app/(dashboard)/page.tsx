export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your CRM activity.
        </p>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Leads', value: '2,341', change: '+12.5%' },
          { title: 'Active Deals', value: '145', change: '+3.2%' },
          { title: 'Revenue', value: '$48,250', change: '+8.1%' },
          { title: 'Conversion Rate', value: '24.5%', change: '+1.4%' },
        ].map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              <span className="text-xs font-medium text-emerald-600">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder content area */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your recent lead interactions will appear here.
          </p>
        </div>
        <div className="col-span-3 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Upcoming Tasks</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Scheduled follow-ups and meetings will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
