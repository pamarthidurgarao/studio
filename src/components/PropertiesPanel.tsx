import { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import type { LayoutMode, Padding } from '../types';
import type { StudioState } from '../hooks/useStudioState';
import type { DataTableEditor, TableConfigSize } from '../hooks/useDataTableEditor';
import type { DynamicFormEditor } from '../hooks/useDynamicFormEditor';
import type { StepperFormEditor } from '../hooks/useStepperFormEditor';
import { FormProperties } from './FormProperties';
import { StepperProperties } from './StepperProperties';
import { chip, drawer, fieldGrid, fieldLabel, gapRow, inputClass, inputSmClass, modeBtn, presetBtn, railBtn, sectionLabel, tokenName, tokenRow } from '../styles/cn';

const COLUMN_ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

const COLUMN_FROZEN_ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
];

const COLUMN_FILTER_TYPE_OPTIONS = [
  { label: 'Text', value: 'text' },
  { label: 'Numeric', value: 'numeric' },
  { label: 'Date', value: 'date' },
  { label: 'Dropdown', value: 'dropdown' },
  { label: 'Boolean', value: 'boolean' },
];

const COLUMN_DATA_TYPE_OPTIONS = [
  { label: 'Text', value: undefined as unknown as string },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Select', value: 'select' },
];

/** Parses "Active:active, Inactive:inactive" into [{label:'Active',value:'active'}, ...]. A label with no ":value" uses itself as the value too. */
function parseSelectOptions(text: string): { label: string; value: string }[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, value] = part.split(':').map((s) => s.trim());
      return { label, value: value || label };
    });
}

function formatSelectOptions(options: { label: string; value: string | number | boolean }[] | undefined): string {
  return (options ?? []).map((o) => (o.label === String(o.value) ? o.label : `${o.label}:${o.value}`)).join(', ');
}

const NUMBER_STYLE_OPTIONS = [
  { label: 'Decimal', value: 'decimal' },
  { label: 'Currency', value: 'currency' },
  { label: 'Percent', value: 'percent' },
];

const DATE_STYLE_OPTIONS = [
  { label: 'Short', value: 'short' },
  { label: 'Medium', value: 'medium' },
  { label: 'Long', value: 'long' },
  { label: 'Full', value: 'full' },
];

function slugifyFieldKey(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'column';
}

const MODES: { key: LayoutMode; label: string; icon: string }[] = [
  { key: 'grid', label: 'Grid', icon: 'pi pi-th-large' },
  { key: 'flex', label: 'Flex', icon: 'pi pi-bars' },
  { key: 'rows', label: 'Rows + cols', icon: 'pi pi-table' },
  { key: 'absolute', label: 'Absolute', icon: 'pi pi-window-maximize' },
];

const TRACK_PRESETS = ['1fr', 'auto', 'min'];

const TABLE_SIZE_OPTIONS: { label: string; value: TableConfigSize }[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: undefined as unknown as TableConfigSize },
  { label: 'Large', value: 'large' },
];

const SELECTION_MODE_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Single', value: 'single' },
  { label: 'Multiple', value: 'multiple' },
  { label: 'Checkbox', value: 'checkbox' },
];

const DATA_MODE_OPTIONS = [
  { label: 'Client', value: 'client' },
  { label: 'Server', value: 'server' },
];

interface TablePropertiesProps {
  tableEditor: DataTableEditor;
}

function TableProperties({ tableEditor }: TablePropertiesProps) {
  const { config } = tableEditor;
  const [editingField, setEditingField] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newHeader, setNewHeader] = useState('');
  const [dragField, setDragField] = useState<string | null>(null);

  if (!config) return null;

  const handleAddColumn = () => {
    const header = newHeader.trim();
    if (!header) return;
    tableEditor.addColumn({ field: slugifyFieldKey(header), header });
    setNewHeader('');
    setAdding(false);
  };

  return (
    <div className="flex-1 overflow-auto p-3 flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <div className={sectionLabel}>Table</div>
        <div className={fieldGrid}>
          <div>
            <label className={fieldLabel}>Size</label>
            <Dropdown
              className={`${inputClass} w-full`}
              value={config.size}
              options={TABLE_SIZE_OPTIONS}
              onChange={(e) => tableEditor.setSize(e.value)}
            />
          </div>
          <div>
            <label className={fieldLabel}>Selection</label>
            <Dropdown
              className={`${inputClass} w-full`}
              value={config.selection?.mode ?? 'none'}
              options={SELECTION_MODE_OPTIONS}
              onChange={(e) => tableEditor.setSelectionMode(e.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={sectionLabel}>Data</div>
        <div>
          <label className={fieldLabel}>Data mode</label>
          <Dropdown
            className={`${inputClass} w-full`}
            value={config.dataMode}
            options={DATA_MODE_OPTIONS}
            onChange={(e) => tableEditor.setDataMode(e.value)}
          />
        </div>
        <div>
          <label className={fieldLabel}>Endpoint</label>
          <InputText
            className={`${inputClass} w-full`}
            value={tableEditor.endpointUrl}
            onChange={(e) => tableEditor.setEndpointUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={sectionLabel}>Behavior</div>
        {(
          [
            ['Striped rows', config.stripedRows ?? false, tableEditor.setStripedRows],
            ['Dense rows', config.dense ?? false, tableEditor.setDense],
            ['Row clickable', config.rowClickable ?? false, tableEditor.setRowClickable],
            ['Global search', config.globalSearch?.enabled ?? false, tableEditor.setGlobalSearchEnabled],
            ['Pagination', config.pagination?.enabled ?? false, tableEditor.setPaginationEnabled],
            ['Sticky actions column', config.stickyActionsColumn ?? false, tableEditor.setStickyActionsColumn],
          ] as [string, boolean, (v: boolean) => void][]
        ).map(([label, value, setter]) => (
          <div key={label} className={gapRow}>
            <span className="text-[11.5px] text-[var(--color-neutral-400)]">{label}</span>
            <InputSwitch checked={value} onChange={(e) => setter(Boolean(e.value))} />
          </div>
        ))}

        {config.pagination?.enabled && (
          <div>
            <label className={fieldLabel}>Rows per page</label>
            <InputNumber
              className={`${inputClass} w-full`}
              value={config.pagination?.rowsPerPage ?? 10}
              min={1}
              max={100}
              onValueChange={(e) => tableEditor.setRowsPerPage(e.value ?? 10)}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className={sectionLabel}>Columns</div>
          <Button icon="pi pi-plus" text size="small" className="!w-[22px] !h-[22px]" onClick={() => setAdding((v) => !v)} />
        </div>

        {adding && (
          <div className="flex gap-1">
            <InputText
              className={`${inputClass} flex-1`}
              placeholder="Column header"
              value={newHeader}
              onChange={(e) => setNewHeader(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              autoFocus
            />
            <Button label="Add" size="small" onClick={handleAddColumn} disabled={!newHeader.trim()} />
          </div>
        )}

        <div className="flex flex-col gap-1">
          {config.columns.map((column) => {
            const isEditing = editingField === column.field;
            return (
              <div
                key={column.field}
                className="flex flex-col gap-1"
                style={{ opacity: dragField === column.field ? 0.5 : 1 }}
                draggable
                onDragStart={() => setDragField(column.field)}
                onDragEnd={() => setDragField(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragField && dragField !== column.field) tableEditor.moveColumn(dragField, column.field);
                  setDragField(null);
                }}
              >
                <div className={`${tokenRow} flex-wrap`}>
                  <i className="pi pi-bars text-[11px] text-[var(--color-neutral-600)] cursor-grab flex-none" />
                  <span className={`${tokenName} flex items-baseline gap-1.5`}>
                    {column.header}
                    <span className="font-mono text-[10px] text-[var(--color-neutral-600)]">{column.field}</span>
                  </span>
                  <button
                    type="button"
                    className={`${chip(Boolean(column.sortable))} !text-[10px] !px-1.5 !py-1`}
                    onClick={() => tableEditor.toggleColumnSortable(column.field)}
                  >
                    Sort
                  </button>
                  <button
                    type="button"
                    className={`${chip(Boolean(column.filterable))} !text-[10px] !px-1.5 !py-1`}
                    onClick={() => tableEditor.toggleColumnFilterable(column.field)}
                  >
                    Filter
                  </button>
                  <Button
                    icon={column.hidden ? 'pi pi-eye-slash' : 'pi pi-eye'}
                    text
                    size="small"
                    className="!w-5 !h-5"
                    style={{ color: column.hidden ? 'var(--color-neutral-600)' : 'var(--color-accent)' }}
                    tooltip={column.hidden ? 'Hidden — click to show' : 'Visible — click to hide'}
                    onClick={() => tableEditor.toggleColumnHidden(column.field)}
                  />
                  <Button
                    icon="pi pi-pencil"
                    text
                    size="small"
                    className="!w-5 !h-5"
                    onClick={() => setEditingField(isEditing ? null : column.field)}
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    size="small"
                    severity="danger"
                    className="!w-5 !h-5"
                    onClick={() => tableEditor.removeColumn(column.field)}
                  />
                </div>

                {isEditing && (
                  <div className="flex flex-col gap-2 py-1.5 pl-2 border-l-2 border-[var(--color-divider)] ml-0.5">
                    <div className="text-[10px] text-[var(--color-neutral-600)]">field: {column.field}</div>

                    <div className={fieldGrid}>
                      <div className="col-span-2">
                        <label className={fieldLabel}>Header</label>
                        <InputText
                          className={`${inputClass} w-full`}
                          value={column.header}
                          onChange={(e) => tableEditor.updateColumn(column.field, { header: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={fieldLabel}>Data type</label>
                        <Dropdown
                          className={`${inputClass} w-full`}
                          value={column.dataType}
                          options={COLUMN_DATA_TYPE_OPTIONS}
                          onChange={(e) => tableEditor.updateColumn(column.field, { dataType: e.value })}
                        />
                      </div>
                      {column.dataType === 'select' && (
                        <div className="col-span-2">
                          <label className={fieldLabel}>Options (label:value, comma-separated)</label>
                          <InputText
                            className={`${inputClass} w-full`}
                            placeholder="Active:active, Inactive:inactive"
                            defaultValue={formatSelectOptions(column.options)}
                            onBlur={(e) =>
                              tableEditor.updateColumn(column.field, { options: parseSelectOptions(e.target.value) })
                            }
                          />
                        </div>
                      )}
                      {column.dataType === 'number' && (
                        <>
                          <div>
                            <label className={fieldLabel}>Number style</label>
                            <Dropdown
                              className={`${inputClass} w-full`}
                              value={column.numberFormat?.style ?? 'decimal'}
                              options={NUMBER_STYLE_OPTIONS}
                              onChange={(e) =>
                                tableEditor.updateColumn(column.field, {
                                  numberFormat: { ...column.numberFormat, style: e.value },
                                })
                              }
                            />
                          </div>
                          {column.numberFormat?.style === 'currency' && (
                            <div>
                              <label className={fieldLabel}>Currency</label>
                              <InputText
                                className={`${inputClass} w-full`}
                                placeholder="USD"
                                value={column.numberFormat?.currency ?? ''}
                                onChange={(e) =>
                                  tableEditor.updateColumn(column.field, {
                                    numberFormat: {
                                      ...column.numberFormat,
                                      currency: e.target.value.toUpperCase() || undefined,
                                    },
                                  })
                                }
                              />
                            </div>
                          )}
                          <div className="col-span-2">
                            <label className={fieldLabel}>Decimal places</label>
                            <InputNumber
                              className={`${inputClass} w-full`}
                              value={column.numberFormat?.minimumFractionDigits ?? null}
                              min={0}
                              max={6}
                              placeholder="auto"
                              onValueChange={(e) =>
                                tableEditor.updateColumn(column.field, {
                                  numberFormat: {
                                    ...column.numberFormat,
                                    minimumFractionDigits: e.value ?? undefined,
                                    maximumFractionDigits: e.value ?? undefined,
                                  },
                                })
                              }
                            />
                          </div>
                        </>
                      )}
                      {column.dataType === 'date' && (
                        <div className="col-span-2">
                          <label className={fieldLabel}>Date style</label>
                          <Dropdown
                            className={`${inputClass} w-full`}
                            value={column.dateFormat?.dateStyle ?? 'short'}
                            options={DATE_STYLE_OPTIONS}
                            onChange={(e) =>
                              tableEditor.updateColumn(column.field, {
                                dateFormat: { ...column.dateFormat, dateStyle: e.value },
                              })
                            }
                          />
                        </div>
                      )}
                      <div>
                        <label className={fieldLabel}>Width</label>
                        <InputText
                          className={`${inputClass} w-full`}
                          placeholder="auto"
                          value={column.width ?? ''}
                          onChange={(e) =>
                            tableEditor.updateColumn(column.field, { width: e.target.value || undefined })
                          }
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Min width</label>
                        <InputText
                          className={`${inputClass} w-full`}
                          placeholder="auto"
                          value={column.minWidth ?? ''}
                          onChange={(e) =>
                            tableEditor.updateColumn(column.field, { minWidth: e.target.value || undefined })
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={fieldLabel}>Align</label>
                        <Dropdown
                          className={`${inputClass} w-full`}
                          value={column.align ?? 'left'}
                          options={COLUMN_ALIGN_OPTIONS}
                          onChange={(e) => tableEditor.updateColumn(column.field, { align: e.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-[5px]">
                      <div className={gapRow}>
                        <span className="text-[11px] text-[var(--color-neutral-400)]">Frozen</span>
                        <InputSwitch
                          checked={Boolean(column.frozen)}
                          onChange={() => tableEditor.toggleColumnFrozen(column.field)}
                        />
                      </div>
                      {column.frozen && (
                        <div>
                          <label className={fieldLabel}>Frozen side</label>
                          <Dropdown
                            className={`${inputClass} w-full`}
                            value={column.alignFrozen ?? 'left'}
                            options={COLUMN_FROZEN_ALIGN_OPTIONS}
                            onChange={(e) => tableEditor.updateColumn(column.field, { alignFrozen: e.value })}
                          />
                        </div>
                      )}

                      <div className={gapRow}>
                        <span className="text-[11px] text-[var(--color-neutral-400)]">Cell clickable</span>
                        <InputSwitch
                          checked={Boolean(column.clickable)}
                          onChange={() => tableEditor.toggleColumnClickable(column.field)}
                        />
                      </div>
                    </div>

                    {column.filterable && (
                      <div className={fieldGrid}>
                        <div>
                          <label className={fieldLabel}>Filter type</label>
                          <Dropdown
                            className={`${inputClass} w-full`}
                            value={column.filterType ?? 'text'}
                            options={COLUMN_FILTER_TYPE_OPTIONS}
                            onChange={(e) => tableEditor.updateColumn(column.field, { filterType: e.value })}
                          />
                        </div>
                        <div>
                          <label className={fieldLabel}>Filter placeholder</label>
                          <InputText
                            className={`${inputClass} w-full`}
                            value={column.filterPlaceholder ?? ''}
                            onChange={(e) =>
                              tableEditor.updateColumn(column.field, {
                                filterPlaceholder: e.target.value || undefined,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className={fieldGrid}>
                      <div>
                        <label className={fieldLabel}>Prefix icon</label>
                        <InputText
                          className={`${inputClass} w-full`}
                          placeholder="pi pi-envelope"
                          value={typeof column.prefixIcon === 'string' ? column.prefixIcon : ''}
                          onChange={(e) =>
                            tableEditor.updateColumn(column.field, { prefixIcon: e.target.value || undefined })
                          }
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Suffix icon</label>
                        <InputText
                          className={`${inputClass} w-full`}
                          placeholder="pi pi-check"
                          value={typeof column.suffixIcon === 'string' ? column.suffixIcon : ''}
                          onChange={(e) =>
                            tableEditor.updateColumn(column.field, { suffixIcon: e.target.value || undefined })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PropertiesPanelProps {
  studio: StudioState;
  tableEditor?: DataTableEditor;
  formEditor?: DynamicFormEditor;
  stepperEditor?: StepperFormEditor;
  activePageId?: string;
}

function PanelShell({
  open,
  collapsed,
  onToggleCollapsed,
  icon,
  title,
  tag,
  subtitle,
  json,
  onSave,
  saved,
  children,
}: {
  open: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  icon: string;
  title: string;
  tag: string;
  subtitle: React.ReactNode;
  json?: unknown;
  onSave?: () => void;
  saved?: boolean;
  children: React.ReactNode;
}) {
  const [showJson, setShowJson] = useState(false);

  if (collapsed) {
    return (
      <div
        className={`${drawer('right', open)} hidden lg:flex flex-col items-center gap-2 py-2.5 shadow-[inset_1px_0_0_var(--color-divider)]`}
      >
        <button type="button" className={railBtn(false)} title="Expand properties panel" onClick={onToggleCollapsed}>
          <i className="pi pi-angle-left" />
        </button>
        <i className={icon} style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  return (
    <div className={`${drawer('right', open)} flex flex-col min-h-0 shadow-[inset_1px_0_0_var(--color-divider)]`}>
      <div className="flex-none p-3 pt-2.5 pb-[9px] shadow-[inset_0_-1px_0_var(--color-divider)]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="hidden lg:grid place-items-center w-[22px] h-[22px] rounded text-[var(--color-neutral-500)] hover:text-[var(--color-text)] cursor-pointer flex-none"
            title="Collapse properties panel"
            onClick={onToggleCollapsed}
          >
            <i className="pi pi-angle-right" style={{ fontSize: 12 }} />
          </button>
          <i className={icon} style={{ color: 'var(--color-accent)' }} />
          <span className="font-medium text-[13px]">{title}</span>
          <Tag value={tag} severity="secondary" className="ml-auto !text-[10px]" />
          {json !== undefined && (
            <Button
              icon="pi pi-code"
              text
              size="small"
              className={`!w-[22px] !h-[22px] ${showJson ? '!text-[var(--color-accent)]' : ''}`}
              tooltip={showJson ? 'Show editor' : 'View JSON'}
              onClick={() => setShowJson((v) => !v)}
            />
          )}
        </div>
        <div className="mt-1.5 text-[10.5px] text-[var(--color-neutral-500)] flex items-center gap-1.5">{subtitle}</div>
      </div>
      {showJson ? (
        <pre className="flex-1 overflow-auto p-3 m-0 font-mono text-[11px] leading-[1.6] text-[var(--color-neutral-300)] whitespace-pre-wrap break-words">
          {JSON.stringify(json, null, 2)}
        </pre>
      ) : (
        children
      )}
      {onSave && (
        <div className="flex-none flex justify-end p-2 shadow-[inset_0_1px_0_var(--color-divider)]">
          <Button
            icon={saved ? 'pi pi-check' : 'pi pi-save'}
            label={saved ? 'Saved' : 'Save'}
            size="small"
            className="!text-[11px] !py-1 !px-2.5 !gap-1.5"
            severity={saved ? 'success' : undefined}
            onClick={onSave}
          />
        </div>
      )}
    </div>
  );
}

export function PropertiesPanel({ studio, tableEditor, formEditor, stepperEditor, activePageId }: PropertiesPanelProps) {
  const {
    mode,
    setMode,
    selName,
    selTag,
    bpName,
    tracks,
    setTrackValue,
    addTrack,
    removeTrack,
    gap,
    setGap,
    gapLabel,
    pad,
    setPadSide,
    cssOut,
    panelOpen,
    propertiesCollapsed,
    togglePropertiesCollapsed,
  } = studio;

  if (tableEditor?.config) {
    return (
      <PanelShell
        open={panelOpen}
        collapsed={propertiesCollapsed}
        onToggleCollapsed={togglePropertiesCollapsed}
        icon="pi pi-table"
        title="DataTable"
        tag="config"
        subtitle="Editing this page's table configuration"
        json={tableEditor.config}
        onSave={tableEditor.save}
        saved={tableEditor.saved}
      >
        <TableProperties key={activePageId} tableEditor={tableEditor} />
      </PanelShell>
    );
  }

  if (formEditor?.config) {
    return (
      <PanelShell
        open={panelOpen}
        collapsed={propertiesCollapsed}
        onToggleCollapsed={togglePropertiesCollapsed}
        icon="pi pi-list"
        title="DynamicForm"
        tag="config"
        subtitle="Editing this page's form configuration"
        json={formEditor.config}
        onSave={formEditor.save}
        saved={formEditor.saved}
      >
        <FormProperties key={activePageId} formEditor={formEditor} />
      </PanelShell>
    );
  }

  if (stepperEditor?.config) {
    const fieldCount = stepperEditor.config.steps.reduce(
      (n, s) => n + s.sections.reduce((m, sec) => m + sec.fields.length, 0),
      0,
    );
    return (
      <PanelShell
        open={panelOpen}
        collapsed={propertiesCollapsed}
        onToggleCollapsed={togglePropertiesCollapsed}
        icon="pi pi-sitemap"
        title="StepperForm"
        tag="config"
        subtitle={`${stepperEditor.config.steps.length} steps · ${fieldCount} fields`}
        json={stepperEditor.config}
        onSave={stepperEditor.save}
        saved={stepperEditor.saved}
      >
        <StepperProperties key={activePageId} stepperEditor={stepperEditor} />
      </PanelShell>
    );
  }

  return (
    <PanelShell
      open={panelOpen}
      collapsed={propertiesCollapsed}
      onToggleCollapsed={togglePropertiesCollapsed}
      icon="pi pi-th-large"
      title={selName}
      tag={selTag}
      subtitle={
        <>
          <i className="pi pi-mobile" />
          editing <span className="text-[var(--color-accent-300)]">{bpName}</span> · inherits base
        </>
      }
    >
      <div className="flex-1 overflow-auto p-3 flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <div className={sectionLabel}>Display</div>
          <div className="grid grid-cols-2 gap-1.5">
            {MODES.map((m) => (
              <button key={m.key} type="button" className={modeBtn(mode === m.key)} onClick={() => setMode(m.key)}>
                <i className={m.icon} style={{ fontSize: 14 }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'grid' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className={sectionLabel}>Columns</div>
              <div className="flex gap-1">
                <Button icon="pi pi-minus" text size="small" className="!w-[22px] !h-[22px]" onClick={removeTrack} />
                <Button icon="pi pi-plus" size="small" className="!w-[22px] !h-[22px]" onClick={addTrack} />
              </div>
            </div>

            <div className="grid gap-[3px] h-[30px]" style={{ gridTemplateColumns: tracks.join(' ') }}>
              {tracks.map((t, i) => (
                <div
                  className="grid place-items-center rounded overflow-hidden font-medium text-[10px] text-[var(--color-accent-200)] bg-[color-mix(in_srgb,var(--color-accent)_16%,transparent)] shadow-[inset_0_0_0_1px_var(--color-accent-700)]"
                  key={i}
                >
                  {t}
                </div>
              ))}
            </div>

            {tracks.map((t, i) => (
              <div key={i} className="grid grid-cols-[18px_1fr_auto] items-center gap-[7px] min-w-0 [&>*]:min-w-0">
                <span className="font-medium text-[10px] text-[var(--color-neutral-600)]">{i + 1}</span>
                <InputText className={inputClass} value={t} onChange={(e) => setTrackValue(i, e.target.value)} />
                <div className="flex gap-[3px]">
                  {TRACK_PRESETS.map((p) => {
                    const active = p === 'min' ? t === 'min-content' : t === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        className={presetBtn(active)}
                        onClick={() => setTrackValue(i, p === 'min' ? 'min-content' : p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className={`${fieldGrid} mt-0.5`}>
              <div>
                <label className={fieldLabel}>Rows</label>
                <InputText className={`${inputClass} w-full`} defaultValue="auto" />
              </div>
              <div>
                <label className={fieldLabel}>Auto-flow</label>
                <InputText className={`${inputClass} w-full`} defaultValue="row dense" />
              </div>
            </div>
          </div>
        )}

        {mode === 'flex' && (
          <div className="flex flex-col gap-2">
            <div className={sectionLabel}>Flex</div>
            <div className={fieldGrid}>
              <div>
                <label className={fieldLabel}>Direction</label>
                <InputText className={`${inputClass} w-full`} defaultValue="row" />
              </div>
              <div>
                <label className={fieldLabel}>Wrap</label>
                <InputText className={`${inputClass} w-full`} defaultValue="wrap" />
              </div>
              <div>
                <label className={fieldLabel}>Justify</label>
                <InputText className={`${inputClass} w-full`} defaultValue="space-between" />
              </div>
              <div>
                <label className={fieldLabel}>Align</label>
                <InputText className={`${inputClass} w-full`} defaultValue="stretch" />
              </div>
            </div>
          </div>
        )}

        {mode === 'rows' && (
          <div className="flex flex-col gap-2">
            <div className={sectionLabel}>Column span · 12-col</div>
            <div className="grid grid-cols-12 gap-0.5">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  className="h-[22px] rounded-[3px]"
                  key={i}
                  style={{
                    background: i < 4 ? 'color-mix(in srgb, var(--color-accent) 30%, transparent)' : 'var(--color-neutral-900)',
                    boxShadow: `inset 0 0 0 1px ${i < 4 ? 'var(--color-accent-600)' : 'var(--color-neutral-800)'}`,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--color-neutral-500)]">
              <span>span 4 · offset 0</span>
              <span>gutter {gapLabel}</span>
            </div>
          </div>
        )}

        {mode === 'absolute' && (
          <div className={fieldGrid}>
            <div>
              <label className={fieldLabel}>X</label>
              <InputText className={`${inputClass} w-full`} defaultValue="248px" />
            </div>
            <div>
              <label className={fieldLabel}>Y</label>
              <InputText className={`${inputClass} w-full`} defaultValue="96px" />
            </div>
            <div>
              <label className={fieldLabel}>W</label>
              <InputText className={`${inputClass} w-full`} defaultValue="360px" />
            </div>
            <div>
              <label className={fieldLabel}>H</label>
              <InputText className={`${inputClass} w-full`} defaultValue="auto" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className={gapRow}>
            <div className={sectionLabel}>Gap</div>
            <span className="text-[11px] text-[var(--color-accent-300)] tabular-nums">{gapLabel}</span>
          </div>
          <Slider value={gap} min={0} max={48} onChange={(e) => setGap(e.value as number)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className={sectionLabel}>Box model</div>
          <div className="p-[9px] rounded-sm border border-dashed border-[var(--color-neutral-700)]">
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  ['T', 'top'],
                  ['R', 'right'],
                  ['B', 'bottom'],
                  ['L', 'left'],
                ] as [string, keyof Padding][]
              ).map(([label, side]) => (
                <div className="grid grid-cols-[14px_1fr] items-center gap-1.5" key={side}>
                  <span className="font-medium text-[10px] text-[var(--color-neutral-600)]">{label}</span>
                  <InputText
                    className={inputSmClass}
                    value={String(pad[side])}
                    onChange={(e) => setPadSide(side, Number(e.target.value.replace(/[^0-9]/g, '')))}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 grid place-items-center h-[34px] rounded text-[10.5px] text-[var(--color-neutral-400)] bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]">
              content · auto × auto
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className={`flex items-center gap-1.5 ${sectionLabel}`}>
            <i className="pi pi-code" style={{ fontSize: 12 }} />
            Computed
          </div>
          <div className="p-2.5 rounded-sm bg-[var(--color-computed-bg)] shadow-[var(--shadow-sm)] font-mono text-[11.5px] leading-[1.7] text-[var(--color-neutral-300)]">
            {cssOut.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}
