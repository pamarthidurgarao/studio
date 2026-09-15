import { useMemo } from 'react';
import type { StudioState } from '../hooks/useStudioState';
import { blockGroups } from '../data/studioData';

interface BlocksPanelProps {
  studio: StudioState;
}

export function BlocksPanel({ studio }: BlocksPanelProps) {
  const { search, setSearch } = studio;

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return blockGroups;
    return blockGroups
      .map((g) => ({ ...g, items: g.items.filter((it) => it.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [search]);

  return (
    <>
      <label className="studio-search">
        <i className="pi pi-search" />
        <input
          placeholder="Search PrimeReact / layout"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      {filteredGroups.map((g) => (
        <div className="studio-block-group" key={g.name}>
          <div className="studio-block-group-head">
            <span>{g.name}</span>
            <span>{g.count}</span>
          </div>
          <div className="studio-block-grid">
            {g.items.map((item) => (
              <div className="studio-block-chip" draggable title="Drag onto the canvas" key={item.label}>
                <i className={item.icon} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
