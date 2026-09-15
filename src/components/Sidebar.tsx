import type { SidebarTab } from '../types';
import type { StudioState } from '../hooks/useStudioState';
import { BlocksPanel } from './BlocksPanel';
import { LayersPanel } from './LayersPanel';
import { TokensPanel } from './TokensPanel';

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'blocks', label: 'Blocks' },
  { key: 'layers', label: 'Layers' },
  { key: 'tokens', label: 'Tokens' },
];

interface SidebarProps {
  studio: StudioState;
}

export function Sidebar({ studio }: SidebarProps) {
  const { tab, setTab } = studio;

  return (
    <div className="studio-sidebar">
      <div className="studio-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`studio-chip${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="studio-sidebar-scroll">
        {tab === 'blocks' && <BlocksPanel studio={studio} />}
        {tab === 'layers' && <LayersPanel studio={studio} />}
        {tab === 'tokens' && <TokensPanel />}
      </div>
    </div>
  );
}
