'use client';

import { Search, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function Topbar() {
    return (
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
            {/* Left — page title area */}
            <div className="flex items-center gap-3">
                <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground"
                >
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground"
                >
                    <Bell className="h-4 w-4" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* User Avatar */}
                <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                        NW
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
