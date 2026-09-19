import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { DataTable as MockDataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import type { StudioState } from '../hooks/useStudioState';
import { billingCards, invoiceRows } from '../data/studioData';
import { DataTable } from './shared/DataTable';
import type { DataTableActionEvent } from './shared/DataTable';
import './shared/DataTable/dataTable.css';
import { DynamicForm } from './shared/DynamicForm';
import type { DynamicFormActionEvent } from './shared/DynamicForm';
import './shared/DynamicForm/dynamicForm.css';
import { StepperForm } from './shared/StepperForm';
import type { StepperFormActionEvent } from './shared/StepperForm';
import './shared/StepperForm/stepperForm.css';
import type { StudioPageItem } from '../data/pagesData';
import type { DataTableEditor } from '../hooks/useDataTableEditor';
import type { DynamicFormEditor } from '../hooks/useDynamicFormEditor';
import type { StepperFormEditor } from '../hooks/useStepperFormEditor';
import { chip } from '../styles/cn';

interface CanvasAreaProps {
  studio: StudioState;
  activePage?: StudioPageItem | null;
  tableEditor?: DataTableEditor;
  formEditor?: DynamicFormEditor;
  stepperEditor?: StepperFormEditor;
}

function BoundComponentFrame({
  icon,
  label,
  boundTo,
  title,
  description,
  children,
}: {
  icon: string;
  label: string;
  boundTo: string;
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex items-end gap-3">
        <div>
          <div className="font-medium text-[19px] leading-[1.2] text-[var(--color-neutral-100)]">{title}</div>
          <div className="text-xs text-[var(--color-neutral-500)] mt-[3px]">{description}</div>
        </div>
      </div>

      <div className="relative p-[9px] rounded-md outline outline-1 outline-[var(--color-accent)] outline-offset-0">
        <div className="absolute -top-[19px] -left-px flex items-center gap-1.5 px-[7px] py-0.5 rounded-t-[5px] bg-[var(--color-accent)] text-[var(--color-selected-tag-text)] font-medium text-[10px] leading-normal whitespace-nowrap">
          <i className={icon} />
          {label}
          <span className="opacity-70">· bound to {boundTo}</span>
        </div>

        {children}
      </div>
    </>
  );
}

/** Makes the live-rendered DynamicForm clickable in the canvas: clicking a field or its section
 * selects it in the properties panel (Field/Section tab), mirroring the properties panel's own
 * click-to-drill navigation. Relies on the `data-df-section`/`data-df-field` attributes formEngine
 * stamps onto each section/field wrapper — inert for every other DynamicForm consumer. */
function DynamicFormCanvas({ formEditor, children }: { formEditor: DynamicFormEditor; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedClasses = ['outline', 'outline-1', 'outline-[var(--color-accent)]', 'bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)]'];

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('[data-df-section], [data-df-field]').forEach((el) => el.classList.remove(...selectedClasses));
    const selector = formEditor.activeFieldName
      ? `[data-df-field="${CSS.escape(formEditor.activeFieldName)}"]`
      : formEditor.activeSectionKey
        ? `[data-df-section="${CSS.escape(formEditor.activeSectionKey)}"]`
        : null;
    if (selector) root.querySelector(selector)?.classList.add(...selectedClasses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formEditor.activeSectionKey, formEditor.activeFieldName, formEditor.config]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-df-actions]')) {
      e.stopPropagation();
      formEditor.setTab('form');
      return;
    }
    const fieldEl = target.closest<HTMLElement>('[data-df-field]');
    if (fieldEl) {
      const sectionEl = fieldEl.closest<HTMLElement>('[data-df-section]');
      const sectionKey = sectionEl?.dataset.dfSection;
      const fieldName = fieldEl.dataset.dfField;
      if (sectionKey && fieldName) {
        e.stopPropagation();
        formEditor.selectField(sectionKey, fieldName);
      }
      return;
    }
    const sectionEl = target.closest<HTMLElement>('[data-df-section]');
    if (sectionEl?.dataset.dfSection) {
      e.stopPropagation();
      formEditor.selectSection(sectionEl.dataset.dfSection);
    }
  };

  return (
    <div
      ref={ref}
      className="[&_[data-df-section]]:cursor-pointer [&_[data-df-field]]:cursor-pointer [&_[data-df-field]]:rounded-sm [&_[data-df-field]]:outline [&_[data-df-field]]:outline-1 [&_[data-df-field]]:outline-transparent [&_[data-df-field]]:outline-offset-2 [&_[data-df-field]]:transition-[outline-color] [&_[data-df-field]:hover]:outline-[color-mix(in_srgb,var(--color-accent)_50%,transparent)] [&_[data-df-actions]]:cursor-pointer [&_[data-df-actions]]:rounded-md [&_[data-df-actions]]:outline [&_[data-df-actions]]:outline-1 [&_[data-df-actions]]:outline-transparent [&_[data-df-actions]]:outline-offset-4 [&_[data-df-actions]]:transition-[outline-color] [&_[data-df-actions]:hover]:outline-[color-mix(in_srgb,var(--color-accent)_50%,transparent)]"
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

export function CanvasArea({ studio, activePage, tableEditor, formEditor, stepperEditor }: CanvasAreaProps) {
  const { crumb, viewportLabel, drag, setDrag, frameWidth, canvasGridStyle, trackSummary, dropLabel, mode, canvasRef } = studio;

  const handleTableAction = (event: DataTableActionEvent<Record<string, unknown>>) => {
    // eslint-disable-next-line no-console
    console.log('studio table action', event);
  };

  const handleFormAction = (event: DynamicFormActionEvent) => {
    // eslint-disable-next-line no-console
    console.log('studio form action', event);
  };

  const handleStepperAction = (event: StepperFormActionEvent) => {
    // eslint-disable-next-line no-console
    console.log('studio stepper action', event);
  };

  const cardSpanStyle = (): CSSProperties => {
    if (mode === 'rows') return { gridColumn: 'span 4' };
    if (mode === 'flex') return { flex: '1 1 180px' };
    return {};
  };

  return (
    <div className="flex flex-col min-w-0 min-h-0 bg-[linear-gradient(180deg,var(--color-canvas-grad-1),var(--color-canvas-grad-2))]">
      <div className="flex items-center gap-2.5 px-3.5 py-[7px] flex-none min-w-0 text-[var(--color-neutral-500)] text-[11px] shadow-[inset_0_-1px_0_var(--color-divider)]">
        <span className="text-[var(--color-accent)]">
          <i className="pi pi-directions" />
        </span>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{crumb}</span>
        <span className="hidden sm:inline ml-auto tabular-nums">{viewportLabel}</span>
        <button
          type="button"
          className={`${chip(drag)} flex-none !text-[10.5px] !px-2 !py-1.5`}
          onClick={() => setDrag(!drag)}
        >
          <i className="pi pi-arrows-alt" style={{ fontSize: 12 }} />
          <span className="hidden sm:inline">simulate drag</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto flex justify-center items-start px-5 pt-[26px] pb-10">
        <div
          className="bg-[var(--color-frame-bg)] rounded-md shadow-[var(--shadow-md)] overflow-hidden transition-[width] duration-[220ms] ease-in-out max-w-[1080px]"
          style={{ width: frameWidth }}
        >
          <div className="flex items-center gap-4 px-[18px] py-3 bg-[var(--color-frame-topbar-bg)] text-[var(--color-neutral-400)] text-xs">
            <span className="w-3.5 h-3.5 rounded-[4px] bg-[var(--color-accent-700)]" />
            <span className="font-medium text-[12.5px] text-[var(--color-neutral-200)]">Acme Console</span>
            <span>Overview</span>
            <span className="text-[var(--color-accent-300)]">Billing</span>
            <span>Team</span>
            <span className="ml-auto w-[22px] h-[22px] rounded-full bg-[var(--color-neutral-800)]" />
          </div>

          <div ref={canvasRef} className="p-[22px] pb-[30px] flex flex-col gap-[18px]">
            {tableEditor?.config ? (
              <BoundComponentFrame
                icon="pi pi-table"
                label="DataTable"
                boundTo={activePage!.id}
                title={activePage?.title}
                description={activePage?.description}
              >
                <DataTable
                  data={tableEditor.data ?? []}
                  config={tableEditor.config}
                  onAction={handleTableAction}
                />
              </BoundComponentFrame>
            ) : formEditor?.config ? (
              <BoundComponentFrame
                icon="pi pi-list"
                label="DynamicForm"
                boundTo={activePage!.id}
                title={activePage?.title}
                description={activePage?.description}
              >
                <DynamicFormCanvas formEditor={formEditor}>
                  <DynamicForm
                    data={formEditor.data ?? {}}
                    config={formEditor.config}
                    onAction={handleFormAction}
                  />
                </DynamicFormCanvas>
              </BoundComponentFrame>
            ) : stepperEditor?.config ? (
              <BoundComponentFrame
                icon="pi pi-sitemap"
                label="StepperForm"
                boundTo={activePage!.id}
                title={activePage?.title}
                description={activePage?.description}
              >
                <div className="flex items-center gap-1.5 flex-wrap px-1 pb-3.5">
                  {stepperEditor.config.steps.map((step, index) => (
                    <div className="flex items-center gap-1.5" key={step.key}>
                      <button
                        type="button"
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border cursor-pointer font-inherit ${
                          index === stepperEditor.activeStep
                            ? 'border-[var(--color-accent)] text-[var(--color-accent-200)] bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)]'
                            : 'border-[var(--color-divider)] bg-[var(--color-surface)] text-[var(--color-neutral-400)]'
                        }`}
                        onClick={() => stepperEditor.setActiveStep(index)}
                      >
                        <span
                          className={`w-4 h-4 rounded-full grid place-items-center text-[9.5px] flex-none ${
                            index === stepperEditor.activeStep
                              ? 'bg-[var(--color-accent)] text-[var(--color-selected-tag-text)]'
                              : 'bg-[var(--color-neutral-800)] text-[var(--color-neutral-400)]'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium text-[11.5px]">{step.label}</span>
                        <span className="text-[10px] text-[var(--color-neutral-600)]">
                          {step.sections.reduce((n, s) => n + s.fields.length, 0)} fields
                        </span>
                      </button>
                      {index < stepperEditor.config!.steps.length - 1 && (
                        <i className="pi pi-angle-right text-[11px] text-[var(--color-neutral-600)]" />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-dashed border-[var(--color-neutral-700)] bg-transparent text-[var(--color-neutral-500)] cursor-pointer font-medium text-[11px] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    onClick={stepperEditor.addStep}
                  >
                    <i className="pi pi-plus" style={{ fontSize: 10 }} />
                    Add step
                  </button>
                </div>
                <StepperForm
                  data={stepperEditor.data ?? {}}
                  config={stepperEditor.config}
                  onAction={handleStepperAction}
                />
              </BoundComponentFrame>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <div>
                    <div className="font-medium text-[19px] leading-[1.2] text-[var(--color-neutral-100)]">Billing</div>
                    <div className="text-xs text-[var(--color-neutral-500)] mt-[3px]">
                      Plan, usage and invoice history
                    </div>
                  </div>
                  <span className="ml-auto px-[11px] py-1.5 rounded-md border border-[var(--color-accent)] text-[var(--color-accent)] text-xs">
                    Upgrade
                  </span>
                </div>

                <div className="relative p-[9px] rounded-md outline outline-1 outline-[var(--color-accent)] outline-offset-0">
                  <div className="absolute -top-[19px] -left-px flex items-center gap-1.5 px-[7px] py-0.5 rounded-t-[5px] bg-[var(--color-accent)] text-[var(--color-selected-tag-text)] font-medium text-[10px] leading-normal whitespace-nowrap">
                    <i className="pi pi-th-large" />
                    Grid.cards
                    <span className="opacity-70">{trackSummary}</span>
                  </div>

                  <div style={canvasGridStyle}>
                    {billingCards.map((card) => (
                      <div
                        className="flex flex-col gap-1.5 p-[13px] rounded-sm bg-[var(--color-surface)] shadow-[var(--shadow-sm)] min-w-0"
                        style={cardSpanStyle()}
                        key={card.title}
                      >
                        <div className="text-[10px] tracking-[0.09em] uppercase text-[var(--color-accent-300)]">
                          {card.kicker}
                        </div>
                        <div className="font-medium text-base leading-[1.2] text-[var(--color-neutral-100)]">
                          {card.title}
                        </div>
                        <div className="text-[11.5px] text-[var(--color-neutral-500)]">{card.body}</div>
                        <div className="h-1 rounded-sm bg-[var(--color-neutral-800)] mt-1 overflow-hidden">
                          <ProgressBar
                            value={card.pct}
                            showValue={false}
                            style={{ height: 4, background: 'transparent' }}
                            color="var(--color-accent-500)"
                          />
                        </div>
                      </div>
                    ))}

                    {drag && (
                      <div className="relative min-h-24 rounded-sm border border-dashed border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_9%,transparent)] grid place-items-center animate-pulse">
                        <div className="flex flex-col items-center gap-1 text-[var(--color-accent-200)] text-[11px]">
                          <i className="pi pi-plus" style={{ fontSize: 14 }} />
                          {dropLabel}
                        </div>
                        <div className="absolute left-1.5 right-1.5 -top-1.5 h-0.5 bg-[var(--color-accent)] rounded-sm" />
                      </div>
                    )}
                  </div>

                  <div className="absolute -right-[5px] bottom-[-5px] w-[9px] h-[9px] rounded-[2px] bg-[var(--color-accent)]" />
                  <div className="absolute -left-[5px] bottom-[-5px] w-[9px] h-[9px] rounded-[2px] bg-[var(--color-accent)]" />
                </div>

                <div className="rounded-md bg-[var(--color-surface)] overflow-hidden [&_.p-datatable-thead]:hidden">
                  <div className="flex items-center gap-2.5 px-[13px] py-2.5 font-medium text-xs text-[var(--color-neutral-300)] shadow-[inset_0_-1px_0_var(--color-divider)]">
                    <i className="pi pi-table text-[var(--color-neutral-500)]" />
                    DataTable.history
                    <span className="ml-auto text-[11px] text-[var(--color-neutral-600)]">bound · invoices[]</span>
                  </div>
                  <MockDataTable
                    value={invoiceRows}
                    size="small"
                    className="[&_.p-datatable-tbody>tr]:bg-transparent [&_.p-datatable-tbody>tr]:text-[var(--color-neutral-400)] [&_.p-datatable-tbody>tr]:text-[11.5px]"
                  >
                    <Column field="id" />
                    <Column field="amount" style={{ fontVariantNumeric: 'tabular-nums' }} />
                    <Column
                      field="state"
                      body={(row) => (
                        <Tag className="!text-[var(--color-accent-300)]" value={row.state} severity="secondary" />
                      )}
                    />
                  </MockDataTable>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
