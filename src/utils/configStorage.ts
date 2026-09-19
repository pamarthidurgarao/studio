/**
 * Persists a Studio page's edited config to localStorage, keyed by page id, so edits survive
 * switching pages or reloading the app instead of resetting to the static preset every time.
 * Deliberately simple (no backend) — Studio has no server to save to.
 */
const PREFIX = 'studio-config:';

export function loadSavedConfig<T>(pageId: string | undefined): T | null {
  if (!pageId) return null;
  try {
    const raw = localStorage.getItem(PREFIX + pageId);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveConfig(pageId: string | undefined, config: unknown): void {
  if (!pageId) return;
  try {
    localStorage.setItem(PREFIX + pageId, JSON.stringify(config));
  } catch {
    // localStorage unavailable (private mode, quota) — saving is best-effort only.
  }
}

export function clearSavedConfig(pageId: string | undefined): void {
  if (!pageId) return;
  try {
    localStorage.removeItem(PREFIX + pageId);
  } catch {
    // ignore
  }
}
