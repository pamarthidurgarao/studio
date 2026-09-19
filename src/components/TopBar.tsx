import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { StudioState } from '../hooks/useStudioState';
import type { ThemeMode } from '../theme/themeLinks';
import { chip } from '../styles/cn';

interface TopBarProps {
  studio: StudioState;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onBackToPages: () => void;
  onPreview?: () => void;
  pageTitle?: string;
}

export function TopBar({ studio, theme, onToggleTheme, onBackToPages, onPreview, pageTitle }: TopBarProps) {
  const { crumb, breakpoints, setBp, sidebarOpen, panelOpen, toggleSidebar, togglePanel } = studio;
  const crumbParts = crumb.split(' › ');

  return (
    <div className="flex items-center gap-3.5 px-3.5 h-12 flex-none min-w-0 shadow-[inset_0_-1px_0_var(--color-divider)]">
      <button
        type="button"
        className={`lg:hidden grid place-items-center w-[30px] h-[30px] flex-none rounded-md border cursor-pointer text-[15px] ${
          sidebarOpen
            ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]'
            : 'border-transparent text-[var(--color-neutral-400)] bg-transparent'
        }`}
        aria-label="Toggle layers panel"
        onClick={toggleSidebar}
      >
        <i className="pi pi-bars" />
      </button>

      <button
        type="button"
        className="flex items-center gap-2 mr-1.5 min-w-0 overflow-hidden bg-transparent border-0 p-0 cursor-pointer"
        onClick={onBackToPages}
        title="Back to Pages"
      >
        <div className="w-5 h-5 rounded-[5px] border border-[var(--color-accent)] grid place-items-center text-[var(--color-accent)] text-[11px]">
          <i className="pi pi-th-large" />
        </div>
        <span className="hidden sm:inline font-medium text-sm">Studio</span>
        <span className="hidden md:inline text-[var(--color-neutral-600)]">/</span>
        <span className="hidden md:inline">
          {pageTitle ? (
            <span className="text-[var(--color-neutral-400)]">{pageTitle}</span>
          ) : (
            crumbParts.map((part, i) => (
              <span key={i} className="text-[var(--color-neutral-400)]">
                {part}
                {i < crumbParts.length - 1 && <span className="text-[var(--color-neutral-600)]"> › </span>}
              </span>
            ))
          )}
        </span>
        <Tag
          value="DRAFT"
          className="ml-1 !bg-[var(--color-accent)] !text-[var(--color-selected-tag-text)] !font-bold !text-[10px] !tracking-wide !px-2 !py-1 !rounded-md hidden sm:inline-flex"
        />
      </button>

      <div className="flex items-center gap-0.5 ml-auto p-0.5 rounded-md border border-[var(--color-divider)]">
        {breakpoints.map((b) => (
          <button key={b.key} type="button" title={b.title} className={chip(b.active)} onClick={() => setBp(b.key)}>
            <i className={b.icon} />
            <span className="hidden md:inline">{b.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[var(--color-neutral-500)]">
        <Button icon="pi pi-replay" text rounded aria-label="Undo" className="hidden sm:inline-flex" />
        <Button icon="pi pi-refresh" text rounded aria-label="Redo" className="hidden sm:inline-flex" />
        <Button
          icon={theme === 'light' ? 'pi pi-moon' : 'pi pi-sun'}
          text
          rounded
          aria-label="Toggle theme"
          title="Toggle theme"
          className="hidden sm:inline-flex"
          onClick={onToggleTheme}
        />
        <Button
          icon="pi pi-cloud-upload"
          label="Publish"
          size="small"
          outlined
          className="hidden sm:inline-flex !text-[var(--color-accent)] !border-[var(--color-accent)] !text-[11px] !py-1 !px-2.5 !gap-1.5"
        />
        <Button
          icon="pi pi-play"
          label="Preview"
          size="small"
          outlined
          className="!text-[var(--color-accent)] !border-[var(--color-accent)] !text-[11px] !py-1 !px-2.5 !gap-1.5"
          onClick={onPreview}
        />
      </div>

      <button
        type="button"
        className={`lg:hidden grid place-items-center w-[30px] h-[30px] flex-none rounded-md border cursor-pointer text-[15px] ${
          panelOpen
            ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)]'
            : 'border-transparent text-[var(--color-neutral-400)] bg-transparent'
        }`}
        aria-label="Toggle properties panel"
        onClick={togglePanel}
      >
        <i className="pi pi-sliders-h" />
      </button>
    </div>
  );
}
