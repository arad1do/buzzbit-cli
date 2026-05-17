/**
 * `bbx segments` — list, create, update.
 *
 * Segment definitions are JSON blobs (note: server requires "operator", NOT "op"):
 *   {
 *     "rules": [
 *       { "field": "totalSpent", "operator": "greater_than", "value": 500 }
 *     ],
 *     "combinator": "AND"   // optional, defaults to AND
 *   }
 *
 * Valid operators per field type (canonical, server-side):
 *   number  : equals, not_equals, greater_than, less_than, greater_or_equal, less_or_equal
 *   date    : before, after, equals
 *   string  : equals, not_equals, contains, not_contains
 *   boolean : equals
 *   array   : contains, not_contains
 *
 * Symbolic operators (>, <, =, etc.) are NOT accepted — the server throws an
 * error rather than silently dropping the rule (which used to produce a
 * segment matching every customer).
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

const NUMERIC_OPS = ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'] as const;
const DATE_OPS = ['before', 'after', 'equals'] as const;
const STRING_OPS = ['equals', 'not_equals', 'contains', 'not_contains'] as const;
const BOOLEAN_OPS = ['equals'] as const;
const ARRAY_OPS = ['contains', 'not_contains'] as const;
const ALL_OPS = Array.from(
  new Set<string>([...NUMERIC_OPS, ...DATE_OPS, ...STRING_OPS, ...BOOLEAN_OPS, ...ARRAY_OPS]),
);

const DEFINITION_HELP = `Inline JSON, e.g. '{"rules":[{"field":"totalSpent","operator":"greater_than","value":100}],"combinator":"AND"}'. ` +
  `Valid operators: ${ALL_OPS.join(', ')}. Symbolic (>, <, =) are NOT accepted.`;

/**
 * Defensive client-side check on the segment definition shape. Catches the
 * three most common mistakes (`op` instead of `operator`, missing `rules`,
 * symbolic operator) before the request hits the network so the user gets
 * a clean message instead of a generic server error.
 */
function validateDefinitionShape(parsed: Record<string, unknown>): void {
  if (!('rules' in parsed) || !Array.isArray(parsed.rules)) {
    throw new ValidationError('Definition must be an object with a `rules` array.');
  }
  if ((parsed.rules as unknown[]).length === 0) {
    throw new ValidationError('Definition `rules` must contain at least one rule.');
  }
  for (const [i, ruleUnknown] of (parsed.rules as unknown[]).entries()) {
    if (typeof ruleUnknown !== 'object' || ruleUnknown === null) {
      throw new ValidationError(`Rule ${i} must be an object.`);
    }
    const rule = ruleUnknown as Record<string, unknown>;
    if ('op' in rule && !('operator' in rule)) {
      throw new ValidationError(
        `Rule ${i} uses 'op' — the server expects 'operator'. Rename the key.`,
      );
    }
    if (!('operator' in rule)) {
      throw new ValidationError(
        `Rule ${i} is missing 'operator' (one of: ${ALL_OPS.join(', ')}).`,
      );
    }
    if (!('field' in rule)) {
      throw new ValidationError(`Rule ${i} is missing 'field'.`);
    }
    if (typeof rule.operator === 'string' && /^[<>=!]+$/.test(rule.operator)) {
      throw new ValidationError(
        `Rule ${i} uses symbolic operator '${rule.operator}'. Use a named operator: ${ALL_OPS.join(', ')}.`,
      );
    }
  }
  if ('combinator' in parsed && parsed.combinator !== 'AND' && parsed.combinator !== 'OR') {
    throw new ValidationError(
      `combinator must be 'AND' or 'OR' (got '${String(parsed.combinator)}').`,
    );
  }
}

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
  validateDefinitionShape(parsed as Record<string, unknown>);
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
    .option('--definition <json>', DEFINITION_HELP)
    .option('--definition-file <path>', 'Path to a JSON rule definition file (same shape as --definition)')
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
    .option('--definition <json>', DEFINITION_HELP)
    .option('--definition-file <path>', 'Path to a JSON rule definition file (same shape as --definition)')
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
