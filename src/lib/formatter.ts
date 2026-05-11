/**
 * Output formatter — table | json | csv.
 *
 * `table` is the default for terminal use (compact column-aligned text).
 * `json` is intended for scripting (`bbx customers list --format=json`).
 * `csv` for piping into spreadsheets.
 *
 * The formatter never throws on unexpected shapes — it falls back to
 * pretty-printed JSON so users always see something.
 */

export type OutputFormat = 'table' | 'json' | 'csv';

export function parseFormat(value: string | undefined, fallback: OutputFormat = 'table'): OutputFormat {
  const v = (value ?? '').toLowerCase();
  if (v === 'json' || v === 'csv' || v === 'table') return v;
  return fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRowArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isPlainObject);
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

const DEFAULT_MAX_CELL_WIDTH = 40;

function renderTable(rows: ReadonlyArray<Record<string, unknown>>, columns?: ReadonlyArray<string>): string {
  if (rows.length === 0) return '(no rows)';
  const cols = columns ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const widths = new Map<string, number>();
  for (const col of cols) {
    let width = col.length;
    for (const row of rows) {
      const cellText = truncate(stringifyCell(row[col]), DEFAULT_MAX_CELL_WIDTH);
      if (cellText.length > width) width = cellText.length;
    }
    widths.set(col, width);
  }
  const headerLine = cols.map((c) => c.padEnd(widths.get(c) ?? c.length)).join('  ');
  const sepLine = cols.map((c) => '-'.repeat(widths.get(c) ?? c.length)).join('  ');
  const dataLines = rows.map((row) =>
    cols.map((c) => truncate(stringifyCell(row[c]), DEFAULT_MAX_CELL_WIDTH).padEnd(widths.get(c) ?? c.length)).join('  '),
  );
  return [headerLine, sepLine, ...dataLines].join('\n');
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function renderCsv(rows: ReadonlyArray<Record<string, unknown>>, columns?: ReadonlyArray<string>): string {
  if (rows.length === 0) return '';
  const cols = columns ?? Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const header = cols.map(escapeCsv).join(',');
  const lines = rows.map((row) => cols.map((c) => escapeCsv(stringifyCell(row[c]))).join(','));
  return [header, ...lines].join('\n');
}

/**
 * Detect a "rows" payload — most BuzzBit list tools return objects like
 * { customers: [...], pagination: {...} } or { orders: [...] }. We pick
 * the first array-of-objects property and render that.
 */
function findRows(payload: unknown): { rows: Record<string, unknown>[]; key: string } | null {
  if (isRowArray(payload)) return { rows: payload, key: 'rows' };
  if (!isPlainObject(payload)) return null;
  for (const [key, value] of Object.entries(payload)) {
    if (isRowArray(value)) return { rows: value, key };
  }
  return null;
}

export interface PrintOptions {
  format: OutputFormat;
  columns?: ReadonlyArray<string>;
  /** Optional secondary footer text appended after the table (e.g. pagination). */
  footer?: string;
}

export function printResult(data: unknown, opts: PrintOptions): void {
  const { format } = opts;

  if (format === 'json') {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    return;
  }

  const rows = findRows(data);
  if (!rows) {
    // Single-object result or shape we don't recognize — pretty-print.
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    return;
  }

  if (format === 'csv') {
    process.stdout.write(renderCsv(rows.rows, opts.columns) + '\n');
    return;
  }

  // table
  process.stdout.write(renderTable(rows.rows, opts.columns) + '\n');
  if (opts.footer) {
    process.stdout.write('\n' + opts.footer + '\n');
  }
}

/**
 * Helper for single-record commands (`get`, `auth status`, etc.).
 * In `table` format, renders key/value pairs; in `json`, pretty-prints.
 */
export function printRecord(data: unknown, format: OutputFormat): void {
  if (format === 'json' || !isPlainObject(data)) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    return;
  }
  const keys = Object.keys(data);
  const width = Math.max(...keys.map((k) => k.length), 1);
  for (const k of keys) {
    const v = stringifyCell(data[k]);
    process.stdout.write(`${k.padEnd(width)}  ${v}\n`);
  }
}
