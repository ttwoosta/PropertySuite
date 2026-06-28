/** Parse a loose numeric string to a number (0 on failure). Ported from `num`. */
export function num(s: string | number): number {
  const n = parseFloat(String(s));
  return isNaN(n) ? 0 : n;
}

/** Keep digits + a single dot, max 2 decimals. Ported from `sanitizeAmt`. */
export function sanitizeAmt(s: string): string {
  s = String(s).replace(/[^0-9.]/g, '');
  const p = s.split('.');
  return p.length > 1 ? p[0] + '.' + p.slice(1).join('').slice(0, 2) : s;
}

/** Human file size, ported from `fileSize`. */
export function fileSize(b: number): string {
  return b < 1024
    ? b + ' B'
    : b < 1048576
      ? (b / 1024).toFixed(0) + ' KB'
      : (b / 1048576).toFixed(1) + ' MB';
}

/** Map a MIME type to a receipt kind, ported from `kindOf`. */
export function kindOf(type: string): 'pdf' | 'img' | 'other' {
  return /pdf/i.test(type) ? 'pdf' : /^image\//i.test(type) ? 'img' : 'other';
}

/** Field-label tag descriptor (required/optional pill). */
export interface LabelTag {
  tone: 'req' | 'opt';
  label: string;
}
