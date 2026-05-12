// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T09:10:19.960Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('billing')
    .description('Auto-generated billing commands. 3 subcommands.');

  group.command('get-payment-history')
    .description("Aggregated payment outcomes for the workspace over a lookback window: completed / failed / refunded counts, total amounts in account currency, most recent failure reason.")
    .option('--months <number>', "Lookback window in months (1-36). Default 12.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['months'] !== undefined) args['months'] = opts['months'];
      const result = await callTool('get_payment_history', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-subscription-status')
    .description("Get the workspace subscription: tier, status, current billing period, cancellation flag, last 4 digits of saved card (no full PAN or token).")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_subscription_status', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-invoices')
    .description("List invoices (PaymentRecord rows) for the workspace. Filter by status. Sensitive Cardcom identifiers are never returned.")
    .option('--status <value>', "")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['status'] !== undefined) args['status'] = opts['status'];
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_invoices', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}
