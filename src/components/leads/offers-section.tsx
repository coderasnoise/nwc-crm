'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addOffer } from '@/app/(dashboard)/leads/actions';
import { Plus } from 'lucide-react';

interface Offer {
    id: string;
    currency: string | null;
    amount: number | null;
    offer_text: string;
    created_at: string;
}

interface OffersSectionProps {
    leadId: string;
    offers: Offer[];
}

export function OffersSection({ leadId, offers }: OffersSectionProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [currency, setCurrency] = useState('EUR');
    const [amount, setAmount] = useState('');
    const [text, setText] = useState('');

    const handleAdd = () => {
        if (!text) {
            alert('Offer text is required');
            return;
        }

        startTransition(async () => {
            const result = await addOffer(leadId, {
                currency,
                amount: amount ? parseFloat(amount) : undefined,
                offer_text: text,
            });

            if (result?.error) {
                alert(result.error);
            } else {
                setOpen(false);
                setText('');
                setAmount('');
                setCurrency('EUR');
            }
        });
    };

    const formatCurrency = (curr: string | null, amt: number | null) => {
        if (!amt) return '—';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: curr || 'EUR',
        }).format(amt);
    };

    return (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Offers</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Offer
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Offer</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Currency</span>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="AUD">AUD ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium">Amount</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm font-medium">Details (Required)</span>
                                <Textarea
                                    placeholder="Describe the offer details..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAdd} disabled={isPending}>
                                    {isPending ? 'Saving...' : 'Create Offer'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {offers.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No offers created yet.
                    </p>
                ) : (
                    offers.map((offer) => (
                        <div
                            key={offer.id}
                            className="relative rounded-md border border-border bg-muted/40 p-3"
                        >
                            <div className="flex justify-between">
                                <span className="font-semibold">
                                    {formatCurrency(offer.currency, offer.amount)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(offer.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">
                                {offer.offer_text}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
