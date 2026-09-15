import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { StudioState } from '../hooks/useStudioState';

interface TopBarProps {
  studio: StudioState;
}

export function TopBar({ studio }: TopBarProps) {
  const { crumb, breakpoints, setBp, sidebarOpen, panelOpen, toggleSidebar, togglePanel } = studio;
  const crumbParts = crumb.split(' › ');

  return (
    <div className="studio-topbar">
      <button
        type="button"
        className={`studio-mobile-toggle${sidebarOpen ? ' active' : ''}`}
        aria-label="Toggle layers panel"
        onClick={toggleSidebar}
      >
        <i className="pi pi-bars" />
      </button>

      <div className="studio-brand">
        <div className="studio-brand-mark">
          <i className="pi pi-th-large" />
        </div>
        <span className="studio-brand-name">Studio</span>
        <span className="studio-crumb-sep studio-crumb-hideable">/</span>
        <span className="studio-crumb-hideable">
          {crumbParts.map((part, i) => (
            <span key={i} className="studio-crumb-part">
              {part}
              {i < crumbParts.length - 1 && <span className="studio-crumb-sep"> › </span>}
            </span>
          ))}
        </span>
        <Tag value="Draft" severity="secondary" className="studio-draft-tag" style={{ marginLeft: 4 }} />
      </div>

      <div className="studio-bp-switch">
        {breakpoints.map((b) => (
          <button
            key={b.key}
            type="button"
            title={b.title}
            className={`studio-chip${b.active ? ' active' : ''}`}
            onClick={() => setBp(b.key)}
          >
            <i className={b.icon} />
            <span className="studio-bp-label">{b.label}</span>
          </button>
        ))}
      </div>

      <div className="studio-actions">
        <Button icon="pi pi-replay" text rounded aria-label="Undo" className="studio-action-optional" />
        <Button icon="pi pi-refresh" text rounded aria-label="Redo" className="studio-action-optional" />
        <Button
          icon="pi pi-stop"
          text
          rounded
          aria-label="Toggle outlines"
          title="Toggle outlines"
          className="studio-action-optional"
        />
        <Button icon="pi pi-code" text rounded aria-label="Code" title="Code" className="studio-action-optional" />
        <Button icon="pi pi-play" label="Preview" size="small" className="studio-preview-btn" />
      </div>

      <button
        type="button"
        className={`studio-mobile-toggle${panelOpen ? ' active' : ''}`}
        aria-label="Toggle properties panel"
        onClick={togglePanel}
      >
        <i className="pi pi-sliders-h" />
      </button>
    </div>
  );
}
