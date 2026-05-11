/**
 * Persistent config for bbx — stores the merchant's API key and active
 * workspace ID under ~/.buzzbit/config.json. File is created on first
 * `bbx auth login` and read on every command.
 *
 * Permissions: 0600 (owner read/write only). We refuse to use the key
 * if the file is group/world readable on POSIX.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync, chmodSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

const CONFIG_DIR = join(homedir(), '.buzzbit');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_API_URL = 'https://api.buzzbitx.com';

export interface CliConfig {
  apiUrl: string;
  apiKey: string | null;
  activeWorkspaceLabel: string | null;
  // Multi-workspace: keys keyed by workspace label
  workspaces: Record<string, { apiKey: string; apiUrl: string }>;
}

const DEFAULT_CONFIG: CliConfig = {
  apiUrl: DEFAULT_API_URL,
  apiKey: null,
  activeWorkspaceLabel: null,
  workspaces: {},
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ensureDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
    if (platform() !== 'win32') {
      chmodSync(CONFIG_DIR, 0o700);
    }
  }
}

function parseWorkspaces(raw: unknown): CliConfig['workspaces'] {
  if (!isPlainObject(raw)) return {};
  const out: CliConfig['workspaces'] = {};
  for (const [label, value] of Object.entries(raw)) {
    if (
      isPlainObject(value) &&
      typeof value.apiKey === 'string' &&
      typeof value.apiUrl === 'string'
    ) {
      out[label] = { apiKey: value.apiKey, apiUrl: value.apiUrl };
    }
  }
  return out;
}

function parseConfig(raw: unknown): CliConfig {
  if (!isPlainObject(raw)) return { ...DEFAULT_CONFIG };
  return {
    apiUrl: typeof raw.apiUrl === 'string' ? raw.apiUrl : DEFAULT_API_URL,
    apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : null,
    activeWorkspaceLabel:
      typeof raw.activeWorkspaceLabel === 'string' ? raw.activeWorkspaceLabel : null,
    workspaces: parseWorkspaces(raw.workspaces),
  };
}

export function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return { ...DEFAULT_CONFIG };
  try {
    const text = readFileSync(CONFIG_FILE, 'utf8');
    const parsed: unknown = JSON.parse(text);
    return parseConfig(parsed);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(cfg: CliConfig): void {
  ensureDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { encoding: 'utf8' });
  if (platform() !== 'win32') {
    chmodSync(CONFIG_FILE, 0o600);
  }
}

export function configPath(): string {
  return CONFIG_FILE;
}

/**
 * Returns the active key + URL the CLI should use for this command.
 * Resolution order:
 *   1. BBX_API_KEY env var (with optional BBX_API_URL)
 *   2. activeWorkspaceLabel → workspaces[label]
 *   3. top-level apiKey / apiUrl (single-workspace mode)
 */
export function resolveAuth(): { apiKey: string | null; apiUrl: string } {
  const envKey = process.env.BBX_API_KEY;
  const envUrl = process.env.BBX_API_URL;
  if (envKey) {
    return { apiKey: envKey, apiUrl: envUrl ?? DEFAULT_API_URL };
  }
  const cfg = loadConfig();
  if (cfg.activeWorkspaceLabel && cfg.workspaces[cfg.activeWorkspaceLabel]) {
    const ws = cfg.workspaces[cfg.activeWorkspaceLabel];
    return { apiKey: ws.apiKey, apiUrl: ws.apiUrl };
  }
  return { apiKey: cfg.apiKey, apiUrl: cfg.apiUrl };
}

export function warnIfWorldReadable(): void {
  if (platform() === 'win32') return;
  if (!existsSync(CONFIG_FILE)) return;
  try {
    const stats = statSync(CONFIG_FILE);
    // eslint-disable-next-line no-bitwise
    const mode = stats.mode & 0o777;
    if (mode & 0o077) {
      process.stderr.write(
        `Warning: ${CONFIG_FILE} is group/world readable (mode ${mode.toString(8)}). ` +
          `Run: chmod 600 ${CONFIG_FILE}\n`,
      );
    }
  } catch {
    // Ignore — best-effort warning only.
  }
}
