import { Tag } from 'primereact/tag';
import type { DataTableConfig } from '../components/shared/DataTable';

export interface StudioTablePreset {
  data: Record<string, unknown>[];
  config: DataTableConfig<Record<string, unknown>>;
}

const usersData: Record<string, unknown>[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@acme.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Grace Hopper', email: 'grace@acme.com', role: 'Editor', status: 'active' },
  { id: 3, name: 'Alan Turing', email: 'alan@acme.com', role: 'Viewer', status: 'inactive' },
  { id: 4, name: 'Katherine Johnson', email: 'katherine@acme.com', role: 'Editor', status: 'active' },
  { id: 5, name: 'Margaret Hamilton', email: 'margaret@acme.com', role: 'Admin', status: 'active' },
];

const usersConfig: DataTableConfig<Record<string, unknown>> = {
  dataKey: 'id',
  dataMode: 'client',
  title: 'Users',
  size: 'small',
  globalSearch: { enabled: true, placeholder: 'Search users...' },
  selection: { mode: 'checkbox' },
  pagination: { enabled: true, rowsPerPage: 5, rowsPerPageOptions: [5, 10, 25] },
  columns: [
    { field: 'name', header: 'Name', sortable: true, filterable: true },
    { field: 'email', header: 'Email', sortable: true, filterable: true, prefixIcon: 'pi pi-envelope' },
    {
      field: 'role',
      header: 'Role',
      sortable: true,
      filterable: true,
      dataType: 'select',
      options: [
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' },
      ],
      highlight: (row) => row.role === 'Admin',
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      body: (row) => (
        <Tag
          value={String(row.status)}
          severity={row.status === 'active' ? 'success' : 'secondary'}
        />
      ),
    },
  ],
  rowActions: [
    { actionKey: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { actionKey: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
  ],
  toolbarActions: [{ actionKey: 'add', label: 'Add User', icon: 'pi pi-plus' }],
};

const ordersData: Record<string, unknown>[] = [
  { id: 'INV-2041', customer: 'Beacon Labs', amount: 480.0, status: 'paid', date: '2026-09-01' },
  { id: 'INV-2040', customer: 'Northwind', amount: 129.5, status: 'pending', date: '2026-08-28' },
  { id: 'INV-2039', customer: 'Globex', amount: 899.0, status: 'paid', date: '2026-08-22' },
  { id: 'INV-2038', customer: 'Initech', amount: 45.0, status: 'overdue', date: '2026-08-15' },
];

const ORDER_STATUS_SEVERITY: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
};

const ordersConfig: DataTableConfig<Record<string, unknown>> = {
  dataKey: 'id',
  dataMode: 'client',
  title: 'Orders',
  size: 'small',
  globalSearch: { enabled: true, placeholder: 'Search orders...' },
  pagination: { enabled: true, rowsPerPage: 5, rowsPerPageOptions: [5, 10, 25] },
  columns: [
    { field: 'id', header: 'Invoice', sortable: true, width: '120px' },
    { field: 'customer', header: 'Customer', sortable: true, filterable: true },
    {
      field: 'amount',
      header: 'Amount',
      sortable: true,
      filterable: true,
      align: 'right',
      dataType: 'number',
      numberFormat: { style: 'currency', currency: 'USD' },
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      body: (row) => (
        <Tag
          value={String(row.status)}
          severity={ORDER_STATUS_SEVERITY[String(row.status)] ?? 'secondary'}
        />
      ),
    },
    { field: 'date', header: 'Date', sortable: true, filterable: true, dataType: 'date' },
  ],
  rowActions: [{ actionKey: 'view', label: 'View', icon: 'pi pi-eye' }],
};

export const STUDIO_TABLE_PRESETS: Record<string, StudioTablePreset> = {
  'users-table': { data: usersData, config: usersConfig },
  'orders-table': { data: ordersData, config: ordersConfig },
};
