import type { SidebarTab } from '../types';
import type { StudioState } from '../hooks/useStudioState';
import type { StudioPageItem } from '../data/pagesData';
import { BlocksPanel } from './BlocksPanel';
import { LayersPanel } from './LayersPanel';
import { PagesPanel } from './PagesPanel';
import { chip, railBtn } from '../styles/cn';

const TABS: { key: SidebarTab; label: string; icon: string }[] = [
  { key: 'pages', label: 'Pages', icon: 'pi pi-file' },
  { key: 'blocks', label: 'Blocks', icon: 'pi pi-th-large' },
  { key: 'layers', label: 'Layers', icon: 'pi pi-sitemap' },
];

const RAIL_ICONS = [
  { icon: 'pi pi-th-large', title: 'Project' },
  { icon: 'pi pi-file', title: 'Pages', active: true },
  { icon: 'pi pi-objects-column', title: 'Components' },
  { icon: 'pi pi-database', title: 'Data' },
  { icon: 'pi pi-palette', title: 'Theme' },
];

interface SidebarProps {
  studio: StudioState;
  activePage?: StudioPageItem | null;
  onSelectPage?: (page: StudioPageItem) => void;
}

export function Sidebar({ studio, activePage, onSelectPage }: SidebarProps) {
  const { tab, setTab, sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = studio;

  return (
    <div
      className={`flex flex-row min-h-0 fixed top-12 bottom-0 left-0 z-40 w-[min(82vw,300px)] bg-[var(--color-bg)] transition-transform duration-200 ease-out shadow-[inset_-1px_0_0_var(--color-divider)] lg:static lg:w-auto lg:translate-x-0 lg:transition-none ${
        sidebarOpen ? 'translate-x-0 shadow-[var(--shadow-md),inset_-1px_0_0_var(--color-divider)]' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col items-center gap-0.5 flex-none w-11 py-2 bg-[var(--color-bg)] shadow-[inset_-1px_0_0_var(--color-divider)]">
        {RAIL_ICONS.map((r) => (
          <button key={r.title} type="button" className={railBtn(Boolean(r.active))} title={r.title}>
            <i className={r.icon} />
          </button>
        ))}
        <button
          type="button"
          className={`${railBtn(false)} mt-auto`}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleSidebarCollapsed}
        >
          <i className={sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'} />
        </button>
      </div>

      {!sidebarCollapsed && (
        <div className="flex flex-col min-w-0 min-h-0 flex-1">
          <div className="flex gap-0.5 mx-2.5 mt-2 mb-1.5 flex-none rounded-md border border-[var(--color-divider)] p-0.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`${chip(tab === t.key)} !flex-1 min-w-0 justify-center !px-1.5`}
                onClick={() => setTab(t.key)}
              >
                <i className={t.icon} style={{ fontSize: 11 }} />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto px-2.5 pt-1 pb-3.5 flex flex-col gap-3">
            {tab === 'pages' && (
              <PagesPanel activePage={activePage ?? null} onSelectPage={onSelectPage ?? (() => {})} />
            )}
            {tab === 'blocks' && <BlocksPanel studio={studio} />}
            {tab === 'layers' && <LayersPanel studio={studio} />}
          </div>
        </div>
      )}
    </div>
  );
}
