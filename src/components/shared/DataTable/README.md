# DataTable

Shared, configuration-driven data table built on PrimeReact's `DataTable`. Every feature —
pagination, sorting, search, selection, row/toolbar actions, frozen columns, sizing — is
controlled entirely through a plain config object. There are no callbacks scattered through
`config`; every interaction flows through one `onAction` prop.

## Import

```tsx
// no path alias is configured in this project — import by relative path, e.g. from a
// sibling feature component under src/components/:
import { DataTable } from '../shared/DataTable';
import type { DataTableConfig, DataTableActionEvent } from '../shared/DataTable';
```

## API shape

```tsx
<DataTable<RowType>
  data={rows}          // T[] — used in "client" dataMode; ignored in "server" mode
  config={config}       // DataTableConfig<RowType> — pure declarative config, no callbacks
  onAction={handleAction} // (event: DataTableActionEvent<RowType>) => void — the ONLY callback
/>
```

Everything the table does — clicks, sorts, page changes, filter typing, selection — comes
through `onAction` as one discriminated union. Switch on `event.type`:

```tsx
function handleAction(event: DataTableActionEvent<User>) {
  switch (event.type) {
    case 'row-click':        // event.row
    case 'cell-click':       // event.field, event.row
    case 'row-action':       // event.actionKey, event.row
    case 'toolbar-action':   // event.actionKey, event.selectedRows
    case 'selection-change': // event.selectedRows
    case 'sort':             // event.sortField, event.sortOrder
    case 'page':              // event.first, event.rows
    case 'global-filter':    // event.value
    case 'field-filter':     // event.field, event.value
  }
}
```

## Minimal example

```tsx
const config: DataTableConfig<User> = {
  dataKey: 'id',
  dataMode: 'client',
  columns: [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
  ],
};

<DataTable<User> data={users} config={config} onAction={handleAction} />
```

## Client vs server data

- **`dataMode: 'client'`** — pass all rows via `data`. Global search, per-field filters,
  sort, and pagination all run in the browser against that array.
- **`dataMode: 'server'`** — `data` is ignored. Provide `config.fetchData`, called on every
  page/sort/filter change:

```tsx
fetchData: async ({ page, first, rows, sortField, sortOrder, globalFilter, filters }) => {
  const res = await api.getUsers({ page, rows, sortField, sortOrder, q: globalFilter, filters });
  return { data: res.items, totalRecords: res.total };
},
```

`DataTableFetchResult<T>` is `{ data: T[]; totalRecords: number }`. `dataKey` must name a
unique field on each row (e.g. `'id'`) for both modes.

## Columns

```tsx
{
  field: 'email',
  header: 'Email',
  sortable: true,
  filterable: true,               // adds a per-column filter-row input
  filterType: 'dropdown',         // 'text' (default) | 'numeric' | 'date' | 'dropdown' | 'boolean'
  filterOptions: [{ label: 'Admin', value: 'admin' }],
  width: '200px',
  minWidth: '160px',
  align: 'left',                  // 'left' | 'center' | 'right'
  hidden: false,
  body: (row) => <b>{row.email}</b>,   // custom cell renderer, defaults to raw field value
  headerBody: () => <CustomHeader />,  // custom header renderer

  // Sticky columns
  frozen: true,
  alignFrozen: 'left',            // 'left' (default) | 'right'

  // Clickable cell (independent of row click) — fires onAction({ type: 'cell-click', ... })
  clickable: true,
  prefixIcon: 'pi pi-envelope',                 // string, or (row) => string | undefined
  suffixIcon: (row) => row.verified ? 'pi pi-check' : undefined,

  // true = default highlight pill; a string = custom class name
  highlight: (row) => row.role === 'Admin',
}
```

`frozen`/`alignFrozen` stick a column to an edge while the table scrolls horizontally.
Setting any column `frozen: true` automatically turns on `config.scrollable` — no need to
set it yourself. Use `config.stickyActionsColumn: true` to also pin the actions column to
the right.

## Row actions & toolbar actions

Both are pure declarations — no `onClick` in config. Clicking dispatches through `onAction`.

```tsx
rowActions: [
  { actionKey: 'edit', label: 'Edit', icon: 'pi pi-pencil', variant: 'button' },
  { actionKey: 'delete', label: 'Delete', icon: 'pi pi-trash', severity: 'danger' },
  // visible/disabled are per-row predicates:
  { actionKey: 'archive', label: 'Archive', visible: (row) => !row.archived },
],
toolbarActions: [
  { actionKey: 'add', label: 'Add User', icon: 'pi pi-plus' },
  { actionKey: 'bulk-delete', label: 'Delete Selected', requiresSelection: true, severity: 'danger' },
],
```

- Row actions: `variant` is `'text'` (default, icon-only ghost button), `'outlined'`, or
  `'button'` (solid, with visible label). Up to 2 visible actions render inline; 3+ collapse
  into an overflow menu automatically.
- Toolbar actions: `requiresSelection: true` hides the button until at least one row is
  selected — pair with `selection.mode`.
- Handle both in `onAction`: `row-action` gives you `{ actionKey, row }`, `toolbar-action`
  gives you `{ actionKey, selectedRows }`.

## Selection

```tsx
selection: { mode: 'checkbox' },  // 'none' (default) | 'single' | 'multiple' | 'checkbox'
```

Selected rows are internal state; read them via the `selection-change` action event.

## Search & filtering

```tsx
globalSearch: {
  enabled: true,
  placeholder: 'Search users...',
  fields: ['name', 'email'],   // client mode only — restrict which fields match
},
```

Per-column filters come from `column.filterable`/`filterType`/`filterOptions` (see above)
and render as a filter row automatically when at least one column is filterable.

## Pagination

```tsx
pagination: {
  enabled: true,               // default true
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
},
```

## Sizing

```tsx
size: 'small', // 'small' | 'medium' (default) | 'large'
```

Controls **every** form control uniformly: global search box, filter inputs/dropdowns,
toolbar and row-action buttons, the pagination rows-per-page dropdown, and overall
row/cell density. You don't need to size individual pieces separately.

## Row styling

```tsx
stripedRows: true,                              // default true
rowColors: { odd: '#ffffff', even: '#f3f1fb' },  // custom stripe colors (only with stripedRows)
rowClickable: true,                              // enables hover + fires 'row-click'
```

## Full example

See [`DataTable.demo.tsx`](./DataTable.demo.tsx) for a complete, working example that
exercises every feature above: server-mode fetch, checkbox selection, frozen columns,
sticky actions column, per-column filters (text + dropdown), prefix/suffix icons, cell
highlighting, a clickable cell, small size, and a mix of `text`/`button` row-action variants.
The app also uses this component directly for its Pages landing screen's table view
([`PagesLanding.tsx`](../../PagesLanding.tsx)) — a real, non-demo usage worth reading
alongside the demo file.

## Files

| File | Purpose |
|---|---|
| `DataTable.tsx` | The component. |
| `types.ts` | All config/prop/event types — start here to see the full surface. |
| `dataTable.css` | Styling, including fixes for PrimeReact gaps (frozen-column transparency, dropdown/paginator sizing). |
| `DataTable.demo.tsx` | Live example wired to every feature. |
| `index.ts` | Public exports. |

## Extending

Adding a new feature should follow the existing shape:
1. Add the option to `DataTableConfig`/`DataTableColumn` in `types.ts` (pure data, no
   inline callbacks).
2. If it's user-triggered, add a variant to the `DataTableActionEvent` union rather than a
   new prop — keep `onAction` as the single behavior hook.
3. Wire it in `DataTable.tsx`, and add a CSS rule in `dataTable.css` scoped under
   `.dt-shared-wrapper` if PrimeReact's own theme doesn't already handle it (check the
   installed theme file under `node_modules/primereact/resources/themes/<theme>/theme.css`
   before assuming — several past additions here were needed because PrimeReact's size
   variants and frozen-column CSS have real gaps).
4. Add a small example to `DataTable.demo.tsx`.
