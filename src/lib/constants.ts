export const LEAD_STAGES = [
    'New',
    'Contacted',
    'Qualified',
    'Offer Sent',
    'Reservation Done',
    'Won',
    'Lost',
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export const CURRENCIES = ['GBP', 'EUR', 'AUD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const EVENT_TYPES = ['surgery', 'transfer', 'control', 'payment', 'hotel'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const DEFAULT_ADMIN_USER_ID = process.env.DEFAULT_ADMIN_USER_ID;
