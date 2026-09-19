import { useEffect, useState } from 'react';
import type { StudioState } from '../hooks/useStudioState';
import { layerBadge, layerLabel, layerRow } from '../styles/cn';

interface DomLayerNode {
  el: Element;
  depth: number;
  tag: string;
  detail: string;
}

/** Tags/classes worth surfacing as their own row — everything else is a purely structural
 * wrapper (PrimeReact/flex/grid divs) that gets flattened away instead of cluttering the tree. */
const SIGNIFICANT_TAGS = new Set([
  'input', 'button', 'select', 'textarea', 'label', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'a', 'img', 'svg', 'h1', 'h2', 'h3', 'h4', 'form',
]);

const NOTABLE_CLASS_PREFIXES = ['p-datatable', 'p-dropdown', 'p-multiselect', 'p-calendar', 'p-button', 'p-inputtext', 'p-inputswitch', 'p-checkbox', 'p-radiobutton', 'p-tag', 'df-field', 'df-section', 'dt-shared-wrapper', 'dt-toolbar'];

function pickNotableClass(el: Element): string | null {
  for (const cls of el.classList) {
    if (NOTABLE_CLASS_PREFIXES.some((p) => cls.startsWith(p))) return cls;
  }
  return null;
}

function isSignificant(el: Element): { significant: boolean; detail: string } {
  const tag = el.tagName.toLowerCase();
  if (el.id) return { significant: true, detail: `#${el.id}` };
  for (const attr of el.attributes) {
    if (attr.name.startsWith('data-df-') || attr.name.startsWith('data-')) {
      return { significant: true, detail: `[${attr.name.replace('data-', '')}=${attr.value}]` };
    }
  }
  if (SIGNIFICANT_TAGS.has(tag)) return { significant: true, detail: '' };
  const notable = pickNotableClass(el);
  if (notable) return { significant: true, detail: `.${notable}` };
  return { significant: false, detail: '' };
}

function walk(root: Element, depth: number, out: DomLayerNode[], cap: { n: number }) {
  for (const child of Array.from(root.children)) {
    if (cap.n > 400) return;
    if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') continue;
    const { significant, detail } = isSignificant(child);
    if (significant) {
      out.push({ el: child, depth, tag: child.tagName.toLowerCase(), detail });
      cap.n += 1;
      walk(child, depth + 1, out, cap);
    } else {
      walk(child, depth, out, cap);
    }
  }
}

function iconFor(tag: string): string {
  switch (tag) {
    case 'input':
    case 'textarea':
    case 'select':
      return 'pi pi-pencil';
    case 'button':
    case 'a':
      return 'pi pi-circle-fill';
    case 'table':
    case 'thead':
    case 'tbody':
    case 'tr':
    case 'th':
    case 'td':
      return 'pi pi-table';
    case 'label':
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
      return 'pi pi-tag';
    case 'img':
    case 'svg':
      return 'pi pi-image';
    default:
      return 'pi pi-stop';
  }
}

interface LayersPanelProps {
  studio: StudioState;
}

export function LayersPanel({ studio }: LayersPanelProps) {
  const { canvasRef } = studio;
  const [nodes, setNodes] = useState<DomLayerNode[]>([]);
  const [selectedEl, setSelectedEl] = useState<Element | null>(null);

  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;

    const refresh = () => {
      const out: DomLayerNode[] = [];
      walk(root, 0, out, { n: 0 });
      setNodes(out);
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(root, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [canvasRef]);

  // This intentionally mutates a plain DOM node's style directly (not React-managed state) to
  // briefly flash an outline around whatever real element a tree row points at, then restores
  // it — an imperative, transient effect outside React's render cycle.
  /* eslint-disable react/immutability */
  const selectNode = (el: Element) => {
    setSelectedEl(el);
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const htmlEl = el as HTMLElement;
    const prevOutline = htmlEl.style.outline;
    htmlEl.style.outline = '2px solid var(--color-accent)';
    htmlEl.style.outlineOffset = '1px';
    window.setTimeout(() => {
      htmlEl.style.outline = prevOutline;
    }, 900);
  };
  /* eslint-enable react/immutability */

  if (nodes.length === 0) {
    return (
      <div className={layerBadge} style={{ padding: '4px 2px' }}>
        Nothing rendered in the canvas yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-px">
      {nodes.map((node, i) => (
        <div
          key={i}
          className={layerRow(node.el === selectedEl)}
          style={{ paddingLeft: 8 + node.depth * 13 }}
          onClick={() => selectNode(node.el)}
        >
          <i className={iconFor(node.tag)} style={{ fontSize: 13, opacity: 0.7 }} />
          <span className={layerLabel}>{node.tag}</span>
          {node.detail && <span className={layerBadge}>{node.detail}</span>}
        </div>
      ))}
    </div>
  );
}
