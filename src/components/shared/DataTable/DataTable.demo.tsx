import { useState } from 'react';
import { DataTable } from './DataTable';
import type { DataTableActionEvent, DataTableConfig, DataTableFetchResult } from './types';
import './dataTable.css';

interface DemoUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const ROLES = ['Admin', 'Editor', 'Viewer'];
const STATUSES: DemoUser['status'][] = ['active', 'inactive'];

const ALL_USERS: DemoUser[] = Array.from({ length: 87 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ROLES[i % ROLES.length],
  status: STATUSES[i % STATUSES.length],
}));

function fakeServerFetch(params: {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
  globalFilter?: string;
}): Promise<DataTableFetchResult<DemoUser>> {
  let result = [...ALL_USERS];

  if (params.globalFilter) {
    const needle = params.globalFilter.toLowerCase();
    result = result.filter(
      (u) => u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle),
    );
  }

  if (params.sortField) {
    const field = params.sortField as keyof DemoUser;
    result.sort((a, b) => {
      const cmp = String(a[field]).localeCompare(String(b[field]));
      return params.sortOrder === -1 ? -cmp : cmp;
    });
  }

  const totalRecords = result.length;
  const page = result.slice(params.first, params.first + params.rows);

  return new Promise((resolve) => setTimeout(() => resolve({ data: page, totalRecords }), 300));
}

const config: DataTableConfig<DemoUser> = {
  dataKey: 'id',
  dataMode: 'server',
  fetchData: fakeServerFetch,
  title: 'Users (server mode)',
  pagination: { enabled: true, rowsPerPage: 10, rowsPerPageOptions: [10, 25, 50] },
  globalSearch: { enabled: true, placeholder: 'Search users...' },
  selection: { mode: 'checkbox' },
  size: 'small',
  rowClickable: true,
  stripedRows: true,
  rowColors: { odd: '#ffffff', even: '#f3f1fb' },
  stickyActionsColumn: true,
  columns: [
    { field: 'id', header: 'ID', sortable: true, width: '80px', frozen: true },
    { field: 'name', header: 'Name', sortable: true, filterable: true, frozen: true, minWidth: '160px' },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      filterable: true,
      clickable: true,
      prefixIcon: 'pi pi-envelope',
      minWidth: '240px',
    },
    {
      field: 'role',
      header: 'Role',
      sortable: true,
      filterable: true,
      filterType: 'dropdown',
      filterOptions: ROLES.map((r) => ({ label: r, value: r })),
      highlight: (row) => row.role === 'Admin',
      minWidth: '200px',
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      suffixIcon: (row) => (row.status === 'active' ? 'pi pi-check-circle' : 'pi pi-times-circle'),
      body: (row) => row.status,
      minWidth: '200px',
    },
  ],
  rowActions: [
    { actionKey: 'edit', label: 'Edit', icon: 'pi pi-pencil', variant: 'button' },
    { actionKey: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
  ],
  toolbarActions: [
    { actionKey: 'add', label: 'Add User', icon: 'pi pi-plus' },
    {
      actionKey: 'bulk-delete',
      label: 'Delete Selected',
      icon: 'pi pi-trash',
      severity: 'danger',
      requiresSelection: true,
    },
  ],
};

export function DataTableDemo() {
  const [selectedCount, setSelectedCount] = useState(0);

  const handleAction = (event: DataTableActionEvent<DemoUser>) => {
    switch (event.type) {
      case 'selection-change':
        setSelectedCount(event.selectedRows.length);
        break;
      case 'row-click':
        console.log('row click', event.row);
        break;
      case 'cell-click':
        console.log('cell click', event.field, event.row);
        break;
      case 'row-action':
        console.log('row action', event.actionKey, event.row);
        break;
      case 'toolbar-action':
        console.log('toolbar action', event.actionKey, event.selectedRows);
        break;
      default:
        console.log(event);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '760px' }}>
      <p>Selected: {selectedCount}</p>
      <DataTable<DemoUser> data={ALL_USERS} config={config} onAction={handleAction} />
    </div>
  );
}
