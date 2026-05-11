/**
 * `bbx auth` — login, logout, status.
 *
 * V0.1 ships direct-paste login (`--key=bz_live_…`) per the PRD §4.4
 * default. Browser OAuth flow lands in v0.2.
 */

import { Command } from 'commander';
import { loadConfig, saveConfig, configPath, resolveAuth, warnIfWorldReadable } from '../lib/config.js';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const KEY_PATTERN = /^bz_live_[A-Za-z0-9]{16,}$/;

interface WorkspaceLimits {
  tier?: string;
  workspaceId?: string;
  workspaceName?: string;
  quota?: Record<string, number>;
}

function buildLoginCommand(): Command {
  return new Command('login')
    .description('Save a BuzzBit API key for this user')
    .option('--key <key>', 'API key (bz_live_…)')
    .option('--url <url>', 'API base URL (default https://api.buzzbitx.com)')
    .option('--label <label>', 'Workspace label for multi-workspace mode')
    .action(async (opts: { key?: string; url?: string; label?: string }) => {
      const key = opts.key?.trim();
      if (!key) {
        throw new ValidationError('--key is required. Generate one at https://buzzbitx.com/settings/integrations');
      }
      if (!KEY_PATTERN.test(key)) {
        throw new ValidationError('Key does not match expected format (bz_live_<hex>).');
      }
      const url = opts.url?.trim() || 'https://api.buzzbitx.com';
      const cfg = loadConfig();

      if (opts.label) {
        cfg.workspaces[opts.label] = { apiKey: key, apiUrl: url };
        cfg.activeWorkspaceLabel = opts.label;
      } else {
        cfg.apiKey = key;
        cfg.apiUrl = url;
        cfg.activeWorkspaceLabel = null;
      }
      saveConfig(cfg);
      warnIfWorldReadable();
      process.stdout.write(
        `Saved key for ${opts.label ?? 'default workspace'} to ${configPath()}.\n` +
          `Run \`bbx auth status\` to verify.\n`,
      );
    });
}

function buildLogoutCommand(): Command {
  return new Command('logout')
    .description('Remove saved key(s)')
    .option('--label <label>', 'Only remove a specific workspace label')
    .option('--all', 'Remove every saved workspace')
    .action(async (opts: { label?: string; all?: boolean }) => {
      const cfg = loadConfig();
      if (opts.all) {
        cfg.apiKey = null;
        cfg.workspaces = {};
        cfg.activeWorkspaceLabel = null;
      } else if (opts.label) {
        delete cfg.workspaces[opts.label];
        if (cfg.activeWorkspaceLabel === opts.label) cfg.activeWorkspaceLabel = null;
      } else {
        cfg.apiKey = null;
        cfg.activeWorkspaceLabel = null;
      }
      saveConfig(cfg);
      process.stdout.write('Logged out.\n');
    });
}

function buildStatusCommand(): Command {
  return new Command('status')
    .description('Show the active key and verify it against the server')
    .option('--format <format>', 'Output format: table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const format = parseFormat(opts.format);
      const { apiKey, apiUrl } = resolveAuth();
      if (!apiKey) {
        printRecord({ authenticated: false, configPath: configPath() }, format);
        return;
      }
      const masked = apiKey.slice(0, 12) + '…';
      try {
        const limits = await callTool<WorkspaceLimits>('get_workspace_limits');
        printRecord(
          {
            authenticated: true,
            apiUrl,
            apiKey: masked,
            tier: limits.tier ?? 'unknown',
            workspaceId: limits.workspaceId ?? 'unknown',
            workspaceName: limits.workspaceName ?? 'unknown',
          },
          format,
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        printRecord({ authenticated: true, apiUrl, apiKey: masked, error: msg }, format);
      }
    });
}

function buildUseCommand(): Command {
  return new Command('use')
    .description('Switch the active workspace label (multi-workspace mode)')
    .argument('<label>', 'Workspace label previously saved with `bbx auth login --label`')
    .action(async (label: string) => {
      const cfg = loadConfig();
      if (!cfg.workspaces[label]) {
        throw new ValidationError(
          `No workspace labeled "${label}". Run: bbx auth login --label=${label} --key=…`,
        );
      }
      cfg.activeWorkspaceLabel = label;
      saveConfig(cfg);
      process.stdout.write(`Active workspace: ${label}\n`);
    });
}

function buildListWorkspacesCommand(): Command {
  return new Command('list')
    .description('List saved workspace labels')
    .action(async () => {
      const cfg = loadConfig();
      const labels = Object.keys(cfg.workspaces);
      if (labels.length === 0 && !cfg.apiKey) {
        process.stdout.write('(no saved keys)\n');
        return;
      }
      if (cfg.apiKey) {
        process.stdout.write(`(default)${cfg.activeWorkspaceLabel ? '' : '  ← active'}\n`);
      }
      for (const label of labels) {
        const active = cfg.activeWorkspaceLabel === label ? '  ← active' : '';
        process.stdout.write(`${label}${active}\n`);
      }
    });
}

export function buildAuthCommand(): Command {
  return new Command('auth')
    .description('Manage BuzzBit API keys and active workspace')
    .addCommand(buildLoginCommand())
    .addCommand(buildLogoutCommand())
    .addCommand(buildStatusCommand())
    .addCommand(buildUseCommand())
    .addCommand(buildListWorkspacesCommand());
}
