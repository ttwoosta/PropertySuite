// Back-navigation tracking — lets sub-apps tell the Profile page which route to return to.
const STORE_KEY = 'ps_last_app';

interface AppRef { path: string; label: string }

export function rememberApp(path: string, label: string): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ path, label })); } catch { /* ignore */ }
}

export function profileReturn(): AppRef {
  try {
    const v = localStorage.getItem(STORE_KEY);
    if (v) return JSON.parse(v) as AppRef;
  } catch { /* ignore */ }
  return { path: '/', label: 'Apps' };
}
