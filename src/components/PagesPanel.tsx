import { useMemo, useState } from 'react';
import { PAGE_TYPE_META, STUDIO_PAGES, type StudioPageItem, type StudioPageType } from '../data/pagesData';
import { layerBadge, layerLabel, layerRow, searchBox, sectionLabel } from '../styles/cn';

const GROUP_ORDER: StudioPageType[] = ['table', 'form', 'stepper'];
const GROUP_LABEL: Record<StudioPageType, string> = {
  table: 'Tables',
  form: 'Forms',
  stepper: 'Steppers',
};

interface PagesPanelProps {
  activePage: StudioPageItem | null;
  onSelectPage: (page: StudioPageItem) => void;
}

export function PagesPanel({ activePage, onSelectPage }: PagesPanelProps) {
  const [search, setSearch] = useState('');

  const groups = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = needle
      ? STUDIO_PAGES.filter((p) => p.title.toLowerCase().includes(needle))
      : STUDIO_PAGES;
    return GROUP_ORDER.map((type) => ({
      type,
      pages: filtered.filter((p) => p.type === type),
    })).filter((g) => g.pages.length > 0);
  }, [search]);

  return (
    <div className="flex flex-col gap-3">
      <div className={searchBox}>
        <i className="pi pi-search text-xs" />
        <input
          className="border-0 bg-transparent outline-none text-[var(--color-text)] w-full text-[13px]"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {groups.map((group) => (
        <div className="flex flex-col gap-1.5" key={group.type}>
          <div className={`flex items-center justify-between ${sectionLabel}`}>
            <span>{GROUP_LABEL[group.type]}</span>
            <span>{group.pages.length}</span>
          </div>
          <div className="flex flex-col gap-px">
            {group.pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={layerRow(activePage?.id === page.id)}
                onClick={() => onSelectPage(page)}
              >
                <i className={PAGE_TYPE_META[page.type].icon} style={{ fontSize: 13, opacity: 0.7 }} />
                <span className={layerLabel}>{page.title}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className={`${layerBadge} px-0.5 py-1`} style={{ fontSize: 11.5 }}>
          No pages match "{search}".
        </div>
      )}
    </div>
  );
}
