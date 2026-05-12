// AUTO-GENERATED FROM MCP REGISTRY — do not edit by hand.
// Run `npm run generate:cli` to regenerate.
// Source snapshot timestamp: 2026-05-12T08:26:37.744Z

import { Command } from 'commander';
import { callTool } from '../../lib/mcpClient.js';
import { parseFormat, printResult } from '../../lib/formatter.js';

export function buildGeneratedCommand(): Command {
  const group = new Command('analytics')
    .description('Auto-generated analytics commands. 4 subcommands.');

  group.command('get-dashboard-overview')
    .description("Get workspace KPIs for the requested period: revenue, orders, customers, new customers, average order value, conversion rate, and growth deltas vs prior period.")
    .option('--period <value>', "Time window. day=1, week=7, month=30 days. Default: month. (one of: day, week, month)")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['period'] !== undefined) args['period'] = opts['period'];
      const result = await callTool('get_dashboard_overview', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-growth-metrics')
    .description("Growth deltas (revenue/orders/customers/AOV) vs prior period.")
    .option('--period <value>', "Comparison window. Default: month. (one of: day, week, month)")
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['period'] !== undefined) args['period'] = opts['period'];
      const result = await callTool('get_growth_metrics', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('get-revenue-stats')
    .description("Time-series revenue chart for the workspace over the requested window.")
    .option('--days <number>', "Number of days back from today. Default: 30.", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['days'] !== undefined) args['days'] = opts['days'];
      const result = await callTool('get_revenue_stats', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  group.command('list-saved-reports')
    .description("List saved custom reports configured in the Advanced Report Builder. Each report has a dataSource + query definition that can be re-run.")
    .option('--limit <number>', "", (v) => Number(v))
    .option('--format <fmt>', 'table | json | csv', 'json')
    .action(async (opts) => {
      const args: Record<string, unknown> = {};
      if (opts['limit'] !== undefined) args['limit'] = opts['limit'];
      const result = await callTool('list_saved_reports', args);
      printResult(result, { format: parseFormat(opts.format, 'json') });
    });

  return group;
}
