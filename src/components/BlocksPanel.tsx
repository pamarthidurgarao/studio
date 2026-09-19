import { useMemo } from 'react';
import type { StudioState } from '../hooks/useStudioState';
import { blockGroups } from '../data/studioData';
import { searchBox, sectionLabel } from '../styles/cn';

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
      <label className={searchBox}>
        <i className="pi pi-search text-xs" />
        <input
          className="border-0 bg-transparent outline-none text-[var(--color-text)] w-full text-[13px]"
          placeholder="Search PrimeReact / layout"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      {filteredGroups.map((g) => (
        <div className="flex flex-col gap-1.5" key={g.name}>
          <div className={`flex items-center justify-between ${sectionLabel}`}>
            <span>{g.name}</span>
            <span>{g.count}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {g.items.map((item) => (
              <div
                className="flex flex-col gap-1.5 rounded-sm border border-dashed border-[var(--color-neutral-800)] bg-[var(--color-surface)] px-2 py-2.5 text-[var(--color-neutral-400)] cursor-grab transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent-200)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,transparent)]"
                draggable
                title="Drag onto the canvas"
                key={item.label}
              >
                <i className={item.icon} style={{ fontSize: 15 }} />
                <span className="text-[11px] leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
