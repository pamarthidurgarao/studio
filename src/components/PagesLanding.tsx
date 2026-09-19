import { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from './shared/DataTable';
import type { DataTableActionEvent, DataTableConfig } from './shared/DataTable';
import './shared/DataTable/dataTable.css';
import { PAGE_TYPE_META, STUDIO_PAGES, type StudioPageItem, type StudioPageType } from '../data/pagesData';
import type { ThemeMode } from '../theme/themeLinks';
import { chip, typePill } from '../styles/cn';

type TabFilter = 'all' | StudioPageType;
type ViewMode = 'card' | 'table';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'form', label: 'Forms' },
  { key: 'table', label: 'Tables' },
  { key: 'stepper', label: 'Steppers' },
];

interface PagesLandingProps {
  onSelectPage: (page: StudioPageItem) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export function PagesLanding({ onSelectPage, theme, onToggleTheme }: PagesLandingProps) {
  const [tab, setTab] = useState<TabFilter>('all');
  const [view, setView] = useState<ViewMode>('card');

  const filteredPages = useMemo(
    () => (tab === 'all' ? STUDIO_PAGES : STUDIO_PAGES.filter((p) => p.type === tab)),
    [tab],
  );

  const tableConfig: DataTableConfig<StudioPageItem> = useMemo(
    () => ({
      dataKey: 'id',
      dataMode: 'client',
      rowClickable: true,
      sortable: true,
      globalSearch: { enabled: true, placeholder: 'Search pages...' },
      columns: [
        { field: 'title', header: 'Title', sortable: true, filterable: true, minWidth: '200px' },
        {
          field: 'type',
          header: 'Type',
          sortable: true,
          width: '140px',
          body: (row) => (
            <span className={typePill}>
              <i className={PAGE_TYPE_META[row.type].icon} />
              {PAGE_TYPE_META[row.type].label}
            </span>
          ),
        },
        { field: 'owner', header: 'Owner', sortable: true, width: '140px' },
        { field: 'updatedAt', header: 'Updated', sortable: true, width: '140px' },
      ],
    }),
    [],
  );

  const handleTableAction = (event: DataTableActionEvent<StudioPageItem>) => {
    if (event.type === 'row-click') onSelectPage(event.row);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] px-8 py-6 pb-12">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[5px] border border-[var(--color-accent)] grid place-items-center text-[var(--color-accent)] text-[11px]">
            <i className="pi pi-th-large" />
          </div>
          <span className="font-medium text-sm">Studio</span>
        </div>
        <Button
          icon={theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'}
          text
          rounded
          aria-label="Toggle theme"
          title="Toggle theme"
          onClick={onToggleTheme}
        />
      </div>

      <div className="mb-5">
        <h1 className="m-0 mb-1 font-semibold text-[22px] leading-[1.3]">Pages</h1>
        <p className="m-0 text-[var(--color-neutral-500)] text-[13px]">Pick a page to open it in Studio.</p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button key={t.key} type="button" className={chip(tab === t.key)} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-0.5 p-0.5 rounded-md border border-[var(--color-divider)]">
          {(
            [
              ['card', 'Card view', 'pi pi-th-large'],
              ['table', 'Table view', 'pi pi-list'],
            ] as [ViewMode, string, string][]
          ).map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              className={`inline-flex items-center justify-center w-7 h-7 rounded-md border cursor-pointer ${
                view === key
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]'
                  : 'border-transparent text-[var(--color-neutral-500)] bg-transparent'
              }`}
              aria-label={label}
              title={label}
              onClick={() => setView(key)}
            >
              <i className={icon} />
            </button>
          ))}
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {filteredPages.map((page) => (
            <button
              key={page.id}
              type="button"
              className="flex gap-3 text-left p-4 rounded-md border border-[var(--color-divider)] bg-[var(--color-surface)] cursor-pointer text-inherit transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-sm)] hover:-translate-y-px"
              onClick={() => onSelectPage(page)}
            >
              <div className="flex-none w-[38px] h-[38px] rounded-lg grid place-items-center bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] text-base">
                <i className={PAGE_TYPE_META[page.type].icon} />
              </div>
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="font-semibold text-sm">{page.title}</span>
                <span className="text-xs text-[var(--color-neutral-500)] leading-snug">{page.description}</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className={typePill}>{PAGE_TYPE_META[page.type].label}</span>
                  <span className="text-[11px] text-[var(--color-neutral-600)]">Updated {page.updatedAt}</span>
                </div>
              </div>
            </button>
          ))}
          {filteredPages.length === 0 && (
            <p className="text-[var(--color-neutral-500)] text-[13px]">No pages in this category yet.</p>
          )}
        </div>
      ) : (
        <DataTable<StudioPageItem> data={filteredPages} config={tableConfig} onAction={handleTableAction} />
      )}
    </div>
  );
}
