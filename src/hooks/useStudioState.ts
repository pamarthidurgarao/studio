import { useMemo, useState, type CSSProperties } from 'react';
import type { Breakpoint, LayoutMode, Padding, SidebarTab } from '../types';
import { layers } from '../data/studioData';

const BREAKPOINTS: { key: Breakpoint; label: string; icon: string; width: number | null; title: string }[] = [
  { key: 'desktop', label: '1440', icon: 'pi pi-desktop', width: null, title: 'Desktop' },
  { key: 'tablet', label: '820', icon: 'pi pi-tablet', width: 820, title: 'Tablet' },
  { key: 'mobile', label: '390', icon: 'pi pi-mobile', width: 390, title: 'Mobile' },
];

const LAYER_PATH: Record<string, string> = {
  page: 'Page',
  nav: 'Page › Nav.topbar',
  section: 'Page › Section.billing',
  head: 'Page › Section.billing › Stack.header',
  cards: 'Page › Section.billing › Grid.cards',
  card1: 'Page › Section.billing › Grid.cards › Card · Plan',
  card2: 'Page › Section.billing › Grid.cards › Card · Usage',
  card3: 'Page › Section.billing › Grid.cards › Card · Invoices',
  table: 'Page › Section.billing › DataTable.history',
};

const LAYER_TAG: Record<string, string> = {
  table: 'table',
};

export function useStudioState() {
  const [tab, setTab] = useState<SidebarTab>('blocks');
  const [bp, setBp] = useState<Breakpoint>('desktop');
  const [mode, setMode] = useState<LayoutMode>('grid');
  const [selectedLayer, setSelectedLayer] = useState<string>('cards');
  const [drag, setDrag] = useState(true);
  const [tracks, setTracks] = useState<string[]>(['1fr', '1fr', '1fr']);
  const [gap, setGap] = useState(16);
  const [pad, setPad] = useState<Padding>({ top: 24, right: 32, bottom: 24, left: 32 });
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const breakpoints = useMemo(
    () => BREAKPOINTS.map((b) => ({ ...b, active: b.key === bp })),
    [bp],
  );

  const currentBreakpoint = BREAKPOINTS.find((b) => b.key === bp) ?? BREAKPOINTS[0];

  const viewportLabel = currentBreakpoint.width ? `${currentBreakpoint.width} × 1024` : '1440 × 900';
  const bpName = bp === 'desktop' ? 'Base (≥1280)' : bp === 'tablet' ? 'md (≥768)' : 'sm (≥390)';

  const selectedLayerData = layers.find((l) => l.key === selectedLayer) ?? layers[4];
  const crumb = LAYER_PATH[selectedLayer] ?? LAYER_PATH.cards;
  const selName = selectedLayerData.label;
  const selTag = LAYER_TAG[selectedLayer] ?? 'div';

  const dropLabel = useMemo(() => {
    if (mode === 'flex') return 'Drop after item 3 · wraps';
    if (mode === 'absolute') return 'Drop free · x 0 y 0';
    return tracks.length > 3 ? 'Drop into row 1 · col 4' : 'Drop into row 2 · col 1';
  }, [mode, tracks.length]);

  const trackSummary = `· ${tracks.join(' ')} / gap ${gap}`;
  const gapLabel = `${gap}px`;

  const canvasGridStyle = useMemo<CSSProperties>(() => {
    if (mode === 'flex') return { display: 'flex', flexWrap: 'wrap', gap };
    if (mode === 'absolute') {
      return {
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(${tracks.length}, minmax(0,1fr))`,
        gap,
      };
    }
    if (mode === 'rows') {
      return { display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0,1fr))', gap };
    }
    return { display: 'grid', gridTemplateColumns: tracks.join(' '), gap };
  }, [mode, tracks, gap]);

  const cssOut = useMemo(() => {
    const displayLine = `display: ${mode === 'flex' ? 'flex' : mode === 'absolute' ? 'block' : 'grid'};`;
    const secondLine =
      mode === 'grid'
        ? `grid-template-columns: ${tracks.join(' ')};`
        : mode === 'rows'
          ? 'grid-template-columns: repeat(12, minmax(0,1fr));'
          : mode === 'flex'
            ? 'flex-flow: row wrap;'
            : 'position: relative;';
    return [
      displayLine,
      secondLine,
      `gap: ${gap}px;`,
      `padding: ${pad.top}px ${pad.right}px ${pad.bottom}px ${pad.left}px;`,
    ];
  }, [mode, tracks, gap, pad]);

  const frameWidth = currentBreakpoint.width ? `${currentBreakpoint.width}px` : '100%';

  const addTrack = () => setTracks((t) => [...t, '1fr']);
  const removeTrack = () => setTracks((t) => (t.length > 1 ? t.slice(0, -1) : t));
  const setTrackValue = (index: number, value: string) =>
    setTracks((t) => t.map((v, i) => (i === index ? value : v)));

  const setPadSide = (side: keyof Padding, value: number) =>
    setPad((p) => ({ ...p, [side]: Number.isFinite(value) ? value : p[side] }));

  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const togglePanel = () => setPanelOpen((v) => !v);
  const closeDrawers = () => {
    setSidebarOpen(false);
    setPanelOpen(false);
  };
  const selectLayer = (key: string) => {
    setSelectedLayer(key);
    setSidebarOpen(false);
  };

  return {
    tab,
    setTab,
    bp,
    setBp,
    mode,
    setMode,
    selectedLayer,
    setSelectedLayer,
    drag,
    setDrag,
    tracks,
    setTrackValue,
    addTrack,
    removeTrack,
    gap,
    setGap,
    pad,
    setPadSide,
    search,
    setSearch,
    sidebarOpen,
    panelOpen,
    toggleSidebar,
    togglePanel,
    closeDrawers,
    selectLayer,
    breakpoints,
    viewportLabel,
    bpName,
    crumb,
    selName,
    selTag,
    dropLabel,
    trackSummary,
    gapLabel,
    canvasGridStyle,
    cssOut,
    frameWidth,
  };
}

export type StudioState = ReturnType<typeof useStudioState>;
