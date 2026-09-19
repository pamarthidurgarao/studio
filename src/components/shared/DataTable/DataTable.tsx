import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { DataTable as PrimeDataTable, type DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { TriStateCheckbox } from 'primereact/tristatecheckbox';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';

import type {
  ControlSize,
  DataTableActionEvent,
  DataTableColumn,
  DataTableFetchParams,
  DataTableFieldOption,
  DataTableFilterValue,
  DataTableProps,
  DataTableRowAction,
  FilterType,
  SortOrder,
} from './types';

const DEFAULT_ROWS_PER_PAGE = 10;
const DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

type PrimeSize = 'small' | 'large' | undefined;

function toPrimeSize(size: ControlSize): PrimeSize {
  return size === 'medium' ? undefined : size;
}

/** PrimeReact's input-sizing classes use "sm"/"lg" shorthand rather than "small"/"large".
 * "medium" gets its own `-md` marker (not a real PrimeReact class) because the app-wide
 * default-size override coopts the theme's unsuffixed base rule to mean "small" — without
 * this marker, explicitly requesting "medium" would render identical to "small". */
function toInputSizeClass(size: ControlSize): string {
  if (size === 'small') return 'p-inputtext-sm';
  if (size === 'large') return 'p-inputtext-lg';
  return 'p-inputtext-md';
}

function getValue(row: unknown, field: string): unknown {
  return field.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, row);
}

function resolveIcon<T>(icon: string | ((row: T) => string | undefined) | undefined, row: T) {
  return typeof icon === 'function' ? icon(row) : icon;
}

/** Filter control defaults from `dataType` when `filterType` isn't set explicitly. */
function resolveFilterType<T>(column: DataTableColumn<T>): FilterType {
  if (column.filterType) return column.filterType;
  switch (column.dataType) {
    case 'number':
      return 'numeric';
    case 'date':
      return 'date';
    case 'boolean':
      return 'boolean';
    case 'select':
      return 'dropdown';
    default:
      return 'text';
  }
}

/** Dropdown filter options default to the column's own `options` for `dataType: 'select'`. */
function resolveFilterOptions<T>(column: DataTableColumn<T>): DataTableFieldOption[] {
  return column.filterOptions ?? (column.dataType === 'select' ? column.options ?? [] : []);
}

/** Renders the raw field value per `dataType` when no custom `body` is given. */
function formatColumnValue<T>(column: DataTableColumn<T>, value: unknown): string {
  if (value === undefined || value === null || value === '') return '';

  switch (column.dataType) {
    case 'number': {
      const num = typeof value === 'number' ? value : Number(value);
      return Number.isNaN(num) ? String(value) : new Intl.NumberFormat(undefined, column.numberFormat).format(num);
    }
    case 'date': {
      const date = value instanceof Date ? value : new Date(value as string | number);
      return Number.isNaN(date.getTime())
        ? String(value)
        : new Intl.DateTimeFormat(undefined, column.dateFormat).format(date);
    }
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'select': {
      const match = column.options?.find((opt) => opt.value === value);
      return match?.label ?? String(value);
    }
    default:
      return String(value);
  }
}

/** Client-mode field-filter matching, aware of the resolved filterType instead of always
 * doing a case-insensitive substring match — numeric/date/boolean/dropdown want equality,
 * not "does the stringified value happen to contain this substring". */
function matchesFieldFilter<T>(
  column: DataTableColumn<T> | undefined,
  rowValue: unknown,
  filterValue: DataTableFilterValue,
): boolean {
  const filterType = column ? resolveFilterType(column) : 'text';

  switch (filterType) {
    case 'numeric': {
      const rowNum = typeof rowValue === 'number' ? rowValue : Number(rowValue);
      const filterNum = typeof filterValue === 'number' ? filterValue : Number(filterValue);
      return !Number.isNaN(rowNum) && !Number.isNaN(filterNum) && rowNum === filterNum;
    }
    case 'date': {
      const rowDate = rowValue instanceof Date ? rowValue : new Date(rowValue as string | number);
      const filterDate = filterValue instanceof Date ? filterValue : new Date(filterValue as string | number);
      if (Number.isNaN(rowDate.getTime()) || Number.isNaN(filterDate.getTime())) return false;
      return rowDate.toDateString() === filterDate.toDateString();
    }
    case 'boolean':
      return Boolean(rowValue) === Boolean(filterValue);
    case 'dropdown':
      return rowValue === filterValue;
    default:
      return String(rowValue ?? '').toLowerCase().includes(String(filterValue).toLowerCase());
  }
}

interface DataCellProps<T> {
  column: DataTableColumn<T>;
  row: T;
  onCellClick: (field: string, row: T) => void;
}

function DataCell<T>({ column, row, onCellClick }: DataCellProps<T>) {
  const prefixIcon = resolveIcon(column.prefixIcon, row);
  const suffixIcon = resolveIcon(column.suffixIcon, row);
  const highlight = column.highlight?.(row);
  const highlightClass = highlight === true ? 'dt-cell-highlight' : highlight || undefined;

  const classNames = ['dt-cell', column.clickable && 'dt-cell-clickable', highlightClass]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classNames}
      onClick={
        column.clickable
          ? (e) => {
              e.stopPropagation();
              onCellClick(column.field, row);
            }
          : undefined
      }
    >
      {prefixIcon && <i className={`${prefixIcon} dt-cell-icon-prefix`} />}
      <span className="dt-cell-content">
        {column.body ? column.body(row) : formatColumnValue(column, getValue(row, column.field))}
      </span>
      {suffixIcon && <i className={`${suffixIcon} dt-cell-icon-suffix`} />}
    </span>
  );
}

interface RowActionsCellProps<T> {
  row: T;
  actions: DataTableRowAction<T>[];
  onActionKey: (actionKey: string, row: T) => void;
  size: PrimeSize;
  sizeClass: string;
}

function RowActionsCell<T>({ row, actions, onActionKey, size, sizeClass }: RowActionsCellProps<T>) {
  const menuRef = useRef<Menu>(null);
  const visibleActions = actions.filter((action) => !action.visible || action.visible(row));

  if (visibleActions.length === 0) return null;

  if (visibleActions.length <= 2) {
    return (
      <div className="dt-row-actions" onClick={(e) => e.stopPropagation()}>
        {visibleActions.map((action) => {
          const variant = action.variant ?? 'text';
          const showLabel = variant !== 'text' || visibleActions.length === 1;
          return (
            <Button
              key={action.actionKey}
              icon={action.icon}
              label={showLabel ? action.label : undefined}
              severity={action.severity}
              text={variant === 'text'}
              outlined={variant === 'outlined'}
              size={size}
              className={sizeClass}
              disabled={action.disabled ? action.disabled(row) : false}
              onClick={() => onActionKey(action.actionKey, row)}
              tooltip={showLabel ? undefined : action.label}
            />
          );
        })}
      </div>
    );
  }

  const menuItems: MenuItem[] = visibleActions.map((action) => ({
    label: action.label,
    icon: action.icon,
    disabled: action.disabled ? action.disabled(row) : false,
    command: () => onActionKey(action.actionKey, row),
  }));

  return (
    <div className="dt-row-actions" onClick={(e) => e.stopPropagation()}>
      <Menu model={menuItems} popup ref={menuRef} />
      <Button icon="pi pi-ellipsis-v" text size={size} className={sizeClass} onClick={(e) => menuRef.current?.toggle(e)} />
    </div>
  );
}

function FieldFilter<T>({
  column,
  value,
  onChange,
  size,
}: {
  column: DataTableColumn<T>;
  value: DataTableFilterValue | undefined;
  onChange: (field: string, value: DataTableFilterValue) => void;
  size: ControlSize;
}) {
  const sizeClass = toInputSizeClass(size);
  const filterType = resolveFilterType(column);

  if (filterType === 'dropdown') {
    return (
      <Dropdown
        value={value ?? null}
        options={resolveFilterOptions(column)}
        onChange={(e) => onChange(column.field, e.value)}
        placeholder={column.filterPlaceholder ?? 'Any'}
        showClear
        className={`dt-field-filter ${sizeClass}`.trim()}
        panelClassName={sizeClass || undefined}
      />
    );
  }

  if (filterType === 'numeric') {
    return (
      <InputNumber
        value={typeof value === 'number' ? value : null}
        onValueChange={(e) => onChange(column.field, e.value ?? null)}
        placeholder={column.filterPlaceholder ?? column.header}
        inputClassName={`dt-field-filter ${sizeClass}`.trim()}
      />
    );
  }

  if (filterType === 'date') {
    return (
      <Calendar
        value={value instanceof Date ? value : null}
        onChange={(e) => onChange(column.field, e.value ?? null)}
        placeholder={column.filterPlaceholder ?? 'Any'}
        dateFormat="yy-mm-dd"
        showIcon
        showButtonBar
        inputClassName={`dt-field-filter ${sizeClass}`.trim()}
        panelClassName={sizeClass || undefined}
      />
    );
  }

  if (filterType === 'boolean') {
    return (
      <TriStateCheckbox
        value={typeof value === 'boolean' ? value : null}
        onChange={(e) => onChange(column.field, e.value ?? null)}
        className={sizeClass || undefined}
      />
    );
  }

  return (
    <InputText
      value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
      onChange={(e) => onChange(column.field, e.target.value)}
      placeholder={column.filterPlaceholder ?? `Search ${column.header}`}
      className={`dt-field-filter ${sizeClass}`.trim()}
    />
  );
}

export function DataTable<T extends object>({ data, config, onAction }: DataTableProps<T>) {
  const {
    dataKey,
    columns,
    dataMode,
    fetchData,
    pagination,
    globalSearch,
    selection,
    rowActions,
    toolbarActions,
    stickyActionsColumn = false,
    size = 'medium',
    rowClickable = false,
    sortable = true,
    stripedRows = true,
    dense = false,
    rowColors,
    scrollable = false,
    scrollHeight,
    emptyMessage = 'No records found.',
    title,
    loading: loadingProp,
  } = config;

  const primeSize = toPrimeSize(size);
  const inputSizeClass = toInputSizeClass(size);

  const paginationEnabled = pagination?.enabled ?? true;
  const rowsPerPage = pagination?.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE;
  const rowsPerPageOptions = pagination?.rowsPerPageOptions ?? DEFAULT_ROWS_PER_PAGE_OPTIONS;
  const globalSearchEnabled = globalSearch?.enabled ?? true;
  const selectionMode = selection?.mode ?? 'none';

  const visibleColumns = useMemo(() => columns.filter((c) => !c.hidden), [columns]);
  const filterableColumns = useMemo(() => visibleColumns.filter((c) => c.filterable), [visibleColumns]);
  const hasFrozenColumns = visibleColumns.some((c) => c.frozen) || stickyActionsColumn;
  const isScrollable = scrollable || hasFrozenColumns;

  const [globalFilter, setGlobalFilter] = useState('');
  const [fieldFilters, setFieldFilters] = useState<Record<string, DataTableFilterValue>>({});
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(rowsPerPage);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>(0);

  const [serverData, setServerData] = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const emit = (event: DataTableActionEvent<T>) => onAction(event);

  const handleFieldFilterChange = (field: string, value: DataTableFilterValue) => {
    setFieldFilters((prev) => ({ ...prev, [field]: value === '' ? null : value }));
    setFirst(0);
    emit({ type: 'field-filter', field, value });
  };

  useEffect(() => {
    if (dataMode !== 'server' || !fetchData) return;
    let cancelled = false;
    setLoading(true);

    const params: DataTableFetchParams = {
      page: rows > 0 ? first / rows : 0,
      first,
      rows,
      sortField,
      sortOrder,
      globalFilter: globalFilter || undefined,
      filters: fieldFilters,
    };

    fetchData(params)
      .then((result) => {
        if (cancelled) return;
        setServerData(result.data);
        setTotalRecords(result.totalRecords);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dataMode, fetchData, first, rows, sortField, sortOrder, globalFilter, fieldFilters]);

  const clientFilteredData = useMemo(() => {
    if (dataMode !== 'client') return [];
    let result = data;

    if (globalFilter) {
      const needle = globalFilter.toLowerCase();
      const fields = globalSearch?.fields ?? visibleColumns.map((c) => c.field);
      result = result.filter((row) =>
        fields.some((field) => String(getValue(row, field) ?? '').toLowerCase().includes(needle)),
      );
    }

    for (const [field, value] of Object.entries(fieldFilters)) {
      if (value === null || value === undefined || value === '') continue;
      const column = visibleColumns.find((c) => c.field === field);
      result = result.filter((row) => matchesFieldFilter(column, getValue(row, field), value));
    }

    return result;
  }, [dataMode, data, globalFilter, fieldFilters, globalSearch?.fields, visibleColumns]);

  const rowsToRender = dataMode === 'server' ? serverData : clientFilteredData;
  const isLoading = loadingProp ?? loading;

  const onPage = (e: DataTableStateEvent) => {
    setFirst(e.first);
    setRows(e.rows);
    emit({ type: 'page', first: e.first, rows: e.rows });
  };

  const onSort = (e: DataTableStateEvent) => {
    const nextField = e.sortField || undefined;
    const nextOrder = (e.sortOrder ?? 0) as SortOrder;
    setSortField(nextField);
    setSortOrder(nextOrder);
    emit({ type: 'sort', sortField: nextField, sortOrder: nextOrder });
  };

  const onSelectionChange = (value: T[]) => {
    setSelectedRows(value);
    emit({ type: 'selection-change', selectedRows: value });
  };

  const onRowActionKey = (actionKey: string, row: T) => emit({ type: 'row-action', actionKey, row });
  const onToolbarActionKey = (actionKey: string) =>
    emit({ type: 'toolbar-action', actionKey, selectedRows });
  const onCellClick = (field: string, row: T) => emit({ type: 'cell-click', field, row });

  const hasToolbar = Boolean(title) || globalSearchEnabled || (toolbarActions && toolbarActions.length > 0);

  const selectionProps: Record<string, unknown> =
    selectionMode === 'none'
      ? {}
      : {
          selectionMode: selectionMode === 'checkbox' ? undefined : selectionMode,
          selection: selectedRows,
          onSelectionChange: (e: { value: T[] }) => onSelectionChange(e.value),
        };

  return (
    <div
      className={`dt-shared-wrapper${dense ? ' dt-dense' : ''}`}
      style={
        stripedRows && rowColors
          ? ({
              '--dt-row-odd-bg': rowColors.odd,
              '--dt-row-even-bg': rowColors.even,
            } as CSSProperties)
          : undefined
      }
    >
      {hasToolbar && (
        <Toolbar
          className="dt-toolbar"
          start={
            <div className="dt-toolbar-start">
              {title && <span className="dt-title">{title}</span>}
              {toolbarActions?.map((action) => {
                const visible = !action.requiresSelection || selectedRows.length > 0;
                if (!visible) return null;
                return (
                  <Button
                    key={action.actionKey}
                    label={action.label}
                    icon={action.icon}
                    severity={action.severity}
                    size={primeSize}
                    className={inputSizeClass}
                    disabled={action.disabled}
                    onClick={() => onToolbarActionKey(action.actionKey)}
                  />
                );
              })}
            </div>
          }
          end={
            globalSearchEnabled && (
              <span className="dt-global-search">
                <i className="pi pi-search" />
                <InputText
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setFirst(0);
                    emit({ type: 'global-filter', value: e.target.value });
                  }}
                  placeholder={globalSearch?.placeholder ?? 'Search...'}
                  className={inputSizeClass || undefined}
                />
              </span>
            )
          }
        />
      )}

      <PrimeDataTable
        value={rowsToRender}
        dataKey={dataKey}
        size={primeSize}
        /* PrimeReact memoizes body cells against a fixed prop whitelist (rowData, field,
           frozenCol, ...) that knows nothing about our column config (clickable, prefixIcon,
           suffixIcon, highlight) — those only exist inside the `body` render closure, so a
           config change that only affects them would silently fail to re-render. */
        cellMemo={false}
        loading={isLoading}
        stripedRows={stripedRows}
        scrollable={isScrollable}
        scrollHeight={scrollHeight}
        emptyMessage={emptyMessage}
        onRowClick={rowClickable ? (e) => emit({ type: 'row-click', row: e.data as T }) : undefined}
        rowHover={rowClickable}
        className={rowClickable ? 'dt-clickable-rows' : undefined}
        {...selectionProps}
        paginator={paginationEnabled}
        paginatorClassName={inputSizeClass || undefined}
        lazy={dataMode === 'server'}
        first={first}
        rows={rows}
        totalRecords={dataMode === 'server' ? totalRecords : undefined}
        rowsPerPageOptions={rowsPerPageOptions}
        onPage={paginationEnabled ? onPage : undefined}
        sortMode="single"
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={onSort}
        removableSort
        filterDisplay={filterableColumns.length > 0 ? 'row' : undefined}
      >
        {selectionMode === 'checkbox' && (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3rem' }}
            frozen={hasFrozenColumns}
            alignFrozen="left"
          />
        )}

        {visibleColumns.map((column) => (
          <Column
            key={column.field}
            field={column.field}
            header={column.headerBody ? column.headerBody() : column.header}
            sortable={sortable && column.sortable}
            frozen={column.frozen}
            alignFrozen={column.frozen ? column.alignFrozen ?? 'left' : undefined}
            style={{
              width: column.width,
              minWidth: column.minWidth,
              textAlign: column.align,
            }}
            body={(row: T) => <DataCell column={column} row={row} onCellClick={onCellClick} />}
            showFilterMenu={false}
            filter={column.filterable}
            filterElement={
              column.filterable
                ? () => (
                    <FieldFilter
                      column={column}
                      value={fieldFilters[column.field]}
                      onChange={handleFieldFilterChange}
                      size={size}
                    />
                  )
                : undefined
            }
          />
        ))}

        {rowActions && rowActions.length > 0 && (
          <Column
            header="Actions"
            frozen={stickyActionsColumn}
            alignFrozen={stickyActionsColumn ? 'right' : undefined}
            style={{ width: '1%', whiteSpace: 'nowrap', textAlign: 'center' }}
            body={(row: T) => (
              <RowActionsCell row={row} actions={rowActions} onActionKey={onRowActionKey} size={primeSize} sizeClass={inputSizeClass} />
            )}
          />
        )}
      </PrimeDataTable>
    </div>
  );
}
