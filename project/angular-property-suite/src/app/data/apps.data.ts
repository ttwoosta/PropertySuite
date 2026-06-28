import { AppItem } from '../models/app-item.model';

/**
 * The three tools surfaced on the launcher. `span` marks the wide card
 * (TenantBridge) that fills the full grid row on tablet+ and two columns
 * on the phone icon grid.
 */
export const APPS: readonly AppItem[] = [
  {
    key: 'rent',
    name: 'Rent Tracker',
    href: 'Rent Tracker.html',
    routePath: '/rent',
    icon: 'wallet',
    tile: { bg: 'var(--green-50)', fg: 'var(--green-600)' },
    tag: 'Income & expenses',
    desc: 'Track monthly rent, utilities, and receipts across every property — with a year grid and dashboards.',
  },
  {
    key: 'maint',
    name: 'Maintenance Scheduler',
    href: 'Maintenance Scheduler.html',
    icon: 'calendar-check-2',
    tile: { bg: 'var(--amber-50)', fg: 'var(--amber-700)' },
    tag: 'Stay ahead of every property',
    desc: 'Never miss a boiler service or safety check. Plan, prep, and batch your maintenance with smart scheduling.',
  },
  {
    key: 'tenant',
    name: 'TenantBridge',
    href: 'Tenant Bridge.html',
    icon: 'messages-square',
    tile: { bg: 'var(--blue-50)', fg: 'var(--blue-600)' },
    tag: 'Tenant communication',
    desc: 'A calm hub for tenant messages with AI-assisted drafting, suggestions, and a scheduled send queue.',
    span: true,
  },
] as const;
