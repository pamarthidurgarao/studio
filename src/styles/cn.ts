/**
 * Small reusable Tailwind utility-class strings for patterns repeated across Studio's own
 * chrome (tab pills, icon-rail buttons, segmented controls, list rows, form fields, ...).
 * Kept as plain functions/strings — not CSS — so the whole Studio UI stays on Tailwind
 * utilities with zero custom stylesheet rules. Colors reference the existing CSS custom
 * properties in theme.css (the light/dark "Nocturne" token set) via Tailwind's arbitrary
 * value syntax, so the theme toggle keeps working unchanged.
 */

const mix = (pct: number) => `color-mix(in_srgb,var(--color-accent)_${pct}%,transparent)`;

export function chip(active: boolean): string {
  return [
    'inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none flex-none',
    'rounded-md border px-2 py-1.5 font-medium text-[11.5px] leading-none transition-colors',
    active
      ? `border-[var(--color-accent)] text-[var(--color-accent)] bg-[${mix(12)}]`
      : 'border-transparent text-[var(--color-neutral-400)] bg-transparent hover:text-[var(--color-text)]',
  ].join(' ');
}

export function railBtn(active: boolean): string {
  return [
    'grid place-items-center w-[30px] h-[30px] rounded-md border border-transparent cursor-pointer text-[14px]',
    active
      ? `text-[var(--color-accent)] bg-[${mix(14)}]`
      : 'text-[var(--color-neutral-500)] bg-transparent hover:text-[var(--color-text)]',
  ].join(' ');
}

export function modeBtn(active: boolean): string {
  return [
    'flex items-center gap-1.5 rounded-md px-2.5 py-2 cursor-pointer font-medium text-[11.5px] border',
    active
      ? `border-[var(--color-accent)] text-[var(--color-accent)] bg-[${mix(12)}]`
      : 'border-[var(--color-divider)] text-[var(--color-neutral-400)] bg-transparent',
  ].join(' ');
}

export function presetBtn(active: boolean): string {
  return [
    'rounded px-1.5 py-1 cursor-pointer font-medium text-[9.5px] border',
    active
      ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
      : 'border-[var(--color-divider)] text-[var(--color-neutral-500)] bg-transparent',
  ].join(' ');
}

export function layerRow(selected: boolean): string {
  return [
    'flex items-center gap-[7px] w-full rounded-md border border-transparent px-2 py-1.5 cursor-pointer text-left',
    'text-[12px] bg-transparent',
    selected
      ? `text-[var(--color-accent-200)] bg-[${mix(16)}] shadow-[inset_0_0_0_1px_var(--color-accent)]`
      : `text-[var(--color-neutral-300)] hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]`,
  ].join(' ');
}

export const layerLabel = 'flex-1 overflow-hidden text-ellipsis whitespace-nowrap';
export const layerBadge = 'font-medium text-[9.5px] leading-none tracking-wide text-[var(--color-neutral-600)]';

export const sectionLabel =
  'font-medium text-[10px] leading-none tracking-[0.09em] uppercase text-[var(--color-neutral-600)]';

export const gapRow = 'flex items-center justify-between';

export const fieldLabel = 'block text-[10.5px] text-[var(--color-neutral-500)] mb-[3px]';

export const inputClass =
  'w-full min-h-[26px] rounded-md border px-[7px] py-[3px] text-[11.5px] border-[var(--color-divider)] bg-[var(--color-surface)] text-[var(--color-text)]';

export const tokenRow = 'flex items-center gap-2 rounded-md px-2 py-1.5 bg-[var(--color-surface)] flex-wrap';
export const tokenName = 'flex-1 font-medium text-[11.5px]';
export const tokenValue = 'text-[10.5px] text-[var(--color-neutral-500)] tabular-nums';

export const typePill =
  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-[var(--color-accent)] text-[11px] font-semibold whitespace-nowrap';

export const searchBox =
  'flex items-center gap-[7px] rounded-md border border-[var(--color-divider)] px-2.5 py-1 text-[var(--color-neutral-500)]';

export const stack = (gap: number) => `flex flex-col gap-[${gap}px]`;

export const fieldGrid = 'grid grid-cols-2 gap-[7px]';

export const inputSmClass =
  'w-full min-h-6 rounded-md border px-1.5 py-0.5 text-[11px] text-center border-[var(--color-divider)] bg-[var(--color-surface)] text-[var(--color-text)]';

/** Right/left drawer panel that's a fixed off-canvas sheet below `lg`, and a normal static
 * grid column at `lg` and up — used for both the sidebar and the properties panel. */
export function drawer(side: 'left' | 'right', open: boolean): string {
  const edge = side === 'left' ? 'left-0' : 'right-0';
  const hiddenTransform = side === 'left' ? '-translate-x-full' : 'translate-x-full';
  return [
    'fixed top-12 bottom-0 z-40 w-[min(82vw,300px)] bg-[var(--color-bg)]',
    'transition-transform duration-200 ease-out',
    'lg:static lg:w-auto lg:translate-x-0 lg:transition-none',
    edge,
    open ? `translate-x-0 shadow-[var(--shadow-md)]` : hiddenTransform,
  ].join(' ');
}
