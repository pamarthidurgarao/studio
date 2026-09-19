import { useState } from 'react';
import type { DataMode, DataTableColumn, DataTableConfig, SelectionMode } from '../components/shared/DataTable';
import type { StudioTablePreset } from '../data/studioTableConfigs';
import { loadSavedConfig, saveConfig } from '../utils/configStorage';

export type TableConfigSize = NonNullable<DataTableConfig<Record<string, unknown>>['size']>;

/** Saved configs round-trip through JSON, which drops function-valued fields (a column's
 * custom `body`/`headerBody` renderer). Re-attach those from the original preset's matching
 * column by field so a save/reload cycle can't silently break a custom-rendered column. */
function restoreColumnFunctions(
  saved: DataTableConfig<Record<string, unknown>>,
  original: DataTableConfig<Record<string, unknown>>,
): DataTableConfig<Record<string, unknown>> {
  const byField = new Map(original.columns.map((c) => [c.field, c]));
  return {
    ...saved,
    columns: saved.columns.map((c) => {
      const orig = byField.get(c.field);
      return orig ? { ...c, body: orig.body, headerBody: orig.headerBody } : c;
    }),
  };
}

function resolveInitialConfig(
  preset: StudioTablePreset | undefined,
  pageId: string | undefined,
): DataTableConfig<Record<string, unknown>> | null {
  if (!preset) return null;
  const saved = loadSavedConfig<DataTableConfig<Record<string, unknown>>>(pageId);
  return saved ? restoreColumnFunctions(saved, preset.config) : preset.config;
}

/**
 * Owns a locally-editable copy of a DataTable preset's config, so Studio's PropertiesPanel
 * can mutate it (size, pagination, selection, per-column sortable/filterable, ...) and the
 * canvas re-renders the actual shared DataTable with the live result. Resets to the
 * preset's own config (or a previously-saved edit, see `save()`) whenever the preset itself
 * changes (i.e. a different page is opened) — done during render (not an effect) by tracking
 * the last-seen preset, per React's "you might not need an effect" guidance.
 */
export function useDataTableEditor(preset: StudioTablePreset | undefined, pageId?: string) {
  const [config, setConfig] = useState<DataTableConfig<Record<string, unknown>> | null>(() =>
    resolveInitialConfig(preset, pageId),
  );
  const [lastPreset, setLastPreset] = useState(preset);
  const [saved, setSaved] = useState(false);
  /** Cosmetic-only in Studio's builder — the shared DataTable takes `fetchData` as a function,
   * not a URL, so this display value isn't part of DataTableConfig and isn't wired to real fetching. */
  const [endpointUrl, setEndpointUrl] = useState('/api/data');

  if (preset !== lastPreset) {
    setLastPreset(preset);
    setConfig(resolveInitialConfig(preset, pageId));
    setEndpointUrl('/api/data');
    setSaved(false);
  }

  const save = () => {
    if (!config) return;
    saveConfig(pageId, config);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const update = (updater: (prev: DataTableConfig<Record<string, unknown>>) => DataTableConfig<Record<string, unknown>>) => {
    setConfig((prev) => (prev ? updater(prev) : prev));
  };

  const setSize = (size: TableConfigSize) => update((prev) => ({ ...prev, size }));

  const setStripedRows = (value: boolean) => update((prev) => ({ ...prev, stripedRows: value }));

  const setDense = (value: boolean) => update((prev) => ({ ...prev, dense: value }));

  const setDataMode = (mode: DataMode) => update((prev) => ({ ...prev, dataMode: mode }));

  const setRowClickable = (value: boolean) => update((prev) => ({ ...prev, rowClickable: value }));

  const setStickyActionsColumn = (value: boolean) => update((prev) => ({ ...prev, stickyActionsColumn: value }));

  const setPaginationEnabled = (value: boolean) =>
    update((prev) => ({ ...prev, pagination: { ...prev.pagination, enabled: value } }));

  const setRowsPerPage = (value: number) =>
    update((prev) => ({ ...prev, pagination: { ...prev.pagination, rowsPerPage: value } }));

  const setSelectionMode = (mode: SelectionMode) =>
    update((prev) => ({ ...prev, selection: { mode } }));

  const setGlobalSearchEnabled = (value: boolean) =>
    update((prev) => ({ ...prev, globalSearch: { ...prev.globalSearch, enabled: value } }));

  const toggleColumnSortable = (field: string) =>
    update((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.field === field ? { ...c, sortable: !c.sortable } : c)),
    }));

  const toggleColumnFilterable = (field: string) =>
    update((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.field === field ? { ...c, filterable: !c.filterable } : c)),
    }));

  const toggleColumnHidden = (field: string) =>
    update((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.field === field ? { ...c, hidden: !c.hidden } : c)),
    }));

  const toggleColumnFrozen = (field: string) =>
    update((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.field === field ? { ...c, frozen: !c.frozen } : c)),
    }));

  const toggleColumnClickable = (field: string) =>
    update((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.field === field ? { ...c, clickable: !c.clickable } : c)),
    }));

  /** Field identity is fixed at creation — renaming it would break every toggle/key above that looks columns up by field. Everything else stays editable. */
  const updateColumn = (
    field: string,
    patch: Partial<
      Pick<
        DataTableColumn,
        | 'header'
        | 'width'
        | 'minWidth'
        | 'align'
        | 'alignFrozen'
        | 'dataType'
        | 'options'
        | 'numberFormat'
        | 'dateFormat'
        | 'filterType'
        | 'filterPlaceholder'
        | 'prefixIcon'
        | 'suffixIcon'
      >
    >,
  ) =>
    update((prev) => ({
      ...prev,
      columns: prev.columns.map((c) => (c.field === field ? { ...c, ...patch } : c)),
    }));

  const addColumn = (column: { field: string; header: string }) =>
    update((prev) => {
      if (prev.columns.some((c) => c.field === column.field)) return prev;
      return {
        ...prev,
        columns: [...prev.columns, { field: column.field, header: column.header, sortable: true }],
      };
    });

  const removeColumn = (field: string) =>
    update((prev) => ({ ...prev, columns: prev.columns.filter((c) => c.field !== field) }));

  const moveColumn = (fromField: string, toField: string) =>
    update((prev) => {
      const fromIndex = prev.columns.findIndex((c) => c.field === fromField);
      const toIndex = prev.columns.findIndex((c) => c.field === toField);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const columns = [...prev.columns];
      const [moved] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, moved);
      return { ...prev, columns };
    });

  return {
    data: preset?.data,
    config,
    save,
    saved,
    endpointUrl,
    setEndpointUrl,
    setDataMode,
    setSize,
    setStripedRows,
    setDense,
    setRowClickable,
    setStickyActionsColumn,
    setPaginationEnabled,
    setRowsPerPage,
    setSelectionMode,
    setGlobalSearchEnabled,
    toggleColumnSortable,
    toggleColumnFilterable,
    toggleColumnHidden,
    toggleColumnFrozen,
    toggleColumnClickable,
    updateColumn,
    addColumn,
    removeColumn,
    moveColumn,
  };
}

export type DataTableEditor = ReturnType<typeof useDataTableEditor>;
