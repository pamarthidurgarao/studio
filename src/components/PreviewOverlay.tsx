import { Button } from 'primereact/button';
import { DataTable } from './shared/DataTable';
import { DynamicForm } from './shared/DynamicForm';
import { StepperForm } from './shared/StepperForm';
import type { DataTableEditor } from '../hooks/useDataTableEditor';
import type { DynamicFormEditor } from '../hooks/useDynamicFormEditor';
import type { StepperFormEditor } from '../hooks/useStepperFormEditor';
import type { StudioPageItem } from '../data/pagesData';

interface PreviewOverlayProps {
  activePage: StudioPageItem;
  tableEditor?: DataTableEditor;
  formEditor?: DynamicFormEditor;
  stepperEditor?: StepperFormEditor;
  onExit: () => void;
}

/** Full-screen "what a real user sees" preview — the Studio chrome (sidebar, properties panel,
 * canvas frame decoration, selection outlines) drops away and only the bound component renders,
 * wired to a no-op onAction so interacting with it here never mutates the editor's config. */
export function PreviewOverlay({ activePage, tableEditor, formEditor, stepperEditor, onExit }: PreviewOverlayProps) {
  const noop = () => {};

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="flex-none flex items-center gap-3 px-4 h-11 shadow-[inset_0_-1px_0_var(--color-divider)]">
        <span className="text-[12px] text-[var(--color-neutral-400)]">
          Preview <span className="text-[var(--color-neutral-600)]">·</span> {activePage.title}
        </span>
        <Button
          icon="pi pi-arrow-left"
          label="Back to editor"
          text
          size="small"
          className="ml-auto !text-[var(--color-accent)]"
          onClick={onExit}
        />
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div className="w-full max-w-[960px]">
          {tableEditor?.config ? (
            <DataTable data={tableEditor.data ?? []} config={tableEditor.config} onAction={noop} />
          ) : formEditor?.config ? (
            <DynamicForm data={formEditor.data ?? {}} config={formEditor.config} onAction={noop} />
          ) : stepperEditor?.config ? (
            <StepperForm data={stepperEditor.data ?? {}} config={stepperEditor.config} onAction={noop} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
