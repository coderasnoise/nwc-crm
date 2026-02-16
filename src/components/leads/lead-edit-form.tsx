'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { updateLeadInfo } from '@/app/(dashboard)/leads/actions';

interface LeadEditFormProps {
    lead: {
        id: string;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        email: string | null;
        country: string | null;
        language: string | null;
        source: string | null;
    };
    countries: string[];
}

export function LeadEditForm({ lead, countries }: LeadEditFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        first_name: lead.first_name || '',
        last_name: lead.last_name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        country: lead.country || '',
        language: lead.language || '',
        source: lead.source || '',
    });

    const [isPending, startTransition] = useTransition();

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateLeadInfo(lead.id, formData);
            if (result?.error) {
                alert(result.error);
            } else {
                router.push(`/leads/${lead.id}`);
                router.refresh();
            }
        });
    };

    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm max-w-2xl mx-auto">
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => handleChange('first_name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => handleChange('last_name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                            value={formData.country}
                            onValueChange={(val) => handleChange('country', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                                {!countries.includes(formData.country) && formData.country && (
                                    <SelectItem value={formData.country}>{formData.country}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Input
                            id="language"
                            value={formData.language}
                            onChange={(e) => handleChange('language', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Input
                            id="source"
                            value={formData.source}
                            onChange={(e) => handleChange('source', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => router.back()} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
