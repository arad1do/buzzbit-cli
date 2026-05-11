/**
 * `bbx finance` — receipts.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult } from '../lib/formatter.js';

function buildReceiptsCommand(): Command {
  return new Command('receipts')
    .description('List captured expense receipts')
    .option('--vendor <name>', 'Substring match on vendor name')
    .option('--category <cat>', 'Filter by category')
    .option('--since <iso>', 'Only receipts on/after this datetime')
    .option('-l, --limit <n>', 'Max rows', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { vendor?: string; category?: string; since?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.vendor) args.vendor = opts.vendor;
      if (opts.category) args.category = opts.category;
      if (opts.since) args.since = opts.since;
      const result = await callTool('list_receipts', args);
      printResult(result, {
        format: parseFormat(opts.format),
        columns: ['vendor', 'amount', 'currency', 'category', 'date'],
      });
    });
}

export function buildFinanceCommand(): Command {
  return new Command('finance')
    .description('Finance — receipts, expenses')
    .addCommand(buildReceiptsCommand());
}
