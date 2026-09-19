---
name: shared-datatable
description: Use whenever this app needs a data table/grid — listing, browsing, or managing tabular records with any of pagination, sorting, search/filtering, row selection, row or toolbar actions, sticky/frozen columns, or size variants. Reuse the existing shared DataTable component instead of building a new table or using PrimeReact's DataTable directly.
---

# Shared DataTable component

This app already has a configuration-driven table component at
`src/components/shared/DataTable/`. Do not build a new table from scratch, and do not use
`primereact/datatable` directly in a feature — always go through this component.

Full docs: read `src/components/shared/DataTable/README.md` before wiring one up. It covers
every config option with examples. `src/components/shared/DataTable/types.ts` is the
authoritative type reference. `src/components/shared/DataTable/DataTable.demo.tsx` is a
complete working example (server-mode fetch, checkbox selection, frozen columns, sticky
actions, filters, icons, highlighting, sizing).

## Core shape (always three props, never more)

```tsx
// no path alias is configured in this project — import by relative path
import { DataTable } from '../shared/DataTable'; // adjust depth to your file's location
import type { DataTableConfig, DataTableActionEvent } from '../shared/DataTable';

<DataTable<RowType> data={rows} config={config} onAction={handleAction} />
```

- `data` — row array (client mode only; ignored in server mode).
- `config` — pure declarative object: columns, pagination, selection, actions, sizing,
  frozen columns. **Never** put an `onClick`/callback inside `config` — it doesn't exist on
  these types and won't compile.
- `onAction` — the single callback. Every interaction (row click, cell click, row/toolbar
  action, selection change, sort, page, search/filter typing) arrives here as one
  discriminated union. Switch on `event.type`.

## When building a new table for this app

1. Read `README.md` in that folder first — don't guess the config shape.
2. Pick `dataMode: 'client'` (small/local data) or `'server'` (paginated API — implement
   `config.fetchData`).
3. Define `columns` with `field`/`header`, and opt into `sortable`/`filterable` per column
   as needed.
4. Add `rowActions`/`toolbarActions` as declarations (`actionKey`, `label`, `icon`, ...) —
   handle the actual behavior in `onAction`'s `row-action`/`toolbar-action` cases.
5. Only reach for `frozen`/`alignFrozen`/`stickyActionsColumn` if the table has enough
   columns to need horizontal scroll.
6. Use `config.size` (`'small' | 'medium' | 'large'`) instead of styling individual inputs
   or buttons — it sizes every form control and the row density uniformly.

## If a feature seems missing

Check `types.ts` first — it may already exist (prefix/suffix icons, cell highlighting,
clickable cells, custom row colors, custom `body`/`headerBody` renderers are all supported).
If it's genuinely missing, extend the component rather than working around it in a feature
file — see the "Extending" section at the bottom of the README for the pattern to follow
(config-only additions, route new interactions through the `DataTableActionEvent` union, add
CSS under `.dt-shared-wrapper` in `dataTable.css`, add an example to the demo file).
