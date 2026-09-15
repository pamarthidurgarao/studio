import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Slider } from 'primereact/slider';
import { Tag } from 'primereact/tag';
import type { LayoutMode, Padding } from '../types';
import type { StudioState } from '../hooks/useStudioState';

const MODES: { key: LayoutMode; label: string; icon: string }[] = [
  { key: 'grid', label: 'Grid', icon: 'pi pi-th-large' },
  { key: 'flex', label: 'Flex', icon: 'pi pi-bars' },
  { key: 'rows', label: 'Rows + cols', icon: 'pi pi-table' },
  { key: 'absolute', label: 'Absolute', icon: 'pi pi-window-maximize' },
];

const TRACK_PRESETS = ['1fr', 'auto', 'min'];

interface PropertiesPanelProps {
  studio: StudioState;
}

export function PropertiesPanel({ studio }: PropertiesPanelProps) {
  const {
    mode,
    setMode,
    selName,
    selTag,
    bpName,
    tracks,
    setTrackValue,
    addTrack,
    removeTrack,
    gap,
    setGap,
    gapLabel,
    pad,
    setPadSide,
    cssOut,
    panelOpen,
  } = studio;

  return (
    <div className={`studio-properties${panelOpen ? ' open' : ''}`}>
      <div className="studio-properties-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <i className="pi pi-th-large" style={{ color: 'var(--color-accent)' }} />
          <span style={{ font: '500 13px var(--font-heading)' }}>{selName}</span>
          <Tag value={selTag} severity="secondary" style={{ marginLeft: 'auto', fontSize: 10 }} />
        </div>
        <div
          style={{
            marginTop: 7,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10.5,
            color: 'var(--color-neutral-500)',
          }}
        >
          <i className="pi pi-mobile" />
          editing <span style={{ color: 'var(--color-accent-300)' }}>{bpName}</span> · inherits base
        </div>
      </div>

      <div className="studio-properties-scroll">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div className="studio-section-label">Display</div>
          <div className="studio-mode-grid">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`studio-mode-btn${mode === m.key ? ' active' : ''}`}
                onClick={() => setMode(m.key)}
              >
                <i className={m.icon} style={{ fontSize: 14 }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'grid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="studio-section-label">Columns</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button icon="pi pi-minus" text size="small" style={{ width: 22, height: 22 }} onClick={removeTrack} />
                <Button icon="pi pi-plus" size="small" style={{ width: 22, height: 22 }} onClick={addTrack} />
              </div>
            </div>

            <div className="studio-track-map" style={{ gridTemplateColumns: tracks.join(' ') }}>
              {tracks.map((t, i) => (
                <div className="studio-track-bar" key={i}>
                  {t}
                </div>
              ))}
            </div>

            {tracks.map((t, i) => (
              <div className="studio-track-row" key={i}>
                <span className="studio-track-index">{i + 1}</span>
                <InputText
                  className="studio-input"
                  value={t}
                  onChange={(e) => setTrackValue(i, e.target.value)}
                />
                <div className="studio-preset-btns">
                  {TRACK_PRESETS.map((p) => {
                    const active = p === 'min' ? t === 'min-content' : t === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`studio-preset-btn${active ? ' active' : ''}`}
                        onClick={() => setTrackValue(i, p === 'min' ? 'min-content' : p)}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="studio-field-grid" style={{ marginTop: 2 }}>
              <div className="studio-field">
                <label>Rows</label>
                <InputText className="studio-input" defaultValue="auto" style={{ width: '100%' }} />
              </div>
              <div className="studio-field">
                <label>Auto-flow</label>
                <InputText className="studio-input" defaultValue="row dense" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {mode === 'flex' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="studio-section-label">Flex</div>
            <div className="studio-field-grid">
              <div className="studio-field">
                <label>Direction</label>
                <InputText className="studio-input" defaultValue="row" style={{ width: '100%' }} />
              </div>
              <div className="studio-field">
                <label>Wrap</label>
                <InputText className="studio-input" defaultValue="wrap" style={{ width: '100%' }} />
              </div>
              <div className="studio-field">
                <label>Justify</label>
                <InputText className="studio-input" defaultValue="space-between" style={{ width: '100%' }} />
              </div>
              <div className="studio-field">
                <label>Align</label>
                <InputText className="studio-input" defaultValue="stretch" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {mode === 'rows' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="studio-section-label">Column span · 12-col</div>
            <div className="studio-span-grid">
              {Array.from({ length: 12 }, (_, i) => (
                <div
                  className="studio-span-cell"
                  key={i}
                  style={{
                    background: i < 4 ? 'color-mix(in srgb, var(--color-accent) 30%, transparent)' : 'var(--color-neutral-900)',
                    boxShadow: `inset 0 0 0 1px ${i < 4 ? 'var(--color-accent-600)' : 'var(--color-neutral-800)'}`,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--color-neutral-500)',
              }}
            >
              <span>span 4 · offset 0</span>
              <span>gutter {gapLabel}</span>
            </div>
          </div>
        )}

        {mode === 'absolute' && (
          <div className="studio-field-grid">
            <div className="studio-field">
              <label>X</label>
              <InputText className="studio-input" defaultValue="248px" style={{ width: '100%' }} />
            </div>
            <div className="studio-field">
              <label>Y</label>
              <InputText className="studio-input" defaultValue="96px" style={{ width: '100%' }} />
            </div>
            <div className="studio-field">
              <label>W</label>
              <InputText className="studio-input" defaultValue="360px" style={{ width: '100%' }} />
            </div>
            <div className="studio-field">
              <label>H</label>
              <InputText className="studio-input" defaultValue="auto" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div className="studio-gap-row">
            <div className="studio-section-label">Gap</div>
            <span style={{ fontSize: 11, color: 'var(--color-accent-300)', fontVariantNumeric: 'tabular-nums' }}>
              {gapLabel}
            </span>
          </div>
          <Slider value={gap} min={0} max={48} onChange={(e) => setGap(e.value as number)} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div className="studio-section-label">Box model</div>
          <div className="studio-boxmodel">
            <div className="studio-boxmodel-grid">
              {(
                [
                  ['T', 'top'],
                  ['R', 'right'],
                  ['B', 'bottom'],
                  ['L', 'left'],
                ] as [string, keyof Padding][]
              ).map(([label, side]) => (
                <div className="studio-boxmodel-field" key={side}>
                  <span className="studio-boxmodel-key">{label}</span>
                  <InputText
                    className="studio-input-sm"
                    value={String(pad[side])}
                    onChange={(e) => setPadSide(side, Number(e.target.value.replace(/[^0-9]/g, '')))}
                  />
                </div>
              ))}
            </div>
            <div className="studio-boxmodel-content">content · auto × auto</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="studio-section-label">
            <i className="pi pi-code" style={{ fontSize: 12 }} />
            Computed
          </div>
          <div className="studio-computed">
            {cssOut.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
