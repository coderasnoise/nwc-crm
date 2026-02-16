'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Users,
    KanbanSquare,
    Calendar,
    Mail,
    Settings,
    LayoutDashboard,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Leads', href: '/leads', icon: Users },
    { label: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Inbox', href: '/inbox', icon: Mail },
];

const bottomNavItems = [
    { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <TooltipProvider delayDuration={0}>
            <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r border-border bg-background">
                {/* Logo */}
                <div className="flex h-14 items-center justify-center border-b border-border">
                    <Link href="/" className="group flex items-center justify-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                            <LayoutDashboard className="h-4 w-4" />
                        </div>
                    </Link>
                </div>

                {/* Main Nav */}
                <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-3">
                    {navItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                                            isActive &&
                                            'bg-accent text-accent-foreground shadow-sm',
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={8}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>

                {/* Bottom Nav */}
                <div className="flex flex-col items-center gap-1 px-2 py-3">
                    <Separator className="mb-2" />
                    {bottomNavItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
                                            isActive &&
                                            'bg-accent text-accent-foreground shadow-sm',
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={8}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </aside>
        </TooltipProvider>
    );
}
