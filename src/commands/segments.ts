/**
 * `bbx segments` — list, create, update.
 *
 * Segment definitions are JSON blobs:
 *   {
 *     "rules": [{ "field": "totalSpent", "op": "gte", "value": 500 }],
 *     "combinator": "AND"
 *   }
 *
 * The CLI accepts either inline JSON (--definition='{...}') or a path
 * (--definition-file=./vip.json).
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const SEGMENT_TABLE_COLS = ['id', 'name', 'customerCount', 'isActive', 'updatedAt'];

function loadDefinition(inline: string | undefined, file: string | undefined): Record<string, unknown> {
  let raw: string | undefined;
  if (inline) raw = inline;
  else if (file) {
    try {
      raw = readFileSync(file, 'utf8');
    } catch (err) {
      throw new ValidationError(
        `Cannot read --definition-file: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  if (!raw) throw new ValidationError('Provide --definition or --definition-file');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new ValidationError(
      `--definition must be valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ValidationError('--definition must be a JSON object with rules/combinator');
  }
  return parsed as Record<string, unknown>;
}

function buildListCommand(): Command {
  return new Command('list')
    .description('List saved segments')
    .option('-l, --limit <n>', 'Max rows (1-100)', '20')
    .option('--active', 'Only return active segments')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { limit?: string; active?: boolean; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.active) args.isActive = true;
      const result = await callTool('list_segments', args);
      printResult(result, { format: parseFormat(opts.format), columns: SEGMENT_TABLE_COLS });
    });
}

function buildCreateCommand(): Command {
  return new Command('create')
    .description('Create a new segment')
    .requiredOption('--name <name>', 'Segment name')
    .option('--description <text>', 'Optional description')
    .option('--definition <json>', 'Inline JSON rule definition')
    .option('--definition-file <path>', 'Path to a JSON rule definition file')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: {
      name: string;
      description?: string;
      definition?: string;
      definitionFile?: string;
      format?: string;
    }) => {
      const definition = loadDefinition(opts.definition, opts.definitionFile);
      const args: Record<string, unknown> = { name: opts.name, definition };
      if (opts.description) args.description = opts.description;
      const result = await callTool('create_segment', args);
      printRecord(result, parseFormat(opts.format));
    });
}

function buildUpdateCommand(): Command {
  return new Command('update')
    .description('Update an existing segment\'s name / definition')
    .argument('<id>', 'Segment id')
    .option('--name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--definition <json>', 'Inline JSON rule definition')
    .option('--definition-file <path>', 'Path to a JSON rule definition file')
    .option('--active <bool>', 'true | false')
    .option('--format <format>', 'table | json', 'table')
    .action(async (id: string, opts: {
      name?: string;
      description?: string;
      definition?: string;
      definitionFile?: string;
      active?: string;
      format?: string;
    }) => {
      if (!id) throw new ValidationError('Segment id required');
      const args: Record<string, unknown> = { segmentId: id };
      if (opts.name) args.name = opts.name;
      if (opts.description) args.description = opts.description;
      if (opts.definition || opts.definitionFile) {
        args.definition = loadDefinition(opts.definition, opts.definitionFile);
      }
      if (opts.active !== undefined) {
        args.isActive = opts.active === 'true';
      }
      const result = await callTool('update_segment', args);
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildSegmentsCommand(): Command {
  return new Command('segments')
    .description('Manage customer segments')
    .addCommand(buildListCommand())
    .addCommand(buildCreateCommand())
    .addCommand(buildUpdateCommand());
}
