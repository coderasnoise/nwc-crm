import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Sidebar />
            <div className="pl-16">
                <Topbar />
                <main className="min-h-[calc(100vh-3.5rem)] p-6">{children}</main>
            </div>
        </>
    );
}
