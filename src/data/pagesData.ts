export type StudioPageType = 'form' | 'table' | 'stepper';

export interface StudioPageItem {
  id: string;
  title: string;
  type: StudioPageType;
  description: string;
  updatedAt: string;
  owner: string;
}

export const PAGE_TYPE_META: Record<StudioPageType, { label: string; icon: string }> = {
  form: { label: 'Form', icon: 'pi pi-list' },
  table: { label: 'Table', icon: 'pi pi-table' },
  stepper: { label: 'Stepper', icon: 'pi pi-sitemap' },
};

export const STUDIO_PAGES: StudioPageItem[] = [
  {
    id: 'users-table',
    title: 'Users Table',
    type: 'table',
    description: 'Browse and manage user accounts with search, filters, and bulk actions.',
    updatedAt: '2026-09-10',
    owner: 'Durga',
  },
  {
    id: 'orders-table',
    title: 'Orders Table',
    type: 'table',
    description: 'Order history with status filters and per-row actions.',
    updatedAt: '2026-09-08',
    owner: 'Priya',
  },
  {
    id: 'employee-form',
    title: 'Employee Onboarding',
    type: 'form',
    description: 'Capture new-hire details across basic info, location, and role sections.',
    updatedAt: '2026-09-12',
    owner: 'Durga',
  },
  {
    id: 'support-ticket-form',
    title: 'Support Ticket',
    type: 'form',
    description: 'Simple intake form for customer support requests.',
    updatedAt: '2026-09-05',
    owner: 'Arjun',
  },
  {
    id: 'signup-wizard',
    title: 'Signup Wizard',
    type: 'stepper',
    description: 'Multi-step account creation: account, company, plan, review.',
    updatedAt: '2026-09-14',
    owner: 'Priya',
  },
  {
    id: 'checkout-wizard',
    title: 'Checkout Wizard',
    type: 'stepper',
    description: 'Shipping, payment, and confirmation steps for checkout.',
    updatedAt: '2026-09-01',
    owner: 'Arjun',
  },
];
