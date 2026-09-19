import type { ReactNode } from 'react';

export type FilterType = 'text' | 'numeric' | 'date' | 'dropdown' | 'boolean';

/** The field's underlying value shape. Drives default formatting and (when filterable and
 * `filterType` isn't set explicitly) the default filter control, without needing a custom
 * `body` renderer for common cases. */
export type ColumnDataType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export type DataTableFieldOption = { label: string; value: string | number | boolean };

/** A per-column filter's current value — a Date for `filterType: 'date'`, otherwise a primitive. */
export type DataTableFilterValue = string | number | boolean | Date | null;

export type DataMode = 'client' | 'server';

export type SelectionMode = 'single' | 'multiple' | 'checkbox' | 'none';

export type SortOrder = 1 | -1 | 0;

export type ControlSize = 'small' | 'medium' | 'large';

export interface DataTableColumn<T = Record<string, unknown>> {
  /** Dot path into the row object, e.g. "user.name". Also used as the React key. */
  field: string;
  header: string;
  /** Column participates in sorting (client or server). */
  sortable?: boolean;
  /** Declares the field's value shape (text/number/date/boolean/select). Drives default
   * formatting (see `body`'s fallback) and, when `filterable` is true and `filterType` isn't
   * set explicitly, the default filter control too — e.g. "select" gets a dropdown filter
   * built from `options` automatically. */
  dataType?: ColumnDataType;
  /** Value→label options. Required for `dataType: 'select'` (used for both cell display and,
   * unless `filterOptions` is set explicitly, the dropdown filter). */
  options?: DataTableFieldOption[];
  /** `Intl.DateTimeFormat` locale to use when `dataType: 'date'`. Defaults to the browser locale. */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** `Intl.NumberFormat` options to use when `dataType: 'number'`. */
  numberFormat?: Intl.NumberFormatOptions;

  /** Column gets a per-field search input in the filter row. */
  filterable?: boolean;
  /** Defaults from `dataType` when not set explicitly (number→numeric, date→date, boolean→boolean, select→dropdown, else text). */
  filterType?: FilterType;
  /** Options for filterType "dropdown". Defaults to `options` when `dataType` is "select". */
  filterOptions?: DataTableFieldOption[];
  filterPlaceholder?: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  /** Sticks the column in place while the table scrolls horizontally. */
  frozen?: boolean;
  /** Which edge to stick to when frozen. Defaults to "left". */
  alignFrozen?: 'left' | 'right';
  hidden?: boolean;
  /** Custom cell renderer. Falls back to raw field value. */
  body?: (row: T) => ReactNode;
  /** Custom header renderer. Falls back to `header`. */
  headerBody?: () => ReactNode;

  /** Cell becomes clickable and fires onAction({ type: 'cell-click', field, row }) instead of (or in addition to) the row click. */
  clickable?: boolean;
  /** Icon (e.g. "pi pi-envelope") shown before the cell content. */
  prefixIcon?: string | ((row: T) => string | undefined);
  /** Icon (e.g. "pi pi-external-link") shown after the cell content. */
  suffixIcon?: string | ((row: T) => string | undefined);
  /** true applies the default highlight style; a string is used as a custom class name. */
  highlight?: (row: T) => boolean | string;
}

/** Declarative row-level action. Clicking it fires onAction({ type: 'row-action', actionKey, row }). */
export interface DataTableRowAction<T = Record<string, unknown>> {
  actionKey: string;
  label: string;
  icon?: string;
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'secondary' | undefined;
  /**
   * "text" (default) renders a compact icon-only ghost button.
   * "outlined" and "button" render a bordered/solid button with a visible label.
   */
  variant?: 'text' | 'outlined' | 'button';
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

/** Declarative toolbar action. Clicking it fires onAction({ type: 'toolbar-action', actionKey, selectedRows }). */
export interface DataTableToolbarAction {
  actionKey: string;
  label: string;
  icon?: string;
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'secondary' | undefined;
  disabled?: boolean;
  /** Show only when at least one row is selected. */
  requiresSelection?: boolean;
}

export interface DataTableFetchParams {
  page: number;
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: SortOrder;
  globalFilter?: string;
  filters?: Record<string, DataTableFilterValue>;
}

export interface DataTableFetchResult<T> {
  data: T[];
  totalRecords: number;
}

export interface DataTablePaginationConfig {
  enabled?: boolean;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

export interface DataTableGlobalSearchConfig {
  enabled?: boolean;
  placeholder?: string;
  /** Client mode only: restrict which fields the global filter matches against. */
  fields?: string[];
}

export interface DataTableSelectionConfig {
  mode: SelectionMode;
}

/** Pure declarative configuration — no callbacks. Behavior is wired through the `onAction` prop. */
export interface DataTableConfig<T = Record<string, unknown>> {
  /** Unique field used as row identity (e.g. "id"). */
  dataKey: string;
  columns: DataTableColumn<T>[];

  dataMode: DataMode;
  /** Required when dataMode === "server". Called whenever page/sort/filter changes. */
  fetchData?: (params: DataTableFetchParams) => Promise<DataTableFetchResult<T>>;

  pagination?: DataTablePaginationConfig;
  globalSearch?: DataTableGlobalSearchConfig;
  selection?: DataTableSelectionConfig;
  rowActions?: DataTableRowAction<T>[];
  toolbarActions?: DataTableToolbarAction[];
  /** Sticks the row-actions column to the right edge while scrolling horizontally. */
  stickyActionsColumn?: boolean;

  /** Size of every form control in the table: search box, filter inputs/dropdowns, toolbar and row-action buttons, and row/cell density. Defaults to "medium". */
  size?: ControlSize;
  rowClickable?: boolean;
  sortable?: boolean;
  stripedRows?: boolean;
  /** Tighter row/cell padding, independent of `size` (which also scales font/control height). */
  dense?: boolean;
  /** Custom odd/even row background colors, used only when stripedRows is true. */
  rowColors?: { odd?: string; even?: string };
  /** Auto-enabled when any column is frozen or stickyActionsColumn is set. */
  scrollable?: boolean;
  scrollHeight?: string;
  emptyMessage?: string;
  title?: string;
  loading?: boolean;
}

/** Every user interaction the table can produce, delivered through the single `onAction` callback. */
export type DataTableActionEvent<T = Record<string, unknown>> =
  | { type: 'row-click'; row: T }
  | { type: 'cell-click'; field: string; row: T }
  | { type: 'row-action'; actionKey: string; row: T }
  | { type: 'toolbar-action'; actionKey: string; selectedRows: T[] }
  | { type: 'selection-change'; selectedRows: T[] }
  | { type: 'sort'; sortField?: string; sortOrder: SortOrder }
  | { type: 'page'; first: number; rows: number }
  | { type: 'global-filter'; value: string }
  | { type: 'field-filter'; field: string; value: DataTableFilterValue };

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  config: DataTableConfig<T>;
  onAction: (event: DataTableActionEvent<T>) => void;
}
