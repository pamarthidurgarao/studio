import type { CSSProperties } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import type { StudioState } from '../hooks/useStudioState';
import { billingCards, invoiceRows } from '../data/studioData';

interface CanvasAreaProps {
  studio: StudioState;
}

export function CanvasArea({ studio }: CanvasAreaProps) {
  const { crumb, viewportLabel, drag, setDrag, frameWidth, canvasGridStyle, trackSummary, dropLabel, mode } = studio;

  const cardSpanStyle = (): CSSProperties => {
    if (mode === 'rows') return { gridColumn: 'span 4' };
    if (mode === 'flex') return { flex: '1 1 180px' };
    return {};
  };

  return (
    <div className="studio-canvas-col">
      <div className="studio-canvas-toolbar">
        <span style={{ color: 'var(--color-accent)' }}>
          <i className="pi pi-directions" />
        </span>
        <span>{crumb}</span>
        <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{viewportLabel}</span>
        <button
          type="button"
          className={`studio-chip${drag ? ' active' : ''}`}
          style={{ fontSize: '10.5px', padding: '5px 8px' }}
          onClick={() => setDrag(!drag)}
        >
          <i className="pi pi-arrows-alt" style={{ fontSize: 12 }} />
          simulate drag
        </button>
      </div>

      <div className="studio-canvas-scroll">
        <div className="studio-frame" style={{ width: frameWidth }}>
          <div className="studio-frame-topbar">
            <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--color-accent-700)' }} />
            <span style={{ font: '500 12.5px var(--font-heading)', color: 'var(--color-neutral-200)' }}>
              Acme Console
            </span>
            <span>Overview</span>
            <span style={{ color: 'var(--color-accent-300)' }}>Billing</span>
            <span>Team</span>
            <span
              style={{
                marginLeft: 'auto',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--color-neutral-800)',
              }}
            />
          </div>

          <div className="studio-frame-content">
            <div className="studio-page-head">
              <div>
                <div style={{ font: '500 19px/1.2 var(--font-heading)', color: 'var(--color-neutral-100)' }}>
                  Billing
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 3 }}>
                  Plan, usage and invoice history
                </div>
              </div>
              <span
                style={{
                  marginLeft: 'auto',
                  padding: '6px 11px',
                  borderRadius: 6,
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-accent)',
                  fontSize: 12,
                }}
              >
                Upgrade
              </span>
            </div>

            <div className="studio-selected-box">
              <div className="studio-selected-tag">
                <i className="pi pi-th-large" />
                Grid.cards
                <span style={{ opacity: 0.7 }}>{trackSummary}</span>
              </div>

              <div style={canvasGridStyle}>
                {billingCards.map((card) => (
                  <div className="studio-billing-card" style={cardSpanStyle()} key={card.title}>
                    <div className="studio-billing-kicker">{card.kicker}</div>
                    <div className="studio-billing-title">{card.title}</div>
                    <div className="studio-billing-body">{card.body}</div>
                    <div className="studio-billing-bar-track">
                      <ProgressBar
                        value={card.pct}
                        showValue={false}
                        style={{ height: 4, background: 'transparent' }}
                        color="var(--color-accent-500)"
                      />
                    </div>
                  </div>
                ))}

                {drag && (
                  <div className="studio-dropzone">
                    <div className="studio-dropzone-inner">
                      <i className="pi pi-plus" style={{ fontSize: 14 }} />
                      {dropLabel}
                    </div>
                    <div className="studio-dropzone-line" />
                  </div>
                )}
              </div>

              <div className="studio-resize-handle" style={{ right: -5 }} />
              <div className="studio-resize-handle" style={{ left: -5 }} />
            </div>

            <div className="studio-table-wrap">
              <div className="studio-table-head">
                <i className="pi pi-table" style={{ color: 'var(--color-neutral-500)' }} />
                DataTable.history
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-neutral-600)' }}>
                  bound · invoices[]
                </span>
              </div>
              <DataTable value={invoiceRows} size="small">
                <Column field="id" />
                <Column field="amount" style={{ fontVariantNumeric: 'tabular-nums' }} />
                <Column
                  field="state"
                  body={(row) => <Tag className="studio-tag-paid" value={row.state} severity="secondary" />}
                />
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
