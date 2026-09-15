import type { BillingCard, BlockGroup, DesignToken, InvoiceRow, LayerNode } from '../types';

export const blockGroups: BlockGroup[] = [
  {
    name: 'Layout',
    count: 6,
    items: [
      { label: 'Row / Columns', icon: 'pi pi-table' },
      { label: 'CSS Grid', icon: 'pi pi-th-large' },
      { label: 'Flex Stack', icon: 'pi pi-bars' },
      { label: 'Free canvas', icon: 'pi pi-window-maximize' },
      { label: 'Spacer', icon: 'pi pi-arrows-v' },
      { label: 'Divider', icon: 'pi pi-minus' },
    ],
  },
  {
    name: 'PrimeReact',
    count: 42,
    items: [
      { label: 'DataTable', icon: 'pi pi-table' },
      { label: 'Card', icon: 'pi pi-id-card' },
      { label: 'Button', icon: 'pi pi-circle' },
      { label: 'InputText', icon: 'pi pi-pencil' },
      { label: 'Dropdown', icon: 'pi pi-chevron-circle-down' },
      { label: 'Chart', icon: 'pi pi-chart-line' },
      { label: 'TabView', icon: 'pi pi-folder' },
      { label: 'Toast', icon: 'pi pi-bell' },
    ],
  },
];

export const layers: LayerNode[] = [
  { key: 'page', label: 'Page', icon: 'pi pi-desktop', badge: '', depth: 0 },
  { key: 'nav', label: 'Nav.topbar', icon: 'pi pi-bars', badge: 'FLEX', depth: 1 },
  { key: 'section', label: 'Section.billing', icon: 'pi pi-stop', badge: 'GRID', depth: 1 },
  { key: 'head', label: 'Stack.header', icon: 'pi pi-bars', badge: 'FLEX', depth: 2 },
  { key: 'cards', label: 'Grid.cards', icon: 'pi pi-th-large', badge: 'GRID', depth: 2 },
  { key: 'card1', label: 'Card · Plan', icon: 'pi pi-id-card', badge: '', depth: 3 },
  { key: 'card2', label: 'Card · Usage', icon: 'pi pi-id-card', badge: '', depth: 3 },
  { key: 'card3', label: 'Card · Invoices', icon: 'pi pi-id-card', badge: '', depth: 3 },
  { key: 'table', label: 'DataTable.history', icon: 'pi pi-table', badge: '', depth: 2 },
];

export const tokens: DesignToken[] = [
  { name: 'surface/base', value: '#232532', color: 'var(--color-surface)' },
  { name: 'accent/500', value: '#968ae0', color: 'var(--color-accent-500)' },
  { name: 'space/4', value: '11.2px', color: 'var(--color-neutral-700)' },
  { name: 'radius/md', value: '8px', color: 'var(--color-neutral-700)' },
  { name: 'text/muted', value: '55%', color: 'var(--color-neutral-500)' },
  { name: 'grid/gutter', value: '16px', color: 'var(--color-accent-700)' },
];

export const billingCards: BillingCard[] = [
  { kicker: 'Current plan', title: 'Team · $480/mo', body: '22 seats · renews Oct 1', pct: 68 },
  { kicker: 'Usage', title: '1.8M requests', body: '72% of included quota', pct: 72 },
  { kicker: 'Next invoice', title: '$512.40', body: 'Issued Sep 28', pct: 35 },
];

export const invoiceRows: InvoiceRow[] = [
  { id: 'INV-2041 · Sep 2026', amount: '$480.00', state: 'Paid' },
  { id: 'INV-2018 · Aug 2026', amount: '$480.00', state: 'Paid' },
  { id: 'INV-1994 · Jul 2026', amount: '$455.00', state: 'Paid' },
];
