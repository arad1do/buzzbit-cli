/**
 * `bbx aliases` — manage per-workspace tool aliases.
 *
 * Uses the REST endpoints at /api/integrations/claude/aliases (NOT /mcp)
 * because aliases are configuration of the MCP server, not an MCP tool.
 * Same bearer key works.
 *
 *   bbx aliases list
 *   bbx aliases create --canonical=list_customers --alias=find_customers
 *   bbx aliases delete <id>
 */

import { Command } from 'commander';
import { resolveAuth } from '../lib/config.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { AuthError, McpError, TransportError, ValidationError } from '../lib/errors.js';

interface AliasRow {
  id: string;
  canonical: string;
  alias: string;
  createdAt: string;
}

interface Envelope<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

function isEnvelope<T>(value: unknown): value is Envelope<T> {
  return typeof value === 'object' && value !== null && 'success' in value;
}

async function restCall<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const { apiKey, apiUrl } = resolveAuth();
  if (!apiKey) throw new AuthError('Not authenticated. Run: bbx auth login --key=…');

  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/+$/, '')}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new TransportError(err instanceof Error ? err.message : String(err));
  }

  const text = await response.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    if (isEnvelope(parsed) && parsed.error) {
      throw new McpError(parsed.error.message, parsed.error.code);
    }
    throw new McpError(`HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  if (!isEnvelope<T>(parsed) || !parsed.success) {
    throw new McpError('Unexpected response shape');
  }
  return parsed.data;
}

function buildListCommand(): Command {
  return new Command('list')
    .description('List per-workspace tool aliases')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { format?: string }) => {
      const data = await restCall<{ aliases: AliasRow[] }>('GET', '/api/integrations/claude/aliases');
      printResult(data, {
        format: parseFormat(opts.format),
        columns: ['canonical', 'alias', 'createdAt'],
      });
    });
}

function buildCreateCommand(): Command {
  return new Command('create')
    .description('Create an alias for an existing tool')
    .requiredOption('--canonical <name>', 'Canonical tool name (e.g. list_customers)')
    .requiredOption('--alias <name>', 'Per-workspace alias (alphanumeric, _-, ≤64 chars)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { canonical: string; alias: string; format?: string }) => {
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(opts.alias)) {
        throw new ValidationError('--alias must match ^[a-zA-Z0-9_-]{1,64}$');
      }
      const data = await restCall<AliasRow>('POST', '/api/integrations/claude/aliases', {
        canonical: opts.canonical,
        alias: opts.alias,
      });
      printRecord(data, parseFormat(opts.format));
    });
}

function buildDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete an alias by id')
    .argument('<id>', 'Alias id (from `bbx aliases list`)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Alias id required');
      const data = await restCall<{ id: string; deleted: boolean }>(
        'DELETE',
        `/api/integrations/claude/aliases/${encodeURIComponent(id)}`,
      );
      printRecord(data, parseFormat(opts.format));
    });
}

export function buildAliasesCommand(): Command {
  return new Command('aliases')
    .description('Rename MCP tools per-workspace (e.g. Hebrew or local-language aliases)')
    .addCommand(buildListCommand())
    .addCommand(buildCreateCommand())
    .addCommand(buildDeleteCommand());
}
