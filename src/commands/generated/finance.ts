// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T10:21:33.532Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('finance')
    .description('Auto-generated finance commands. 4 subcommands.');

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

  group.command('get-overview')
    .description("YTD finance tiles for the Business Hub Finance tab: YTD revenue, YTD net profit, YTD ad spend, avg margin. Pure aggregates — for the full P&L breakdown use get_pnl_summary.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      const result = await callTool('get_finance_overview', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-pnl-summary')
    .description("Profit & Loss summary for a window: Revenue − COGS − Ad Spend − OpEx = Net Profit. Defaults to YTD. Returns each line item separately so Claude can answer follow-ups like")
    .option('--since <value>', "Window start (ISO 8601). Default: start of current calendar year.")
    .option('--until <value>', "Window end (ISO 8601). Default: now.")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      const result = await callTool('get_pnl_summary', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-revenue-by-channel')
    .description("Attributed revenue per marketing channel for a window. Each channel returns total attributed revenue, total spend across its campaigns, ROAS, and order count.")
    .option('--since <value>', "")
    .option('--until <value>', "")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['since'] !== undefined) args['since'] = opts['since'];
      if (opts['until'] !== undefined) args['until'] = opts['until'];
      const result = await callTool('get_revenue_by_channel', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}
