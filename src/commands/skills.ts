/**
 * `bbx skills` — Agency-tier custom skill upload.
 *
 * Talks to the REST endpoint /api/integrations/claude/skills (NOT /mcp)
 * because the skills feature is configuration, not an MCP tool call.
 * Auth is the same bearer key — the server treats it as a Claude
 * connection key and accepts it for both endpoints.
 *
 *   bbx skills list
 *   bbx skills upload --name="weekly-report" --file=./skill.md --triggers="report,weekly"
 *   bbx skills delete <id>
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { resolveAuth } from '../lib/config.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { AuthError, McpError, TransportError, ValidationError } from '../lib/errors.js';

const MAX_CONTENT_BYTES = 64 * 1024;

interface SkillRow {
  id: string;
  name: string;
  description: string | null;
  triggers: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
    .description('List uploaded custom skills')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { format?: string }) => {
      const data = await restCall<{ skills: SkillRow[] }>('GET', '/api/integrations/claude/skills');
      printResult(data, {
        format: parseFormat(opts.format),
        columns: ['name', 'description', 'triggers', 'isActive', 'updatedAt'],
      });
    });
}

function buildUploadCommand(): Command {
  return new Command('upload')
    .description('Upload (or update) a custom skill — Agency / Enterprise only')
    .requiredOption('--name <name>', 'Skill name (≤80 chars, unique per workspace)')
    .option('--file <path>', 'Path to a markdown file (.md)')
    .option('--content <text>', 'Inline markdown (alternative to --file)')
    .option('--description <text>', 'Optional one-line description')
    .option('--triggers <list>', 'Comma-separated trigger phrases')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      name: string;
      file?: string;
      content?: string;
      description?: string;
      triggers?: string;
      format?: string;
    }) => {
      let content = opts.content;
      if (opts.file) {
        try {
          content = readFileSync(opts.file, 'utf8');
        } catch (err) {
          throw new ValidationError(
            `Cannot read --file: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
      if (!content) throw new ValidationError('Provide --file or --content');
      if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
        throw new ValidationError(`Skill content exceeds ${MAX_CONTENT_BYTES} bytes`);
      }
      const triggers = (opts.triggers ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const body: Record<string, unknown> = { name: opts.name, content };
      if (opts.description) body.description = opts.description;
      if (triggers.length > 0) body.triggers = triggers;

      const result = await restCall<SkillRow>('POST', '/api/integrations/claude/skills', body);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete a custom skill')
    .argument('<id>', 'Skill id')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: { format?: string }) => {
      if (!id) throw new ValidationError('Skill id required');
      const result = await restCall<{ id: string; deleted: boolean }>(
        'DELETE',
        `/api/integrations/claude/skills/${encodeURIComponent(id)}`,
      );
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildSkillsCommand(): Command {
  return new Command('skills')
    .description('Upload and manage Agency-tier custom skills')
    .addCommand(buildListCommand())
    .addCommand(buildUploadCommand())
    .addCommand(buildDeleteCommand());
}
