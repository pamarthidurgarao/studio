export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export type SidebarTab = 'blocks' | 'layers' | 'tokens';
export type LayoutMode = 'grid' | 'flex' | 'rows' | 'absolute';

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayerNode {
  key: string;
  label: string;
  icon: string;
  badge: string;
  depth: number;
}

export interface BlockItem {
  label: string;
  icon: string;
}

export interface BlockGroup {
  name: string;
  count: number;
  items: BlockItem[];
}

export interface DesignToken {
  name: string;
  value: string;
  color: string;
}

export interface BillingCard {
  kicker: string;
  title: string;
  body: string;
  pct: number;
}

export interface InvoiceRow {
  id: string;
  amount: string;
  state: string;
}
