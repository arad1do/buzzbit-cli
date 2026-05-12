// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.759Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('segments')
    .description('Auto-generated segments commands. 3 subcommands.');

  group.command('create-segment')
    .description("Create a new customer segment in this workspace from a rules-based definition.")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--definition <json>', "Rules + combinator. See list_segments for the field/operator vocabulary. (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['definition'] !== undefined) args['definition'] = opts['definition'];
      const result = await callTool('create_segment', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list')
    .description("List segments in the current workspace with definition, customer count, and status.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('list_segments', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('update-segment')
    .description("Update an existing segment (name/description/definition/isActive). Workspace-scoped.")
    .option('--segment-id <value>', "")
    .option('--name <value>', "")
    .option('--description <value>', "")
    .option('--definition <json>', "JSON value (JSON string, parsed before send)", (v) => JSON.parse(v))
    .option('--is-active', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['segmentId'] !== undefined) args['segmentId'] = opts['segmentId'];
      if (opts['name'] !== undefined) args['name'] = opts['name'];
      if (opts['description'] !== undefined) args['description'] = opts['description'];
      if (opts['definition'] !== undefined) args['definition'] = opts['definition'];
      if (opts['isActive'] !== undefined) args['isActive'] = opts['isActive'];
      const result = await callTool('update_segment', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}
