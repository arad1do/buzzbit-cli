/**
 * `bbx billing` — subscription, invoices, history.
 */

import { Command } from 'commander';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printResult, printRecord } from '../lib/formatter.js';

function buildSubscriptionCommand(): Command {
  return new Command('subscription')
    .description('Current plan, status, billing period, last 4 digits of saved card')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { format?: string }) => {
      const result = await callTool('get_subscription_status');
      printRecord(result, parseFormat(opts.format));
    });
}

function buildInvoicesCommand(): Command {
  return new Command('invoices')
    .description('List invoices (PaymentRecord rows)')
    .option('-s, --status <status>', 'PENDING | COMPLETED | FAILED | REFUNDED')
    .option('-l, --limit <n>', 'Max rows', '20')
    .option('--format <format>', 'table | json | csv', 'table')
    .action(async (opts: { status?: string; limit?: string; format?: string }) => {
      const limit = Math.min(parseInt(opts.limit ?? '20', 10) || 20, 100);
      const args: Record<string, unknown> = { limit };
      if (opts.status) args.status = opts.status;
      const result = await callTool('list_invoices', args);
      printResult(result, { format: parseFormat(opts.format) });
    });
}

function buildHistoryCommand(): Command {
  return new Command('history')
    .description('Aggregate payment outcomes over a lookback window')
    .option('--months <n>', 'Lookback in months (1-36)', '12')
    .option('--format <format>', 'table | json', 'json')
    .action(async (opts: { months?: string; format?: string }) => {
      const months = Math.max(1, Math.min(parseInt(opts.months ?? '12', 10) || 12, 36));
      const result = await callTool('get_payment_history', { months });
      printRecord(result, parseFormat(opts.format, 'json'));
    });
}

export function buildBillingCommand(): Command {
  return new Command('billing')
    .description('Subscription status, invoices, payment history')
    .addCommand(buildSubscriptionCommand())
    .addCommand(buildInvoicesCommand())
    .addCommand(buildHistoryCommand());
}
