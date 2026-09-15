import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { StudioState } from '../hooks/useStudioState';

interface TopBarProps {
  studio: StudioState;
}

export function TopBar({ studio }: TopBarProps) {
  const { crumb, breakpoints, setBp } = studio;
  const crumbParts = crumb.split(' › ');

  return (
    <div className="studio-topbar">
      <div className="studio-brand">
        <div className="studio-brand-mark">
          <i className="pi pi-th-large" />
        </div>
        <span className="studio-brand-name">Studio</span>
        <span className="studio-crumb-sep">/</span>
        {crumbParts.map((part, i) => (
          <span key={i} className="studio-crumb-part">
            {part}
            {i < crumbParts.length - 1 && <span className="studio-crumb-sep"> › </span>}
          </span>
        ))}
        <Tag value="Draft" severity="secondary" style={{ marginLeft: 4 }} />
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
            {b.label}
          </button>
        ))}
      </div>

      <div className="studio-actions">
        <Button icon="pi pi-replay" text rounded aria-label="Undo" />
        <Button icon="pi pi-refresh" text rounded aria-label="Redo" />
        <Button icon="pi pi-stop" text rounded aria-label="Toggle outlines" title="Toggle outlines" />
        <Button icon="pi pi-code" text rounded aria-label="Code" title="Code" />
        <Button icon="pi pi-play" label="Preview" size="small" />
      </div>
    </div>
  );
}
