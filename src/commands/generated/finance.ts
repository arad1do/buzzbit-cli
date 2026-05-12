// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.747Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('finance')
    .description('Auto-generated finance commands. 1 subcommand.');

  group.command('list-receipts')
    .description("List captured expense receipts (vendor invoices, subscriptions, ad spend). Filter by vendor, category, or")
    .option('--vendor <value>', "")
    .option('--category <value>', "")
    .option('--since <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['vendor'] !== undefined) args['vendor'] = opts['vendor'];
      if (opts['category'] !== undefined) args['category'] = opts['category'];
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_receipts', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}
